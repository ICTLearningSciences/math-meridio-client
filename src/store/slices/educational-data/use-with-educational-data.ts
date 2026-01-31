/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ChatMessage, GameData, Room } from '../game';
import * as educationalDataActions from './index';
import {
  ClassMembership,
  Classroom,
  FetchEducationalDataHydrationResponse,
  JoinClassroomResponse,
} from './types';

export function useWithEducationalData() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.educationalData);

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

  async function joinGameRoom(
    gameRoomId: string,
    playerId: string
  ): Promise<Room> {
    return await dispatch(
      educationalDataActions.joinGameRoom({ gameRoomId, playerId })
    ).unwrap();
  }

  async function leaveGameRoom(
    gameRoomId: string,
    playerId: string
  ): Promise<Room> {
    return await dispatch(
      educationalDataActions.leaveGameRoom({ gameRoomId, playerId })
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

  async function updateGameRoomGameData(
    gameRoomId: string,
    gameData: Partial<GameData>
  ): Promise<Room> {
    return await dispatch(
      educationalDataActions.updateGameRoomGameData({ gameRoomId, gameData })
    ).unwrap();
  }

  async function sendGameRoomMessage(
    gameRoomId: string,
    message: ChatMessage
  ): Promise<Room> {
    return await dispatch(
      educationalDataActions.sendGameRoomMessage({ gameRoomId, message })
    ).unwrap();
  }

  async function createAndJoinGameRoom(
    gameId: string,
    gameName: string,
    playerId: string,
    persistTruthGlobalStateData: string[],
    classId: string
  ): Promise<Room> {
    return await dispatch(
      educationalDataActions.createAndJoinGameRoom({
        gameId,
        gameName,
        playerId,
        persistTruthGlobalStateData,
        classId,
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
    updateGameRoomGameData,
    sendGameRoomMessage,
    createAndJoinGameRoom,
    educationalData: state,
  };
}
