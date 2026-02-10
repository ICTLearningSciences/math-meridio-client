/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef, useState } from 'react';
import { RoomActionQueueEntry } from '../../room-action-api';
import { GameData, GameStateData, Room } from '../../store/slices/game';
import * as roomActionApi from '../../room-action-api';
import { v4 as uuidv4 } from 'uuid';
import * as roomApi from '../../room-action-api';
import {
  processActionUpdatePlayerStateDataAction,
  processPlayerJoinsRoomAction,
  processPlayerLeavesRoomAction,
  processPlayerSentMessageAction,
} from './user-action-pure-functions';
import {
  DiscussionStage,
  DiscussionStageStep,
} from '../../components/discussion-stage-builder/types';
import { fetchPlayer, fetchPlayers } from '../../api';
import { Player } from '../../store/slices/player/types';

/**
 *
 */
export function useWithProcessingRoomActions(
  setLocalGameData: React.Dispatch<React.SetStateAction<GameData | undefined>>,
  gameDataRef: React.MutableRefObject<GameData | undefined>,
  discussionStages: DiscussionStage[],
  roomOwner: boolean,
  roomId?: string
) {
  const localActionQueue = useRef<RoomActionQueueEntry[]>([]);

  function getCurStep(
    gameData: GameData,
    discussionStages: DiscussionStage[]
  ): DiscussionStageStep {
    const curStage = discussionStages.find(
      (stage) => stage._id === gameData.globalStateData.curStageId
    );
    if (!curStage) {
      throw new Error('No stage found');
    }
    const curFlow = curStage.flowsList.find((flow) =>
      flow.steps.find(
        (step) => step.stepId === gameData.globalStateData.curStepId
      )
    );
    if (!curFlow) {
      throw new Error('No flow found');
    }
    const curStep = curFlow.steps.find(
      (step) => step.stepId === gameData.globalStateData.curStepId
    );
    if (!curStep) {
      throw new Error('No step found in flow');
    }
    return curStep;
  }

  useEffect(() => {
    if (!roomId || !roomOwner) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const heartBeatsAndActions =
          await roomApi.fetchRoomHeartBeatsAndActions(roomId);

        if (cancelled) return;
        const pulledActions = heartBeatsAndActions.actions.filter(
          (action) => action.processedAt === null
        );
        const localActions = localActionQueue.current.filter(
          (action) => action.processedAt === null
        );
        const actionsToProcess = [...pulledActions, ...localActions].sort(
          (a, b) => a.actionSentAt.getTime() - b.actionSentAt.getTime()
        );
        gameDataRef.current = await processActions(
          gameDataRef,
          discussionStages,
          actionsToProcess,
          roomId
        );
        setLocalGameData(gameDataRef.current);
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
  }, [roomId, discussionStages]);

  async function processActions(
    gameDataRef: React.MutableRefObject<GameData | undefined>,
    discussionStages: DiscussionStage[],
    actionsToProcess: RoomActionQueueEntry[],
    targetRoomId: string
  ): Promise<GameData> {
    const dataPreModification = gameDataRef.current;
    if (!gameDataRef.current) {
      throw new Error('No game data found');
    }
    for (const action of actionsToProcess) {
      console.log('processing action', action);
      switch (action.actionType) {
        case roomActionApi.RoomActionType.SEND_MESSAGE: {
          const curStep = getCurStep(gameDataRef.current, discussionStages);
          gameDataRef.current = processPlayerSentMessageAction(
            gameDataRef.current,
            curStep,
            action
          );
          break;
        }
        case roomActionApi.RoomActionType.LEAVE_ROOM:
          gameDataRef.current = processPlayerLeavesRoomAction(
            gameDataRef.current,
            action
          );
          break;
        case roomActionApi.RoomActionType.JOIN_ROOM: {
          const requestingPlayer = await fetchPlayer(action.playerId);
          gameDataRef.current = processPlayerJoinsRoomAction(
            gameDataRef.current,
            action,
            requestingPlayer
          );
          break;
        }
        case roomActionApi.RoomActionType.UPDATE_ROOM:
          gameDataRef.current = processActionUpdatePlayerStateDataAction(
            gameDataRef.current,
            action
          );
          break;
        default:
          throw new Error(`Unknown action type: ${action.actionType}`);
      }
    }
    // Notify cloud of processed actions.
    const cloudActionsToSync = actionsToProcess.filter(
      (action) => action.source !== 'local'
    );
    if (cloudActionsToSync.length > 0) {
      notifyOfProcessedActions(
        cloudActionsToSync.map((action) => action._id),
        true
      );
    }
    // Remove processed actions from the local action queue.
    localActionQueue.current = localActionQueue.current.filter(
      (action) => !actionsToProcess.includes(action)
    );
    // Sync any changes to the cloud;
    const dataPostModification = gameDataRef.current;
    if (
      JSON.stringify(dataPostModification) ===
      JSON.stringify(dataPreModification)
    ) {
      console.log('No changes were made to the game data, not syncing.');
    } else {
      console.log('Changes were made to the game data, saving to the cloud');
      if (!targetRoomId) {
        throw new Error('No room id found for syncing to backend');
      }
      await roomActionApi.syncRoomData(
        targetRoomId || roomId || '',
        dataPostModification
      );
    }
    return gameDataRef.current;
  }

  async function submitRoomAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    actionType: roomActionApi.RoomActionType,
    payload: string,
    actionSentAt: Date
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
      // Room owner actions are handled right away, they do not go to the cloud.
      gameDataRef.current = await processActions(
        gameDataRef,
        discussionStages,
        [action],
        room._id
      );
      setLocalGameData(gameDataRef.current);
      return await Promise.resolve();
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
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.JOIN_ROOM,
      '',
      newDate
    );
  }

  async function submitLeaveRoomAction(
    room: Room,
    isRoomAuthoritativeClient: boolean
  ) {
    const newDate = new Date();
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.LEAVE_ROOM,
      '',
      newDate
    );
  }

  async function submitSendMessageAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    message: string
  ) {
    const newDate = new Date();
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.SEND_MESSAGE,
      message,
      newDate
    );
  }

  async function submitUpdateMyPlayerDataAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    newPlayerData: GameStateData[]
  ) {
    const newDate = new Date();
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.UPDATE_ROOM,
      JSON.stringify(newPlayerData),
      newDate
    );
  }

  return {
    localActionQueue,
    notifyOfProcessedActions,
    submitJoinRoomAction,
    submitLeaveRoomAction,
    submitSendMessageAction,
    submitUpdateMyPlayerDataAction,
  };
}
