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
  DiscussionStageStep,
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
  getGameDataCopy,
} from './state-modifier-helpers';
import {
  AiServicesResponseTypes,
  extractServiceStepResponse,
} from '../../ai-services/ai-service-types';

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
