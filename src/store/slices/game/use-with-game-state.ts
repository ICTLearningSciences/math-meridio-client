/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  ChatMessage,
  GlobalStateData,
  createAndJoinRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  renameRoom,
  sendMessage,
} from '.';
import { LoadStatus } from '../../../types';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { isEqual } from '../../../helpers';

export abstract class ChatLogSubscriber {
  abstract newChatLogReceived(chatLog: ChatMessage[]): void;
}

export abstract class Subscriber extends ChatLogSubscriber {
  abstract newChatLogReceived(chatLog: ChatMessage[]): void;
  abstract globalStateUpdated(newGlobalState: GlobalStateData): void;
  abstract gameStateUpdated(newGameState: Record<string, any>): void;
}

export function useWithGame() {
  const dispatch = useAppDispatch();
  const { player } = useAppSelector((state) => state.playerData);
  const { room, loadStatus } = useAppSelector((state) => state.gameData);

  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [lastChatLog, setLastChatLog] = React.useState<ChatMessage[]>([]);
  const [lastGlobalState, setLastGlobalState] =
    React.useState<GlobalStateData>();
  const [lastGameState, setLastGameState] =
    React.useState<Record<string, any>>();

  React.useEffect(() => {
    if (!room || subscribers.length === 0) return;
    if (isEqual(room.gameData.chat, lastChatLog)) return;
    for (let i = 0; i < subscribers.length; i++) {
      const updateFunction = subscribers[i].newChatLogReceived.bind(
        subscribers[i]
      );
      updateFunction(room.gameData.chat);
    }
    setLastChatLog(room.gameData.chat);
  }, [room?.gameData.chat]);

  React.useEffect(() => {
    if (!room || subscribers.length === 0) return;
    if (isEqual(room.gameData.globalStateData, lastGlobalState)) return;
    for (let i = 0; i < subscribers.length; i++) {
      const updateFunction = subscribers[i].globalStateUpdated.bind(
        subscribers[i]
      );
      updateFunction(room.gameData.globalStateData);
    }
    setLastGlobalState(room.gameData.globalStateData);
  }, [room?.gameData.globalStateData]);

  React.useEffect(() => {
    if (!room || subscribers.length === 0) return;
    if (isEqual(room.gameData.gameStateData, lastGameState)) return;
    for (let i = 0; i < subscribers.length; i++) {
      const updateFunction = subscribers[i].gameStateUpdated.bind(
        subscribers[i]
      );
      updateFunction(room.gameData.gameStateData);
    }
    setLastGameState(room.gameData.gameStateData);
  }, [room?.gameData.gameStateData]);

  function _joinRoom(room: string) {
    if (!player || loadStatus.status === LoadStatus.IN_PROGRESS) return;
    dispatch(joinRoom({ roomId: room, playerId: player.clientId }));
  }

  function _leaveRoom() {
    if (!player || !room) return;
    dispatch(leaveRoom({ roomId: room._id, playerId: player.clientId }));
  }

  function _createRoom(game: string) {
    if (!player || loadStatus.status === LoadStatus.IN_PROGRESS) return;
    dispatch(createAndJoinRoom({ gameId: game, playerId: player.clientId }));
  }

  function _deleteRoom() {
    if (!player || !room) return;
    dispatch(deleteRoom({ roomId: room._id }));
  }

  function _renameRoom(name: string) {
    if (!player || !room) return;
    dispatch(renameRoom({ roomId: room._id, name }));
  }

  function _sendMessage(msg: ChatMessage) {
    if (!player || !room) return;
    dispatch(sendMessage({ roomId: room._id, message: msg }));
  }

  function addNewSubscriber(subscriber: Subscriber) {
    setSubscribers([...subscribers, subscriber]);
  }

  function removeAllSubscribers() {
    setSubscribers([]);
  }

  return {
    joinRoom: _joinRoom,
    leaveRoom: _leaveRoom,
    createRoom: _createRoom,
    deleteRoom: _deleteRoom,
    renameRoom: _renameRoom,
    sendMessage: _sendMessage,
    addNewSubscriber,
    removeAllSubscribers,
  };
}
