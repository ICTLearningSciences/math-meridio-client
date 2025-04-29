/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  ChatMessage,
  GameData,
  GlobalStateData,
  PlayerStateData,
  Room,
  SenderType,
  createAndJoinRoom,
  deleteRoom,
  fetchRoom,
  joinRoom,
  leaveRoom,
  renameRoom,
  sendMessage,
  updateRoomGameData,
} from '.';
import { GenericLlmRequest, LoadStatus } from '../../../types';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchRooms } from '../../../api';
import { GameStateHandler } from '../../../classes/game-state-handler';
import { GAMES, Game } from '../../../game/types';
import { CancelToken } from 'axios';
import { syncLlmRequest } from '../../../hooks/use-with-synchronous-polling';
import { useWithStages } from '../stages/use-with-stages';
import { Player } from '../player';
import { equals } from '../../../helpers';
import EventSystem from '../../../game/event-system';
import { v4 as uuidv4 } from 'uuid';
import {
  localStorageClear,
  localStorageStore,
  SESSION_ID,
} from '../../local-storage';
export abstract class Subscriber {
  abstract newChatLogReceived(chatLog: ChatMessage[]): void;
  abstract simulationEnded(): void;
  abstract globalStateUpdated(newState: GlobalStateData): void;
  abstract playerStateUpdated(newState: PlayerStateData[]): void;
  abstract playersUpdated(newState: Player[]): void;
}

export function useWithGame() {
  const dispatch = useAppDispatch();
  const { player } = useAppSelector((state) => state.playerData);
  const { room, loadStatus } = useAppSelector((state) => state.gameData);
  const [responsePending, setResponsePending] = React.useState<boolean>(false);
  const { loadDiscussionStages } = useWithStages();
  const poll = React.useRef<NodeJS.Timeout | null>(null);

  const [game, setGame] = React.useState<Game>();
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [lastChatLog, setLastChatLog] = React.useState<ChatMessage[]>([]);
  const [lastGlobalState, setLastGlobalState] =
    React.useState<GlobalStateData>();
  const [lastPlayerState, setLastPlayerState] =
    React.useState<PlayerStateData[]>();
  const [lastPlayers, setLastPlayers] = React.useState<Player[]>();
  const [gameStateHandler, setGameStateHandler] =
    React.useState<GameStateHandler>();
  // console.log("room", room?.gameData.globalStateData.curStageId, room?.gameData.globalStateData.curStepId)
  React.useEffect(() => {
    if (!room || equals(lastChatLog, room.gameData.chat)) return;
    for (let i = 0; i < subscribers.length; i++) {
      const updateFunction = subscribers[i].newChatLogReceived.bind(
        subscribers[i]
      );
      updateFunction(room.gameData.chat);
    }
    setLastChatLog(room.gameData.chat);
  }, [room?.gameData.chat]);

  React.useEffect(() => {
    if (!room || equals(lastGlobalState, room.gameData.globalStateData)) return;
    for (let i = 0; i < subscribers.length; i++) {
      const updateFunction = subscribers[i].globalStateUpdated.bind(
        subscribers[i]
      );
      updateFunction(room.gameData.globalStateData);
    }
    setLastGlobalState(room.gameData.globalStateData);
  }, [room?.gameData.globalStateData]);

  React.useEffect(() => {
    if (!room || equals(lastPlayerState, room.gameData.playerStateData)) return;

    for (let i = 0; i < subscribers.length; i++) {
      const updateFunction = subscribers[i].playerStateUpdated.bind(
        subscribers[i]
      );
      updateFunction(room.gameData.playerStateData);
    }
    setLastPlayerState(room.gameData.playerStateData);
  }, [room?.gameData.playerStateData]);

  React.useEffect(() => {
    if (!room || equals(lastPlayers, room.gameData.players)) return;
    for (let i = 0; i < subscribers.length; i++) {
      const updateFunction = subscribers[i].playersUpdated.bind(subscribers[i]);
      updateFunction(room.gameData.players);
    }
    setLastPlayers(room.gameData.players);
  }, [room?.gameData.players]);

  React.useEffect(() => {
    if (!room && poll.current) {
      clearInterval(poll.current);
    }
  }, [room, loadStatus]);

  React.useEffect(() => {
    EventSystem.on('simulate', () => {
      for (let i = 0; i < subscribers.length; i++) {
        const updateFunction = subscribers[i].simulationEnded.bind(
          subscribers[i]
        );
        updateFunction();
      }
    });
  }, [subscribers.length]);

  React.useEffect(() => {
    return () => {
      if (poll.current) {
        clearInterval(poll.current);
      }
    };
  }, []);

  async function launchGame() {
    if (!room || !player) return undefined;
    const gameId = room.gameData.gameId;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return undefined;
    const sessionId = uuidv4();
    localStorageStore(SESSION_ID, sessionId);
    const stages = await loadDiscussionStages();
    const controller = game.createController({
      stages: stages,
      game: game.config,
      gameData: room.gameData,
      player: player,
      sendMessage: _sendMessage,
      updateRoomGameData: _updateRoomGameData,
      setResponsePending: _setResponsePending,
      executePrompt: (
        llmRequest: GenericLlmRequest,
        cancelToken?: CancelToken
      ) => {
        return syncLlmRequest(llmRequest, cancelToken);
      },
    });
    if (!poll.current) {
      poll.current = setInterval(() => {
        dispatch(fetchRoom({ roomId: room._id }));
      }, 1000);
    }
    addNewSubscriber(controller);
    setGame(game);
    setGameStateHandler(controller);
    controller.initializeGame();
  }

  function addNewSubscriber(subscriber: Subscriber) {
    setSubscribers([...subscribers, subscriber]);
  }

  function removeAllSubscribers() {
    setSubscribers([]);
  }

  async function loadRooms(game: string): Promise<Room[]> {
    return await fetchRooms(game);
  }

  function _joinRoom(room: string) {
    if (!player || loadStatus.status === LoadStatus.IN_PROGRESS) return;
    dispatch(joinRoom({ roomId: room, playerId: player.clientId }));
  }

  function _leaveRoom() {
    if (!player || !room) return;
    localStorageClear(SESSION_ID);
    dispatch(leaveRoom({ roomId: room._id, playerId: player.clientId }));
  }

  function _createRoom(gameId: string) {
    if (!player || loadStatus.status === LoadStatus.IN_PROGRESS) return;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;
    dispatch(
      createAndJoinRoom({
        gameId: game.id,
        gameName: game.name,
        playerId: player.clientId,
        persistTruthGlobalStateData: game.persistTruthGlobalStateData,
      })
    );
  }

  function _deleteRoom(id: string) {
    dispatch(deleteRoom({ roomId: id }));
  }

  function _renameRoom(name: string) {
    if (!player || !room) return;
    dispatch(renameRoom({ roomId: room._id, name }));
  }

  function _setResponsePending(pending: boolean) {
    setResponsePending(pending);
  }

  function _sendMessage(msg: ChatMessage) {
    if (!player || !room) return;
    if (msg.sender === SenderType.SYSTEM && !msg.message) return;
    dispatch(sendMessage({ roomId: room._id, message: msg }));
  }

  function _updateRoomGameData(gameData: Partial<GameData>): void {
    if (!player || !room) return;
    dispatch(updateRoomGameData({ roomId: room._id, gameData }));
  }

  return {
    game,
    gameStateHandler,
    launchGame,
    addNewSubscriber,
    removeAllSubscribers,
    loadRooms,
    joinRoom: _joinRoom,
    leaveRoom: _leaveRoom,
    createRoom: _createRoom,
    deleteRoom: _deleteRoom,
    renameRoom: _renameRoom,
    sendMessage: _sendMessage,
    updateRoomGameData: _updateRoomGameData,
    responsePending,
  };
}
