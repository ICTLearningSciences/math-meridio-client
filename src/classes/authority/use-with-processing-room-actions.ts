/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef } from 'react';
import { RoomActionQueueEntry } from '../../room-action-api';
import { GameData, GameStateData, Room } from '../../store/slices/game';
import * as roomActionApi from '../../room-action-api';
import { v4 as uuidv4 } from 'uuid';
import * as roomApi from '../../room-action-api';
import {
  getCurStageAndStep,
  processActions,
} from './user-action-pure-functions';
import {
  DiscussionStage,
  isDiscussionStage,
} from '../../components/discussion-stage-builder/types';
import { useWithConfig } from '../../store/slices/config/use-with-config';
import {
  isDiscussionStageStepComplete,
  isSimulationStageComplete,
  processCurStep,
} from './step-process-pure-functions';
import { updateGameDataWithNextStep } from './pure-state-modifiers';
import { AbstractGameData } from '../abstract-game-data';
import { getSimulationViewedKey } from '../../types';

export function useWithProcessingRoomActions(
  setLocalGameData: React.Dispatch<React.SetStateAction<GameData | undefined>>,
  gameDataRef: React.MutableRefObject<GameData | undefined>,
  discussionStages: DiscussionStage[],
  roomOwner: boolean,
  setResponsePending: (pending: boolean) => void,
  roomId?: string,
  gameDataClass?: AbstractGameData
) {
  const localActionQueue = useRef<RoomActionQueueEntry[]>([]);
  const { firstAvailableAzureServiceModel } = useWithConfig();

  function addToLocalActionQueue(action: RoomActionQueueEntry) {
    localActionQueue.current = [...localActionQueue.current, action];
  }

  async function processActionsAndCurStep(
    cloudActions: RoomActionQueueEntry[],
    roomId: string,
    cancelled: boolean,
    gameDataClass: AbstractGameData
  ) {
    if (cancelled) return;
    if (!gameDataRef.current) {
      throw new Error('No game data found for processActionsAndCurStep');
    }
    const { curStep } = getCurStageAndStep(
      gameDataRef.current,
      discussionStages
    );
    const curStage = gameDataClass.stageList.find(
      (stage) => stage.id === gameDataRef?.current?.globalStateData.curStageId
    );
    if (!curStage) {
      throw new Error('No gameDataClass stage found');
    }
    const dataPreModification = JSON.stringify(gameDataRef.current);
    const localActions = localActionQueue.current.filter(
      (action) => action.processedAt === null
    );
    const actionsToProcess = [...cloudActions, ...localActions].sort(
      (a, b) => a.actionSentAt.getTime() - b.actionSentAt.getTime()
    );
    gameDataRef.current = await processActions(
      gameDataRef,
      discussionStages,
      actionsToProcess,
      setResponsePending
    );

    // Process the current step.
    // TODO: Probably need to check if we've already process the current step, so we don't process again (particularly for request user input steps.)

    // Tech Debt: should not be defaulting to the room owner id, should be the player id that sent the message (but how to handle case of multiple users?)
    gameDataRef.current = await processCurStep(
      gameDataRef,
      discussionStages,
      setResponsePending,
      firstAvailableAzureServiceModel(),
      gameDataRef.current.globalStateData.roomOwnerId
    );
    const stepIsComplete = isDiscussionStage(curStage.stage)
      ? await isDiscussionStageStepComplete(gameDataRef, discussionStages)
      : await isSimulationStageComplete(gameDataRef);

    if (stepIsComplete) {
      gameDataRef.current = updateGameDataWithNextStep(
        gameDataRef.current,
        curStage,
        curStep
      );
    }

    setLocalGameData(gameDataRef.current);

    // Cleanup
    // Remove processed actions from the local action queue.
    localActionQueue.current = localActionQueue.current.filter(
      (action) => !actionsToProcess.includes(action)
    );
    // Notify cloud of processed actions.
    const cloudActionsToSync = actionsToProcess.filter(
      (action) => action.source !== 'local'
    );
    if (cloudActionsToSync.length > 0) {
      await notifyOfProcessedActions(
        cloudActionsToSync.map((action) => action._id),
        true
      );
    }
    // Sync any changes to the game state to the cloud
    const dataPostModification = JSON.stringify(gameDataRef.current);
    if (dataPostModification === dataPreModification) {
      console.log('No changes were made to the game data, not syncing.');
    } else {
      console.log('Changes were made to the game data, saving to the cloud');
      await roomActionApi.syncRoomData(roomId, gameDataRef.current);
    }
  }

  useEffect(() => {
    if (!roomId || !roomOwner || !gameDataClass) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const heartBeatsAndActions =
          await roomApi.fetchRoomHeartBeatsAndActions(roomId);
        await processActionsAndCurStep(
          heartBeatsAndActions.actions,
          roomId,
          cancelled,
          gameDataClass
        );
        timeoutId = setTimeout(poll, 1000);
      } catch (err) {
        console.error(err);
        timeoutId = setTimeout(poll, 5000);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roomId, discussionStages, gameDataClass]);

  async function submitRoomAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    actionType: roomActionApi.RoomActionType,
    payload: string,
    actionSentAt: Date,
    gameDataClass: AbstractGameData
  ): Promise<void> {
    if (isRoomAuthoritativeClient) {
      const action: RoomActionQueueEntry = {
        _id: uuidv4(),
        roomId: room._id,
        playerId: room.gameData.globalStateData.roomOwnerId,
        actionType: actionType,
        payload: payload,
        actionSentAt: actionSentAt,
        processedAt: null,
        source: 'local',
      };
      if (!gameDataClass) {
        throw new Error('Game data class not found for submitRoomAction');
      }
      // Room owner actions are handled right away, they do not go to the cloud.
      addToLocalActionQueue(action);
      return await processActionsAndCurStep(
        [action],
        room._id,
        false,
        gameDataClass
      );
    }

    // Non-room owners submit the action to the cloud for the room owner to process.
    return await roomActionApi.submitRoomAction(
      room._id,
      actionType,
      payload,
      actionSentAt
    );
  }

  async function notifyOfProcessedActions(
    processedActionIds: string[],
    isRoomAuthoritativeClient: boolean
  ): Promise<void> {
    if (!isRoomAuthoritativeClient) {
      console.log('Non-room owners cannot submit processed actions');
      return;
    }
    // Room owners manage the queue, submit the processed actions to the cloud and update local game data.
    localActionQueue.current = localActionQueue.current.filter(
      (prevAction) => !processedActionIds.includes(prevAction._id)
    );
    await roomActionApi.notifyOfProcessedActions(processedActionIds);
  }

  async function submitJoinRoomAction(
    room: Room,
    isRoomAuthoritativeClient: boolean
  ) {
    const newDate = new Date();
    if (!gameDataClass) {
      throw new Error('Game data class not found for submitJoinRoomAction');
    }
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.JOIN_ROOM,
      '',
      newDate,
      gameDataClass
    );
  }

  async function submitLeaveRoomAction(
    room: Room,
    isRoomAuthoritativeClient: boolean
  ) {
    const newDate = new Date();
    if (!gameDataClass) {
      throw new Error('Game data class not found for submitLeaveRoomAction');
    }
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.LEAVE_ROOM,
      '',
      newDate,
      gameDataClass
    );
  }

  async function submitSendMessageAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    message: string
  ) {
    const newDate = new Date();
    if (!gameDataClass) {
      throw new Error('Game data class not found for submitSendMessageAction');
    }
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.SEND_MESSAGE,
      message,
      newDate,
      gameDataClass
    );
  }

  async function submitUpdateMyPlayerDataAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    newPlayerData: GameStateData[]
  ) {
    const newDate = new Date();
    if (!gameDataClass) {
      throw new Error(
        'Game data class not found for submitUpdateMyPlayerDataAction'
      );
    }
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.UPDATE_ROOM,
      JSON.stringify(newPlayerData),
      newDate,
      gameDataClass
    );
  }

  async function submitViewedSimulationAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    stageId: string
  ) {
    const newDate = new Date();
    if (!gameDataClass) {
      throw new Error(
        'Game data class not found for submitViewedSimulationAction'
      );
    }
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.UPDATE_ROOM,
      JSON.stringify([{ key: getSimulationViewedKey(stageId), value: true }]),
      newDate,
      gameDataClass
    );
  }

  return {
    localActionQueue,
    notifyOfProcessedActions,
    submitJoinRoomAction,
    submitLeaveRoomAction,
    submitSendMessageAction,
    submitUpdateMyPlayerDataAction,
    submitViewedSimulationAction,
  };
}
