/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useAppSelector } from '../../store/hooks';
import { useWithEducationalData as useWithEducationalDataHook } from '../../store/slices/educational-data/use-with-educational-data';
import { useParams } from 'react-router-dom';
import { useWithStages } from '../../store/slices/stages/use-with-stages';
import { useEffect, useRef, useState } from 'react';
import { Game, GAMES } from '../../game/types';
import { localStorageStore, SESSION_ID } from '../../store/local-storage';
import { v4 as uuidv4 } from 'uuid';
import * as roomApi from '../../room-action-api';
import { GameData, GameStateData, Room } from '../../store/slices/game';
import React from 'react';
import { useWithProcessingRoomActions } from './use-with-process-room-actions-and-steps';
import { useWithSubmitHeartBeat } from './use-with-submit-heart-beat';
import { AbstractGameData } from '../abstract-game-data';
import { EventSystem } from '../../game/event-system';
import { getFirstStepId } from '../../helpers';
import { getGameDataCopy } from './state-modifier-helpers';
import { Player } from '../../store/slices/player/types';

export interface UseWithHostGameManagement {
  game?: Game;
  launchGame: () => void;
  syncRoomData: (roomId: string, newGameData: GameData) => Promise<void>;
  createAndJoinRoom: (
    gameId: string,
    gameName: string,
    classId: string
  ) => Promise<Room>;
  ownerIsPresent?: boolean;
  waitingForPlayers: string[];
  responsePending: boolean;
  uiTriggerLocalGameData?: GameData;
  updatePlayerStateData: (newPlayerStateData: GameStateData[]) => void;
  player?: Player;
}

export function useWithHostGameManagement(): UseWithHostGameManagement {
  const useWithEducationalData = useWithEducationalDataHook();
  const { player } = useAppSelector((state) => state.playerData);
  const { discussionStages } = useWithStages();
  const [game, setGame] = useState<Game>();
  const gameDataClassRef = useRef<AbstractGameData>();
  const poll = React.useRef<NodeJS.Timeout | null>(null);
  const [uiTriggerLocalGameData, setUiTriggerLocalGameData] =
    useState<GameData>();
  const localGameDataRef = useRef<GameData>();
  const { roomId } = useParams();
  const room = useAppSelector((state) =>
    state.educationalData.rooms.find((r) => r._id === roomId)
  );
  const isRoomOwner = React.useMemo(() => {
    return player?._id === uiTriggerLocalGameData?.globalStateData.roomOwnerId;
  }, [player, uiTriggerLocalGameData?.globalStateData.roomOwnerId]);

  const ownerIsPresent = React.useMemo(() => {
    return uiTriggerLocalGameData?.players.some(
      (p) => p._id === uiTriggerLocalGameData?.globalStateData.roomOwnerId
    );
  }, [
    uiTriggerLocalGameData?.players,
    uiTriggerLocalGameData?.globalStateData.roomOwnerId,
  ]);

  const [responsePending, setResponsePending] = useState<boolean>(false);
  const {
    submitJoinRoomAction,
    submitUpdateMyPlayerDataAction,
    submitViewedSimulationAction,
  } = useWithProcessingRoomActions(
    setUiTriggerLocalGameData,
    localGameDataRef,
    discussionStages,
    isRoomOwner,
    setResponsePending,
    roomId,
    gameDataClassRef
  );
  useWithSubmitHeartBeat(roomId);

  async function launchGame() {
    if (!room || !player) {
      console.error('Failed to launch game because room or player is not set');
      return;
    }
    const sessionId = uuidv4();
    localStorageStore(SESSION_ID, sessionId);
    const gameId = room.gameData.gameId;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    setGame(game);
    const gameDataClass = game.createController(discussionStages);
    gameDataClassRef.current = gameDataClass;

    // const isRoomOwner =
    //   player._id === room.gameData.globalStateData.roomOwnerId;
    // if (!isRoomOwner) {
    //   startPollRoomState(latestRoomData);
    // }
  }

  useEffect(() => {
    if (!room) {
      return;
    }
    EventSystem.on('simulationEnded', () => {
      // Store that this user has viewed the simulation for this stage.
      if (!localGameDataRef.current?.globalStateData.curStageId) {
        throw new Error('No stage id found for simulation ended');
      }
      submitViewedSimulationAction(
        room,
        true,
        localGameDataRef.current.globalStateData.curStageId
      );
    });
  }, [Boolean(room)]);

  function startPollRoomState(room: Room) {
    if (!poll.current) {
      poll.current = setInterval(() => {
        useWithEducationalData.fetchRoom(room._id);
      }, 1000);
    }
  }

  async function syncRoomData(roomId: string, newGameData: GameData) {
    return await roomApi.syncRoomData(roomId, newGameData);
  }

  async function createAndJoinRoom(
    gameId: string,
    gameName: string,
    classId: string
  ): Promise<Room> {
    const room = await useWithEducationalData.createNewRoom(
      gameId,
      gameName,
      classId
    );
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) {
      throw new Error('Game not found for createAndJoinRoom');
    }
    gameDataClassRef.current = game.createController(discussionStages);
    localGameDataRef.current = {
      ...room.gameData,
      globalStateData: {
        ...room.gameData.globalStateData,
        curStageId: gameDataClassRef.current?.stageList[0].stage.clientId,
        curStepId: getFirstStepId(gameDataClassRef.current?.stageList[0].stage),
      },
    };
    setUiTriggerLocalGameData(getGameDataCopy(localGameDataRef.current));
    await submitJoinRoomAction(room, true);
    // Wait until you are in the room. (keep checking the local room state until you are in the room, for 10 seconds max)
    for (let i = 0; i < 10; i++) {
      if (
        localGameDataRef.current?.players.some((p) => p._id === player?._id)
      ) {
        return room;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error('Failed to join the room');
    // TODO: if the room owner is not present (no recent heartbeats), then you become the owner.
  }

  function updatePlayerStateData(newPlayerStateData: GameStateData[]) {
    if (!room) {
      throw new Error('Room not found');
    }
    submitUpdateMyPlayerDataAction(room, true, newPlayerStateData);
  }

  console.log('uiTriggerLocalGameData', uiTriggerLocalGameData);

  return {
    game: game,
    launchGame,
    syncRoomData,
    createAndJoinRoom,
    ownerIsPresent,
    waitingForPlayers: [] as string[],
    responsePending,
    uiTriggerLocalGameData,
    player,
    updatePlayerStateData,
  };
}
