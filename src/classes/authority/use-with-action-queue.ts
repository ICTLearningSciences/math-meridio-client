/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from 'react';
import { RoomActionQueueEntry } from '../../room-action-api';
import { GameStateData, Room } from '../../store/slices/game';
import * as roomActionApi from '../../room-action-api';
import { v4 as uuidv4 } from 'uuid';

export function useWithRoomActionQueue() {
  const [localActionQueue, setLocalActionQueue] = useState<
    RoomActionQueueEntry[]
  >([]);
  const poll = React.useRef<NodeJS.Timeout | null>(null);

  function pollActionQueue(room: Room) {
    if (!poll.current) {
      poll.current = setInterval(() => {
        fetchRoomActions(room._id).then((activeActionItems) => {
          setLocalActionQueue((prev) => {
            const newActionItems = activeActionItems.filter(
              (action) =>
                !prev.some((localAction) => localAction._id === action._id)
            );
            return [...prev, ...newActionItems].sort(
              (a, b) => b.actionSentAt.getTime() - a.actionSentAt.getTime()
            );
          });
        });
      }, 1000);
    }
  }

  async function fetchRoomActions(
    roomId: string
  ): Promise<RoomActionQueueEntry[]> {
    return await roomActionApi.fetchRoomActions(roomId);
  }

  async function submitRoomAction(
    room: Room,
    isRoomAuthoritativeClient: boolean,
    actionType: roomActionApi.RoomActionType,
    payload: string,
    actionSentAt: Date
  ): Promise<void> {
    if (isRoomAuthoritativeClient) {
      // Room owners handle the action locally
      const action: RoomActionQueueEntry = {
        _id: uuidv4(),
        roomId: room._id,
        playerId: room.gameData.globalStateData.roomOwnerId,
        actionType: actionType,
        payload: payload,
        actionSentAt: actionSentAt,
        processedAt: null,
      };
      setLocalActionQueue((prev) => [...prev, action]);
      return await Promise.resolve();
    }

    // Non-room owners submit the action to the backend
    return await roomActionApi.submitRoomAction(
      room._id,
      actionType,
      payload,
      actionSentAt
    );
  }

  async function submitProcessedActions(
    processedActionIds: string[],
    isRoomAuthoritativeClient: boolean
  ): Promise<void> {
    if (!isRoomAuthoritativeClient) {
      console.log('Non-room owners cannot submit processed actions');
      return;
    }
    // Non-room owners manage the queue, submit the processed actions to the backend
    setLocalActionQueue((prev) =>
      prev.filter((prevAction) => !processedActionIds.includes(prevAction._id))
    );
    await roomActionApi.submitProcessedActions(processedActionIds);
  }

  async function joinRoomAction(
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

  async function leaveRoomAction(
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

  async function sendMessageAction(
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

  async function updateMyPlayerDataAction(
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
    pollActionQueue,
    fetchRoomActions,
    submitProcessedActions,
    joinRoomAction,
    leaveRoomAction,
    sendMessageAction,
    updateMyPlayerDataAction,
  };
}
