/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useAppDispatch, useAppSelector } from '../../hooks';
import { GameStateData, Room } from '../game/types';
import * as educationalDataActions from './index';
import {
  ClassMembership,
  Classroom,
  FetchEducationalDataHydrationResponse,
  JoinClassroomResponse,
} from './types';
import * as gameRoomApi from '../../../hooks/game-rooms/game-room-api';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { Game, GAMES } from '../../../game/types';

export interface UseWithEducationalData {
  educationalData: educationalDataActions.EducationalDataStateData;
  fetchInstructorDataHydration: () => Promise<FetchEducationalDataHydrationResponse>;
  fetchStudentDataHydration: () => Promise<FetchEducationalDataHydrationResponse>;
  createClassroom: () => Promise<Classroom>;
  createNewClassInviteCode: (
    classId: string,
    validUntil: Date,
    numUses: number
  ) => Promise<Classroom>;
  revokeClassInviteCode: (
    classId: string,
    classroomCode: string
  ) => Promise<Classroom>;
  joinClassroom: (inviteCode: string) => Promise<JoinClassroomResponse>;
  leaveClassroom: (classId: string) => Promise<ClassMembership>;
  removeStudentFromClass: (
    studentId: string,
    classId: string
  ) => Promise<ClassMembership>;
  blockStudentFromClass: (
    studentId: string,
    classId: string
  ) => Promise<ClassMembership>;
  unblockStudentFromClass: (
    studentId: string,
    classId: string
  ) => Promise<ClassMembership>;
  adjustClassroomArchiveStatus: (
    classId: string,
    setArchived: boolean
  ) => Promise<Classroom>;
  updateClassNameDescription: (
    classId: string,
    name: string,
    description: string
  ) => Promise<Classroom>;
  joinGameRoom: (gameRoomId: string) => Promise<Room>;
  leaveGameRoom: (gameRoomId: string) => Promise<Room>;
  deleteGameRoom: (gameRoomId: string) => Promise<Room>;
  renameGameRoom: (gameRoomId: string, name: string) => Promise<Room>;
  fetchRoom: (roomId: string) => Promise<Room>;
  fetchRooms: (game: string) => Promise<Room[]>;
  createNewGameRoom: (
    gameId: string,
    gameName: string,
    classId?: string
  ) => Promise<Room>;
  pingGameRoomProcess: (gameRoomId: string) => Promise<Room>;
  ownerIsPresent: boolean;
  room: Room | undefined;
  updateMyRoomGameStateData: (gameStateData: GameStateData) => Promise<Room>;
  sendMessageToGameRoom: (message: string) => Promise<Room>;
  curGame: Game | undefined;
}

export function useWithEducationalData(): UseWithEducationalData {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.educationalData);
  const { roomId } = useParams<{ roomId: string }>();
  const { player } = useAppSelector((state) => state.playerData);
  const room = state.rooms.find((r) => r._id === roomId);
  const ownerIsPresent = room?.gameData.players.some(
    (p) => p._id === player?._id
  );
  const curGame = useMemo(() => {
    return GAMES.find((g) => g.id === room?.gameData.gameId);
  }, [room, state.gamesList]);

  async function fetchInstructorDataHydration(): Promise<FetchEducationalDataHydrationResponse> {
    return await dispatch(
      educationalDataActions.fetchInstructorDataHydration()
    ).unwrap();
  }

  async function fetchStudentDataHydration(): Promise<FetchEducationalDataHydrationResponse> {
    return await dispatch(
      educationalDataActions.fetchStudentDataHydration()
    ).unwrap();
  }

  async function createClassroom(): Promise<Classroom> {
    return await dispatch(educationalDataActions.createClassroom()).unwrap();
  }

  async function createNewClassInviteCode(
    classId: string,
    validUntil: Date,
    numUses: number
  ): Promise<Classroom> {
    return await dispatch(
      educationalDataActions.createNewClassInviteCode({
        classId,
        validUntil,
        numUses,
      })
    ).unwrap();
  }

  async function revokeClassInviteCode(
    classId: string,
    classroomCode: string
  ): Promise<Classroom> {
    return await dispatch(
      educationalDataActions.revokeClassInviteCode({ classId, classroomCode })
    ).unwrap();
  }

  async function joinClassroom(
    inviteCode: string
  ): Promise<JoinClassroomResponse> {
    return await dispatch(
      educationalDataActions.joinClassroom({ inviteCode })
    ).unwrap();
  }

  async function leaveClassroom(classId: string): Promise<ClassMembership> {
    return await dispatch(
      educationalDataActions.leaveClassroom({ classId })
    ).unwrap();
  }

  async function removeStudentFromClass(
    studentId: string,
    classId: string
  ): Promise<ClassMembership> {
    return await dispatch(
      educationalDataActions.removeStudentFromClass({ studentId, classId })
    ).unwrap();
  }

  async function blockStudentFromClass(
    studentId: string,
    classId: string
  ): Promise<ClassMembership> {
    return await dispatch(
      educationalDataActions.blockStudentFromClass({ studentId, classId })
    ).unwrap();
  }

  async function unblockStudentFromClass(
    studentId: string,
    classId: string
  ): Promise<ClassMembership> {
    return await dispatch(
      educationalDataActions.unblockStudentFromClass({ studentId, classId })
    ).unwrap();
  }

  async function adjustClassroomArchiveStatus(
    classId: string,
    setArchived: boolean
  ): Promise<Classroom> {
    return await dispatch(
      educationalDataActions.adjustClassroomArchiveStatus({
        classId,
        setArchived,
      })
    ).unwrap();
  }

  async function updateClassNameDescription(
    classId: string,
    name: string,
    description: string
  ): Promise<Classroom> {
    return await dispatch(
      educationalDataActions.updateClassNameDescription({
        classId,
        name,
        description,
      })
    ).unwrap();
  }

  async function joinGameRoom(gameRoomId: string): Promise<Room> {
    return await dispatch(
      educationalDataActions.joinGameRoom({ gameRoomId })
    ).unwrap();
  }

  async function leaveGameRoom(gameRoomId: string): Promise<Room> {
    return await dispatch(
      educationalDataActions.leaveGameRoom({ gameRoomId })
    ).unwrap();
  }

  async function deleteGameRoom(gameRoomId: string): Promise<Room> {
    return await dispatch(
      educationalDataActions.deleteGameRoom({ gameRoomId })
    ).unwrap();
  }

  async function renameGameRoom(
    gameRoomId: string,
    name: string
  ): Promise<Room> {
    return await dispatch(
      educationalDataActions.renameGameRoom({ gameRoomId, name })
    ).unwrap();
  }

  async function fetchRoom(roomId: string): Promise<Room> {
    return await dispatch(
      educationalDataActions.fetchRoom({ roomId })
    ).unwrap();
  }

  async function fetchRooms(game: string): Promise<Room[]> {
    return await dispatch(educationalDataActions.fetchRooms({ game })).unwrap();
  }

  async function createNewGameRoom(
    gameId: string,
    gameName: string,
    classId?: string
  ): Promise<Room> {
    return await dispatch(
      educationalDataActions.createNewGameRoom({ gameId, gameName, classId })
    ).unwrap();
  }

  async function pingGameRoomProcess(gameRoomId: string): Promise<Room> {
    return await gameRoomApi.pingGameRoomProcess(gameRoomId);
  }

  async function sendMessageToGameRoom(message: string): Promise<Room> {
    if (!roomId) {
      throw new Error('No game room found for message');
    }
    return await dispatch(
      educationalDataActions.sendMessageToGameRoom({ roomId, message })
    ).unwrap();
  }

  async function updateMyRoomGameStateData(
    gameStateData: GameStateData
  ): Promise<Room> {
    if (!roomId) {
      throw new Error('Room ID is required to update player game state data');
    }
    if (!player?._id) {
      throw new Error('Player ID is required to update player game state data');
    }
    return await dispatch(
      educationalDataActions.updatePlayerGameStateData({
        roomId,
        playerId: player?._id,
        gameStateData,
      })
    ).unwrap();
  }

  return {
    fetchInstructorDataHydration,
    fetchStudentDataHydration,
    createClassroom,
    createNewClassInviteCode,
    revokeClassInviteCode,
    joinClassroom,
    leaveClassroom,
    removeStudentFromClass,
    blockStudentFromClass,
    unblockStudentFromClass,
    adjustClassroomArchiveStatus,
    updateClassNameDescription,
    joinGameRoom,
    leaveGameRoom,
    deleteGameRoom,
    renameGameRoom,
    fetchRoom,
    fetchRooms,
    createNewGameRoom,
    pingGameRoomProcess,
    sendMessageToGameRoom,
    updateMyRoomGameStateData,
    educationalData: state,
    ownerIsPresent: ownerIsPresent || false,
    room,
    curGame,
  };
}
