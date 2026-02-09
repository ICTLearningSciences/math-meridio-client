/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchPlayer } from '../../api';
import {
  DiscussionStageStep,
  DiscussionStageStepType,
} from '../../components/discussion-stage-builder/types';
import { RoomActionQueueEntry, RoomActionType } from '../../room-action-api';
import { GameData, GameStateData } from '../../store/slices/game';
import {
  recordPlayerResponseForStep,
  syncGlobalGameStateKeysToPlayers,
  syncGlobalTruthDataToPlayers,
  updateGlobalStateData,
  updatePlayerStateData,
} from './pure-state-modifiers';
import {
  addUserMessageToChat,
  getGameDataCopy,
} from './state-modifier-helpers';

/**
 * Adds message to the chat log, records the players response for the step, updates global state data with the users response (if saveResponseAsVariableName exists), syncs all players with the global state truths.
 */
export function processPlayerSentMessageAction(
  _gameData: GameData,
  curStep: DiscussionStageStep,
  curAction: RoomActionQueueEntry
): GameData {
  let gameData = getGameDataCopy(_gameData);
  const sendingPlayer = _gameData.players.find(
    (player) => player._id === curAction.playerId
  );
  const incomingMessage = curAction.payload;
  if (!sendingPlayer) {
    throw new Error('Failed to find player that sent message.');
  }
  if (curAction.actionType !== RoomActionType.SEND_MESSAGE) {
    throw new Error(`Invalid action type: ${curAction.actionType}`);
  }
  gameData = addUserMessageToChat(
    gameData,
    incomingMessage,
    sendingPlayer._id,
    sendingPlayer.name
  );
  gameData = recordPlayerResponseForStep(
    gameData,
    curStep.stepId,
    sendingPlayer._id,
    incomingMessage
  );
  if (
    curStep.stepType === DiscussionStageStepType.REQUEST_USER_INPUT &&
    curStep.saveResponseVariableName
  ) {
    // TECH DEBT: right now we are saving everyones responses into global state, meaning each message overwrites the previous (for the current saveResponseVariableName)
    gameData = updateGlobalStateData(
      gameData,
      gameData.persistTruthGlobalStateData,
      [
        {
          key: curStep.saveResponseVariableName,
          value: incomingMessage,
        },
      ]
    );
    gameData = updatePlayerStateData(
      gameData,
      gameData.persistTruthGlobalStateData,
      sendingPlayer._id,
      [
        {
          key: curStep.saveResponseVariableName,
          value: incomingMessage,
        },
      ]
    );
    gameData = syncGlobalTruthDataToPlayers(
      gameData,
      gameData.persistTruthGlobalStateData
    );
    gameData = syncGlobalGameStateKeysToPlayers(gameData);
  }
  return gameData;
}

/**
 * Removes the player from the room.
 * NOTE: Whatever function calls this should check if we are in a requestUserInput step and double check if we need to progress now that someone has left the room!!
 */
export function processPlayerLeavesRoomAction(
  _gameData: GameData,
  curAction: RoomActionQueueEntry
): GameData {
  if (curAction.actionType !== RoomActionType.LEAVE_ROOM) {
    throw new Error(
      'Incorrect action type provided to processPlayerLeavesRoom'
    );
  }
  let gameData = getGameDataCopy(_gameData);
  gameData.players = gameData.players.filter(
    (player) => player._id !== curAction.playerId
  );
  gameData.playerStateData = gameData.playerStateData.filter(
    (playerData) => playerData.player !== curAction.playerId
  );
  // TODO: we need to check if we need to progress a requestUserInput step in case we were waiting for this users response.
  return gameData;
}

export async function processPlayerJoinsRoomAction(
  _gameData: GameData,
  curAction: RoomActionQueueEntry
) {
  if (curAction.actionType !== RoomActionType.JOIN_ROOM) {
    throw new Error(
      'Incorrect action type provided to processPlayerLeavesRoom'
    );
  }
  let gameData = getGameDataCopy(_gameData);
  const alreadyInRoom = gameData.players.find(
    (p) => p._id === curAction.playerId
  );
  if (alreadyInRoom) {
    console.log('Player already in room');
    return gameData;
  }

  const player = await fetchPlayer(curAction.playerId);
  gameData.players.push(player);

  gameData.playerStateData.push({
    player: player._id,
    animation: '',
    gameStateData: gameData.globalStateData.gameStateData,
  });

  return gameData;
}

export function processActionUpdatePlayerStateDataAction(
  _gameData: GameData,
  action: RoomActionQueueEntry
): GameData {
  let gameData = getGameDataCopy(_gameData);
  const newPlayerData: GameStateData[] = JSON.parse(action.payload);
  gameData = updatePlayerStateData(
    gameData,
    gameData.persistTruthGlobalStateData,
    action.playerId,
    newPlayerData
  );
  return gameData;
}
