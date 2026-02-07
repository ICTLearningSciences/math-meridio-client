/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { replaceStoredDataInString } from '../../components/discussion-stage-builder/helpers';
import {
  DiscussionStageStep,
  PromptStageStep,
  RequestUserInputStageStep,
  SystemMessageStageStep,
} from '../../components/discussion-stage-builder/types';
import { GameData } from '../../store/slices/game';
import { CollectedDiscussionData, DiscussionCurrentStage } from '../../types';
import { initializeResponseTracking } from './pure-state-modifiers';
import {
  addSystemMessageToGameData,
  getGameDataCopy,
} from './state-modifier-helpers';

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

// export function processPromptStep(
//   _gameData: GameData,
//   curStage: DiscussionCurrentStage,
//   curStep: PromptStageStep
// ): GameData {
//   let gameData = getGameDataCopy(_gameData);
//   const collectedDiscussionData: CollectedDiscussionData = JSON.parse(
//     gameData.globalStateData.discussionDataStringified
//   );
//   // handle replacing promptText with stored data
//   const promptText = replaceStoredDataInString(
//     curStep.promptText,
//     collectedDiscussionData
//   );
//   // handle replacing responseFormat with stored data
//   const responseFormat = replaceStoredDataInString(
//     curStep.responseFormat,
//     collectedDiscussionData
//   );
//   // handle replacing customSystemRole with stored data
//   const customSystemRole = replaceStoredDataInString(
//     curStep.customSystemRole,
//     collectedDiscussionData
//   );
// }
