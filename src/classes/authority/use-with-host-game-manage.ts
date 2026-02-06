/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useWithEducationalData as useWithEducationalDataHook } from '../../store/slices/educational-data/use-with-educational-data';
import { useParams } from 'react-router-dom';
import { useWithStages } from '../../store/slices/stages/use-with-stages';
import { useState } from 'react';
import { Game, GAMES } from '../../game/types';
import { localStorageStore, SESSION_ID } from '../../store/local-storage';
import { v4 as uuidv4 } from 'uuid';
import * as roomApi from '../../room-action-api';
import {
  fetchRoom,
  GameData,
  GlobalStateData,
  Room,
} from '../../store/slices/game';
import React from 'react';
import { useWithRoomAction } from '../../store/slices/educational-data/use-with-room-action';
import { RoomActionQueueEntry } from '../../room-action-api';
export function useWithHostGameManagement() {
  const dispatch = useAppDispatch();
  const useWithEducationalData = useWithEducationalDataHook();
  const { player } = useAppSelector((state) => state.playerData);
  const { discussionStages } = useWithStages();
  const [game, setGame] = useState<Game>();
  const poll = React.useRef<NodeJS.Timeout | null>(null);
  const { fetchRoomActions } = useWithRoomAction();
  const [localGlobalStateData, setLocalGlobalStateData] =
    useState<GlobalStateData>();
  const [localActionQueue, setLocalActionQueue] = useState<
    RoomActionQueueEntry[]
  >([]);
  const { roomId } = useParams();
  const room = useAppSelector((state) =>
    state.educationalData.rooms.find((r) => r._id === roomId)
  );

  async function launchGame() {
    if (!room || !player) return undefined;
    const sessionId = uuidv4();
    localStorageStore(SESSION_ID, sessionId);
    const isRoomOwner =
      player._id === room.gameData.globalStateData.roomOwnerId;
    const gameId = room.gameData.gameId;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return undefined;
    setGame(game);
    const latestRoomData = await useWithEducationalData.fetchRoom(room._id);
    setLocalGlobalStateData(latestRoomData.gameData.globalStateData);
    if (!isRoomOwner) {
      console.log('player is not the room owner, skipping game launch');
      return;
    }
    if (isRoomOwner) {
      pollActionQueue(latestRoomData);
    } else {
      pollRoomState(latestRoomData);
    }
  }

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

  function pollRoomState(room: Room) {
    if (!poll.current) {
      poll.current = setInterval(() => {
        useWithEducationalData.fetchRoom(room._id);
      }, 1000);
    }
  }

  async function syncRoomData(roomId: string, newGameData: GameData) {
    return await roomApi.syncRoomData(roomId, newGameData);
  }

  return {
    game,
    launchGame,
  };
}
