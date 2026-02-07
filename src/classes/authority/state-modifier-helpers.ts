/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GameData } from '../../store/slices/game';
import { localStorageGet } from '../../store/local-storage';
import { SESSION_ID } from '../../store/local-storage';
import { v4 as uuidv4 } from 'uuid';
import { SenderType } from '../../store/slices/game';
export const STEP_RESPONSE_TRACKING_KEY = 'stepResponseTracking';
export interface StepResponseTracking {
  stepId: string;
  requiredPlayerIds: string[];
  responses: Record<string, string>; // playerId -> message
  allResponsesReceivedOnce: boolean; // once true, no longer require all responses for this step
}

export function getGameDataCopy(gameData: GameData): GameData {
  return JSON.parse(JSON.stringify(gameData));
}

export interface GetResponseTrackingFromGameState {
  index: number;
  value: StepResponseTracking[];
}

export function getResponseTrackingFromGameState(gameData: GameData) {
  const responseTrackingIdx = gameData.globalStateData.gameStateData.findIndex(
    (gameData) => gameData.key === STEP_RESPONSE_TRACKING_KEY
  );
  if (responseTrackingIdx === -1) {
    return {
      index: -1,
      value: [],
    };
  }
  return {
    index: responseTrackingIdx,
    value: gameData.globalStateData.gameStateData[responseTrackingIdx]
      .value as StepResponseTracking[],
  };
}

export function addSystemMessageToGameData(
  _gameData: GameData,
  newMessage: string
): GameData {
  const gameData: GameData = getGameDataCopy(_gameData);
  const sessionId = localStorageGet<string>(SESSION_ID);
  gameData.chat.push({
    id: uuidv4(),
    sender: SenderType.SYSTEM,
    message: newMessage,
    sessionId: sessionId || '',
  });
  return gameData;
}
export function everyPlayerHasRespondedToStep(
  stepResponseTracking: StepResponseTracking
): boolean {
  const playersWithResponses = Object.keys(stepResponseTracking.responses);
  return (
    playersWithResponses.length ===
    stepResponseTracking.requiredPlayerIds.length
  );
}
