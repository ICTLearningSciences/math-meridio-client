/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CancelToken } from 'axios';
import {
  convertCollectedDataToGSData,
  receivedExpectedData,
  recursivelyConvertExpectedDataToAiPromptString,
  recursiveUpdateAdditionalInfo,
  replaceStoredDataInString,
} from '../../components/discussion-stage-builder/helpers';
import {
  DiscussionStage,
  DiscussionStageStep,
  DiscussionStageStepType,
  PromptStageStep,
  RequestUserInputStageStep,
  SystemMessageStageStep,
} from '../../components/discussion-stage-builder/types';
import { chatLogToString, isJsonString } from '../../helpers';
import { GameData } from '../../store/slices/game';
import {
  CollectedDiscussionData,
  DiscussionCurrentStage,
  GenericLlmRequest,
  getSimulationViewedKey,
  PromptOutputTypes,
  PromptRoles,
  TargetAiModelServiceType,
} from '../../types';
import {
  initializeResponseTracking,
  updatePlayerStateData,
} from './pure-state-modifiers';
import {
  addPromptResponseToGameData,
  addSystemMessageToGameData,
  everyPlayerHasRespondedToStep,
  getGameDataCopy,
  getAllStepResponseTrackingFromGameState,
  STEP_RESPONSE_TRACKING_KEY,
} from './state-modifier-helpers';
import {
  AiServicesResponseTypes,
  extractServiceStepResponse,
} from '../../ai-services/ai-service-types';
import { RoomActionQueueEntry } from '../../room-action-api';
import { syncLlmRequest } from '../../hooks/use-with-synchronous-polling';
import { getCurStageAndStep } from './user-action-pure-functions';
import { AbstractGameData } from '../abstract-game-data';

export function startRequestUserInputStep(
  _gameData: GameData,
  curStep: RequestUserInputStageStep
): GameData {
  let gameData = getGameDataCopy(_gameData);
  if (curStep.requireAllUserInputs) {
    gameData = initializeResponseTracking(gameData);
  }
  gameData = addSystemMessageToGameData(gameData, curStep.message);
  return gameData;
}

export function processNewSystemMessageStep(
  _gameData: GameData,
  curStep: SystemMessageStageStep
): GameData {
  let gameData = getGameDataCopy(_gameData);
  gameData = addSystemMessageToGameData(gameData, curStep.message);
  return gameData;
}

export function processConditionalStep(_gameData: GameData): GameData {
  // Non-op. Conditionals are evaluated when determining the next step.
  return getGameDataCopy(_gameData);
}

export async function processPromptStep(
  _gameData: GameData,
  curStep: PromptStageStep,
  targetAiServiceModel: TargetAiModelServiceType,
  executePrompt: (
    llmRequest: GenericLlmRequest,
    cancelToken?: CancelToken
  ) => Promise<AiServicesResponseTypes>,
  persistTruthFields: string[],
  playerIdToUpdate: string
): Promise<GameData> {
  let gameData = getGameDataCopy(_gameData);
  const collectedDiscussionData: CollectedDiscussionData = JSON.parse(
    gameData.globalStateData.discussionDataStringified
  );
  // handle replacing promptText with stored data
  const promptText = replaceStoredDataInString(
    curStep.promptText,
    collectedDiscussionData
  );
  // handle replacing responseFormat with stored data
  const responseFormat = replaceStoredDataInString(
    curStep.responseFormat,
    collectedDiscussionData
  );
  // handle replacing customSystemRole with stored data
  const customSystemRole = replaceStoredDataInString(
    curStep.customSystemRole,
    collectedDiscussionData
  );

  const llmRequest: GenericLlmRequest = {
    prompts: [],
    outputDataType: curStep.outputDataType,
    targetAiServiceModel: targetAiServiceModel,
    responseFormat: responseFormat,
    systemRole: customSystemRole,
  };

  if (curStep.includeChatLogContext) {
    llmRequest.prompts.push({
      promptText: `Current state of chat log between user and system: ${chatLogToString(
        gameData.chat
      )}`,
      promptRole: PromptRoles.SYSTEM,
    });
  }

  llmRequest.prompts.push({
    promptText: promptText,
    promptRole: PromptRoles.SYSTEM,
  });

  if (
    curStep.jsonResponseData &&
    curStep.outputDataType === PromptOutputTypes.JSON
  ) {
    llmRequest.responseFormat += recursivelyConvertExpectedDataToAiPromptString(
      recursiveUpdateAdditionalInfo(
        curStep.jsonResponseData,
        collectedDiscussionData
      )
    );
  }

  const requestFunction = async () => {
    const _response = await executePrompt(llmRequest);
    const response = extractServiceStepResponse(_response, 0);

    if (curStep.outputDataType === PromptOutputTypes.JSON) {
      if (!isJsonString(response)) {
        throw new Error(`Did not receive valid JSON data: ${response}`);
      }
      if (curStep.jsonResponseData && curStep.jsonResponseData.length > 0) {
        if (!receivedExpectedData(curStep.jsonResponseData, response)) {
          throw new Error(
            `Did not receive expected JSON data: ${response}. \n Expected: ${JSON.stringify(
              curStep.jsonResponseData
            )}`
          );
        }
      }
      const resData = JSON.parse(response);

      // aggregate the new JSON data
      gameData.globalStateData.discussionDataStringified = JSON.stringify({
        ...collectedDiscussionData,
        ...resData,
      });

      gameData = updatePlayerStateData(
        gameData,
        persistTruthFields,
        playerIdToUpdate,
        convertCollectedDataToGSData(resData)
      );
    } else {
      gameData = addPromptResponseToGameData(gameData, response);
    }
  };

  await requestFunction();

  return gameData;
}

export async function processCurStep(
  gameDataRef: React.MutableRefObject<GameData | undefined>,
  discussionStages: DiscussionStage[],
  setResponsePending: (pending: boolean) => void,
  targetAiServiceModel: TargetAiModelServiceType,
  playerIdToUpdate: string
): Promise<GameData> {
  if (!gameDataRef.current) {
    throw new Error('No game data found for processing current step');
  }
  const { curStep } = getCurStageAndStep(gameDataRef.current, discussionStages);
  switch (curStep.stepType) {
    case DiscussionStageStepType.REQUEST_USER_INPUT:
      gameDataRef.current = startRequestUserInputStep(
        gameDataRef.current,
        curStep
      );
      break;
    case DiscussionStageStepType.SYSTEM_MESSAGE:
      gameDataRef.current = processNewSystemMessageStep(
        gameDataRef.current,
        curStep
      );
      break;
    case DiscussionStageStepType.CONDITIONAL:
      gameDataRef.current = processConditionalStep(gameDataRef.current);
      break;
    case DiscussionStageStepType.PROMPT:
      setResponsePending(true);
      gameDataRef.current = await processPromptStep(
        gameDataRef.current,
        curStep,
        targetAiServiceModel,
        syncLlmRequest,
        gameDataRef.current.persistTruthGlobalStateData,
        playerIdToUpdate
      );
      setResponsePending(false);
      break;
    default:
      throw new Error(`Unknown step type: ${curStep}`);
  }
  return gameDataRef.current;
}

function isRequestUserInputStepComplete(
  gameData: GameData,
  curStep: RequestUserInputStageStep
): boolean {
  const { allStepResponseTracking } =
    getAllStepResponseTrackingFromGameState(gameData);
  if (!curStep.requireAllUserInputs) {
    return true; // do not require all user inputs, so we assume the step is complete
  }
  const targetStepResponseTracking = allStepResponseTracking.find(
    (stepResponseTracking) => stepResponseTracking.stepId === curStep.stepId
  );
  if (!targetStepResponseTracking) {
    return false; // step response tracking not found, so the step is not complete
  }
  return everyPlayerHasRespondedToStep(targetStepResponseTracking);
}

export async function isDiscussionStageStepComplete(
  gameDataRef: React.MutableRefObject<GameData | undefined>,
  discussionStages: DiscussionStage[]
): Promise<boolean> {
  if (!gameDataRef.current) {
    throw new Error(
      'No game data found for checking if current step is complete'
    );
  }
  const { curStep } = getCurStageAndStep(gameDataRef.current, discussionStages);
  switch (curStep.stepType) {
    case DiscussionStageStepType.REQUEST_USER_INPUT:
      return isRequestUserInputStepComplete(gameDataRef.current, curStep);
    case DiscussionStageStepType.SYSTEM_MESSAGE:
      return true;
    case DiscussionStageStepType.CONDITIONAL:
      return true;
    case DiscussionStageStepType.PROMPT:
      return true;
    default:
      throw new Error(`Unknown step type: ${curStep}`);
  }
}

export async function isSimulationStageComplete(
  gameDataRef: React.MutableRefObject<GameData | undefined>
): Promise<boolean> {
  if (!gameDataRef.current) {
    throw new Error(
      'No game data found for checking if simulation stage is complete'
    );
  }
  // Check that atleast 1 player has viewed the simulation for this stage.
  const simulationViewedKey = getSimulationViewedKey(
    gameDataRef.current.globalStateData.curStageId
  );
  return gameDataRef.current.playerStateData.some((player) =>
    player.gameStateData.some((data) => {
      if (data.key !== simulationViewedKey) {
        return false;
      }
      if (typeof data.value === 'boolean') {
        return data.value;
      } else if (typeof data.value === 'string') {
        return data.value === 'true' || data.value === 'True';
      } else {
        return false;
      }
    })
  );
}
