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
  DiscussionStageStepType,
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
import { getGameDataCopy } from './state-modifier-helpers';

export function useWithProcessingRoomActions(
  setLocalGameData: React.Dispatch<React.SetStateAction<GameData | undefined>>,
  gameDataRef: React.MutableRefObject<GameData | undefined>,
  discussionStages: DiscussionStage[],
  roomOwner: boolean,
  setResponsePending: (pending: boolean) => void,
  roomId?: string,
  gameDataClassRef?: React.MutableRefObject<AbstractGameData | undefined>
) {
  const localActionQueue = useRef<RoomActionQueueEntry[]>([]);
  const processedActionIds = useRef<Set<string>>(new Set());
  const { firstAvailableAzureServiceModel } = useWithConfig();

  // Processing lock to prevent concurrent execution
  const processingLock = useRef<boolean>(false);

  // Track the last processed step to prevent immediate re-processing
  // Format: "stageId:stepIndex:lastActionCount"
  const lastProcessedStepKey = useRef<string | null>(null);

  function addToLocalActionQueue(action: RoomActionQueueEntry) {
    localActionQueue.current = [...localActionQueue.current, action];
  }

  async function processActionsAndCurStep(
    cloudActions: RoomActionQueueEntry[],
    roomId: string,
    cancelled: boolean
  ) {
    console.log('Starting processActionsAndCurStep');
    if (cancelled) {
      console.log('Not processing room actions and steps because cancelled');
      return;
    }

    // Prevent concurrent execution - if already processing, skip this cycle
    if (processingLock.current) {
      console.log(
        '[ProcessingFlow] Already processing, skipping this cycle to prevent concurrent execution'
      );
      return;
    }

    if (!gameDataRef.current) {
      throw new Error('No game data found for processActionsAndCurStep');
    }

    // Acquire the processing lock
    processingLock.current = true;

    try {
      console.log(
        'processing room actions and steps',
        gameDataRef.current,
        discussionStages
      );
      const { curStep } = getCurStageAndStep(
        gameDataRef.current,
        discussionStages
      );
      const curStage = gameDataClassRef?.current?.stageList.find(
        (stage) =>
          stage.stage.clientId ===
          gameDataRef?.current?.globalStateData.curStageId
      );
      if (!curStage) {
        throw new Error('No gameDataClass stage found');
      }

      const dataPreModification = JSON.stringify(gameDataRef.current);
      const localActions = localActionQueue.current.filter(
        (action) => action.processedAt === null
      );
      const actionsToProcess = [...cloudActions, ...localActions]
        .filter((action) => !processedActionIds.current.has(action._id))
        .sort((a, b) => a.actionSentAt.getTime() - b.actionSentAt.getTime());

      // Create a key for the current step and action count
      const currentStepKey = `${gameDataRef.current.globalStateData.curStageId}:${gameDataRef.current.globalStateData.curStepId}:${actionsToProcess.length}`;

      // Check if we're about to process the exact same step with no new actions
      if (
        lastProcessedStepKey.current === currentStepKey &&
        actionsToProcess.length === 0
      ) {
        console.log(
          '[ProcessingFlow] Same step with no new actions, skipping to prevent redundant processing'
        );
        return;
      }

      console.log(
        `[ProcessingFlow] Starting processing cycle - Stage: ${curStage.id}, Step: ${gameDataRef.current.globalStateData.curStepId}, Actions: ${actionsToProcess.length}`
      );

      // ============================================
      // STEP 1: Process all pending user actions
      // ============================================
      if (actionsToProcess.length > 0) {
        console.log(
          `[ProcessingFlow] Processing ${actionsToProcess.length} action(s)`
        );
        gameDataRef.current = await processActions(
          gameDataRef,
          discussionStages,
          actionsToProcess,
          setResponsePending
        );
      }

      // ============================================
      // STEP 2: Check if we're waiting for user input
      // ============================================
      let shouldProcessStep = true;
      if (curStep.stepType === DiscussionStageStepType.REQUEST_USER_INPUT) {
        const isComplete = await isDiscussionStageStepComplete(
          gameDataRef,
          discussionStages
        );
        if (!isComplete) {
          console.log(
            '[ProcessingFlow] Waiting for user input, pausing step processing'
          );
          shouldProcessStep = false;
          lastProcessedStepKey.current = currentStepKey;
        } else {
          console.log(
            '[ProcessingFlow] User input received, continuing with step processing'
          );
        }
      }

      // ============================================
      // STEP 3: Process the current step (if not blocked)
      // ============================================
      if (shouldProcessStep) {
        console.log(
          `[ProcessingFlow] Processing current step (type: ${curStep.stepType})`
        );
        gameDataRef.current = await processCurStep(
          gameDataRef,
          discussionStages,
          setResponsePending,
          firstAvailableAzureServiceModel(),
          gameDataRef.current.globalStateData.roomOwnerId
        );

        // ============================================
        // STEP 4: Check if step is complete and advance
        // ============================================
        const stepIsComplete = isDiscussionStage(curStage.stage)
          ? await isDiscussionStageStepComplete(gameDataRef, discussionStages)
          : await isSimulationStageComplete(gameDataRef);

        if (stepIsComplete) {
          console.log('[ProcessingFlow] Step complete, advancing to next step');
          gameDataRef.current = updateGameDataWithNextStep(
            gameDataRef.current,
            curStage,
            curStep
          );
          // Clear the last processed key since we're moving to a new step
          lastProcessedStepKey.current = null;
        } else {
          console.log(
            '[ProcessingFlow] Step not complete, staying on current step'
          );
          lastProcessedStepKey.current = currentStepKey;
        }
      }
      console.log('setting local game data', gameDataRef.current);
      setLocalGameData(getGameDataCopy(gameDataRef.current));

      // ============================================
      // STEP 5: Cleanup and sync to cloud
      // ============================================
      // Remove processed actions from the local action queue.
      localActionQueue.current = localActionQueue.current.filter(
        (action) => !actionsToProcess.map((a) => a._id).includes(action._id)
      );
      processedActionIds.current = new Set([
        ...processedActionIds.current,
        ...actionsToProcess.map((a) => a._id),
      ]);
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
        console.log('[ProcessingFlow] No changes made, skipping cloud sync');
      } else {
        console.log('[ProcessingFlow] Syncing changes to cloud');
        await roomActionApi.syncRoomData(roomId, gameDataRef.current);
      }

      console.log('[ProcessingFlow] Processing cycle complete');
    } catch (error) {
      console.error('[ProcessingFlow] Error during processing:', error);
      throw error;
    } finally {
      // Always release the lock
      processingLock.current = false;
    }
  }

  useEffect(() => {
    if (!roomId || !roomOwner || !gameDataClassRef?.current) {
      console.error(
        'Not polling room actions and steps because roomId or roomOwner or gameDataClassRef is not set'
      );
      console.log('roomId', Boolean(roomId));
      console.log('roomOwner', Boolean(roomOwner));
      console.log('gameDataClassRef', Boolean(gameDataClassRef?.current));
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        console.log('polling room actions and steps', roomId);
        const heartBeatsAndActions =
          await roomApi.fetchRoomHeartBeatsAndActions(roomId);
        await processActionsAndCurStep(
          heartBeatsAndActions.actions,
          roomId,
          cancelled
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
  }, [roomId, roomOwner, discussionStages]);

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
      if (!gameDataClassRef?.current) {
        throw new Error('Game data class not found for submitRoomAction');
      }
      // Room owner actions are handled right away, they do not go to the cloud.
      addToLocalActionQueue(action);
      return await processActionsAndCurStep([action], room._id, false);
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

  async function submitViewedSimulationAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    stageId: string
  ) {
    const newDate = new Date();
    await submitRoomAction(
      room,
      isRoomAuthoritativeClient,
      roomActionApi.RoomActionType.UPDATE_ROOM,
      JSON.stringify([{ key: getSimulationViewedKey(stageId), value: true }]),
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
    submitViewedSimulationAction,
  };
}
