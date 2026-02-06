/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { replaceStoredDataInString } from '../../components/discussion-stage-builder/helpers';
import {
  Checking,
  ConditionalActivityStep,
  DiscussionStageStep,
  DiscussionStageStepType,
} from '../../components/discussion-stage-builder/types';
import { getFirstStepId } from '../../helpers';
import { localStorageGet, SESSION_ID } from '../../store/local-storage';
import { GameData, GameStateData, SenderType } from '../../store/slices/game';
import { CollectedDiscussionData, DiscussionCurrentStage } from '../../types';
import { v4 as uuidv4 } from 'uuid';
export const STEP_RESPONSE_TRACKING_KEY = 'stepResponseTracking';
export interface StepResponseTracking {
  stepId: string;
  requiredPlayerIds: string[];
  responses: Map<string, string>; // playerId -> message
  allResponsesReceivedOnce: boolean; // once true, no longer require all responses for this step
}

export function addSystemMessageToGameData(
  gameData: GameData,
  newMessage: string
): GameData {
  const sessionId = localStorageGet<string>(SESSION_ID);
  gameData.chat.push({
    id: uuidv4(),
    sender: SenderType.SYSTEM,
    message: newMessage,
    sessionId: sessionId || '',
  });
  return gameData;
}

/**
 * Initializes the response tracking for the whole game,
 */
export function initializeResponseTracking(gameData: GameData): GameData {
  const existingTracking = gameData.globalStateData.gameStateData.find(
    (gameDataKeyValue) => gameDataKeyValue.key === STEP_RESPONSE_TRACKING_KEY
  );
  if (existingTracking) {
    return gameData;
  }
  const newTracking = {
    key: STEP_RESPONSE_TRACKING_KEY,
    value: {},
  };
  gameData.globalStateData.gameStateData.push(newTracking);
  return gameData;
}

/**
 * Adds response tracking for a step to the global state data
 */
export function addResponseTrackingForStep(
  gameData: GameData,
  playersInRoom: string[],
  stepId: string
): GameData {
  const updatedGameData = initializeResponseTracking(gameData);
  const existingTrackingItem =
    updatedGameData.globalStateData.gameStateData.find(
      (gameDataKeyValue) => gameDataKeyValue.key === STEP_RESPONSE_TRACKING_KEY
    );
  if (!existingTrackingItem) {
    throw new Error('Step response tracking item not found');
  }
  const existingTracking = existingTrackingItem.value as StepResponseTracking[];
  const existingStepTracking = existingTracking.find(
    (stepTracking) => stepTracking.stepId === stepId
  );

  if (existingStepTracking) {
    return updatedGameData;
  }

  existingTracking.push({
    stepId,
    requiredPlayerIds: playersInRoom,
    responses: new Map(),
    allResponsesReceivedOnce: false,
  });

  existingTrackingItem.value = existingTracking;
  updatedGameData.globalStateData.gameStateData =
    updatedGameData.globalStateData.gameStateData.map((gameDataKeyValue) => {
      if (gameDataKeyValue.key === STEP_RESPONSE_TRACKING_KEY) {
        return existingTrackingItem;
      }
      return gameDataKeyValue;
    });

  return updatedGameData;
}

/**
 * Updates the global game state data with the new data
 */
export function updateGlobalStateData(
  gameData: GameData,
  persistTruthFields: string[],
  newData: GameStateData[]
): GameData {
  for (const newGameData of newData) {
    const existingGameDataItem = gameData.globalStateData.gameStateData.find(
      (gameDataKeyValue) => gameDataKeyValue.key === newGameData.key
    );
    if (
      existingGameDataItem &&
      existingGameDataItem.value === 'true' &&
      persistTruthFields.includes(newGameData.key)
    ) {
      continue;
    }
    if (existingGameDataItem) {
      existingGameDataItem.value = newGameData.value;
    } else {
      gameData.globalStateData.gameStateData.push(newGameData);
    }
  }
  return gameData;
}

/**
 * Updates the players individual game state data with the new data
 */
export function updatePlayerStateData(
  gameData: GameData,
  persistTruthFields: string[],
  playerId: string,
  _newPlayerGameStateData: GameStateData[]
): GameData {
  for (const newPlayerGameStateData of _newPlayerGameStateData) {
    const existingPlayerDataItem = gameData.playerStateData.find(
      (playerData) => playerData.player === playerId
    );
    if (!existingPlayerDataItem) {
      throw new Error(`Player data not found for player ${playerId}`);
    }
    const existingPlayerGameStateData =
      existingPlayerDataItem.gameStateData.find(
        (gameStateData) => gameStateData.key === newPlayerGameStateData.key
      );
    if (
      existingPlayerGameStateData &&
      existingPlayerGameStateData.value === 'true' &&
      persistTruthFields.includes(newPlayerGameStateData.key)
    ) {
      continue;
    }
    if (existingPlayerGameStateData) {
      existingPlayerGameStateData.value = newPlayerGameStateData.value;
    } else {
      existingPlayerDataItem.gameStateData.push(newPlayerGameStateData);
    }
  }
  return gameData;
}

/**
 * For every field that we want to globally persist as true and is in the global state data, sync the value to the players
 * @param gameData - the game data to sync the truth data to
 * @param persistTruthFields - the fields to sync to the players
 * @returns the updated game data
 */
export function syncGlobalTruthDataToPlayers(
  gameData: GameData,
  persistTruthFields: string[]
): GameData {
  for (const persistTruthFieldKey of persistTruthFields) {
    const globalTruthData = gameData.globalStateData.gameStateData.find(
      (gameDataKeyValue) => gameDataKeyValue.key === persistTruthFieldKey
    );
    if (!globalTruthData) {
      continue;
    }
    for (const playerData of gameData.playerStateData) {
      const existingPlayerGameStateData = playerData.gameStateData.find(
        (gameStateData) => gameStateData.key === persistTruthFieldKey
      );
      if (existingPlayerGameStateData) {
        existingPlayerGameStateData.value = globalTruthData.value;
      } else {
        playerData.gameStateData.push({
          key: persistTruthFieldKey,
          value: globalTruthData.value,
        });
      }
    }
  }
  return gameData;
}

/**
 * For every key in the global state data, sync the value to the players if the key is not already in the players game state data
 */
export function syncGlobalGameStateKeysToPlayers(gameData: GameData): GameData {
  for (const globalGameStateData of gameData.globalStateData.gameStateData) {
    for (const playerData of gameData.playerStateData) {
      const existingPlayerGameStateData = playerData.gameStateData.find(
        (gameStateData) => gameStateData.key === globalGameStateData.key
      );
      if (existingPlayerGameStateData) {
        continue;
      } else {
        playerData.gameStateData.push({
          key: globalGameStateData.key,
          value: globalGameStateData.value,
        });
      }
    }
  }
  return gameData;
}

/**
 * Gets the ID of the next step from a conditional step, depending if conditions are met.
 * Conditionals can only jump to steps within the same stage.
 */
export function getNextStepFromConditionalStage(
  step: ConditionalActivityStep,
  collectedDiscussionData: CollectedDiscussionData
): string {
  const hydratedConditionals = step.conditionals.map((c) => ({
    ...c,
    expectedValue: replaceStoredDataInString(
      c.expectedValue,
      collectedDiscussionData
    ),
  }));
  for (let i = 0; i < hydratedConditionals.length; i++) {
    const condition = hydratedConditionals[i];
    let stateValue = collectedDiscussionData[condition.stateDataKey];
    if (!stateValue) {
      throw new Error(`failed to find state value ${condition.stateDataKey}`);
    }
    if (
      typeof stateValue === 'string' &&
      ['false', 'true', 'False', 'True'].includes(stateValue)
    ) {
      if (stateValue === 'false' || stateValue === 'False') {
        stateValue = false;
      } else {
        stateValue = true;
      }
    }

    if (condition.checking === Checking.VALUE) {
      const expression = `${String(stateValue)} ${condition.operation} ${
        condition.expectedValue
      }`;
      const conditionTrue = new Function(`return ${expression};`)();
      if (conditionTrue) {
        return condition.targetStepId;
      }
    } else if (condition.checking === Checking.LENGTH) {
      if (!Array.isArray(stateValue) && typeof stateValue !== 'string') {
        throw new Error(
          `Expected a string or array for state value ${
            condition.stateDataKey
          }, but got ${typeof stateValue}`
        );
      }
      const expression = `${stateValue.length} ${condition.operation} ${condition.expectedValue}`;
      const conditionTrue = new Function(`return ${expression};`)();
      if (conditionTrue) {
        return condition.targetStepId;
      }
    } else {
      // Checking if array or string contains value
      const conditionTrue = Array.isArray(stateValue)
        ? stateValue.find((a) => String(a) === condition.expectedValue)
        : (stateValue as string).includes(String(condition.expectedValue));
      if (conditionTrue) {
        return condition.targetStepId;
      }
    }
  }
  throw new Error('Failed to find next step id for ');
}

export function updateGameDataWithNextStep(
  gameData: GameData,
  collectedDiscussionData: CollectedDiscussionData,
  curStage: DiscussionCurrentStage,
  curStep: DiscussionStageStep
): GameData {
  if (curStep.lastStep) {
    const nextStage = curStage.getNextStage(collectedDiscussionData);
    const nextStep = getFirstStepId(curStage.stage);
    gameData.globalStateData.curStageId = nextStage;
    gameData.globalStateData.curStepId = nextStep;
    return gameData;
  }

  // getNextStep

  // Handle conditional step
  if (curStep.stepType === DiscussionStageStepType.CONDITIONAL) {
    const nextStep = getNextStepFromConditionalStage(
      curStep as ConditionalActivityStep,
      collectedDiscussionData
    );
    if (nextStep) {
      gameData.globalStateData.curStepId = nextStep;
      return gameData;
    }
  }

  if (curStep.jumpToStepId) {
    gameData.globalStateData.curStepId = curStep.jumpToStepId;
    return gameData;
  }

  // find next step in the flow
  const currentFlowList = curStage.stage.flowsList.find((flow) =>
    flow.steps.find((step) => step.stepId === curStep.stepId)
  );

  if (!currentFlowList) {
    throw new Error(`Unable to find flow for step: ${curStep.stepId}`);
  }

  const currentStepIndex = currentFlowList.steps.findIndex(
    (step) => step.stepId === curStep.stepId
  );

  if (currentStepIndex === -1) {
    throw new Error(
      `Unable to find requested step: ${curStep.stepId} in flow ${currentFlowList.name}`
    );
  }

  const nextStepIndex = currentStepIndex + 1;
  if (nextStepIndex >= currentFlowList.steps.length) {
    throw new Error(
      'No next step found, maybe you forgot to add a jumpToStepId for the last step in a flow?'
    );
  } else {
    const nextStep = currentFlowList.steps[nextStepIndex];
    gameData.globalStateData.curStepId = nextStep.stepId;
    return gameData;
  }
}
