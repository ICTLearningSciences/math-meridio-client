/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from './api';
import * as mainApi from '../../../api';
import { LoadStatus, LoadingState } from '../../../types';
import { ClassMembership, Classroom } from './types';
import { Player } from '../player/types';
import { ChatMessage, GameData, Room } from '../game';
import {
  addOrUpdateClass,
  addOrUpdateClassMembership,
  addOrUpdateGameRoom,
  removeGameRoom,
} from './helpers';
export interface EducationalDataStateData {
  classes: Classroom[];
  rooms: Room[];
  students: Player[];
  classMemberships: ClassMembership[];
  hydrationLoadStatus: LoadingState;
}

const initialState: EducationalDataStateData = {
  classes: [],
  rooms: [],
  students: [],
  classMemberships: [],
  hydrationLoadStatus: { status: LoadStatus.NONE },
};

/** Actions */
export const fetchInstructorDataHydration = createAsyncThunk(
  'educationalData/fetchInstructorDataHydration',
  async () => {
    return await api.fetchInstructorDataHydration();
  }
);

export const fetchStudentDataHydration = createAsyncThunk(
  'educationalData/fetchStudentDataHydration',
  async () => {
    return await api.fetchStudentDataHydration();
  }
);

export const createClassroom = createAsyncThunk(
  'educationalData/createClassroom',
  async () => {
    return await api.createClassroom();
  }
);

export const createNewClassInviteCode = createAsyncThunk(
  'educationalData/createNewClassInviteCode',
  async (args: { classId: string; validUntil: Date; numUses: number }) => {
    return await api.createNewClassInviteCode(
      args.classId,
      args.validUntil,
      args.numUses
    );
  }
);

export const revokeClassInviteCode = createAsyncThunk(
  'educationalData/revokeClassInviteCode',
  async (args: { classId: string; classroomCode: string }) => {
    return await api.revokeClassInviteCode(args.classId, args.classroomCode);
  }
);

export const joinClassroom = createAsyncThunk(
  'educationalData/joinClassroom',
  async (args: { inviteCode: string }) => {
    return await api.joinClassroom(args.inviteCode);
  }
);

export const leaveClassroom = createAsyncThunk(
  'educationalData/leaveClassroom',
  async (args: { classId: string }) => {
    return await api.leaveClassroom(args.classId);
  }
);

export const removeStudentFromClass = createAsyncThunk(
  'educationalData/removeStudentFromClass',
  async (args: { studentId: string; classId: string }) => {
    return await api.removeStudentFromClass(args.studentId, args.classId);
  }
);

export const blockStudentFromClass = createAsyncThunk(
  'educationalData/blockStudentFromClass',
  async (args: { studentId: string; classId: string }) => {
    return await api.blockStudentFromClass(args.studentId, args.classId);
  }
);

export const unblockStudentFromClass = createAsyncThunk(
  'educationalData/unblockStudentFromClass',
  async (args: { studentId: string; classId: string }) => {
    return await api.unblockStudentFromClass(args.studentId, args.classId);
  }
);

export const adjustClassroomArchiveStatus = createAsyncThunk(
  'educationalData/adjustClassroomArchiveStatus',
  async (args: { classId: string; setArchived: boolean }) => {
    return await api.adjustClassroomArchiveStatus(
      args.classId,
      args.setArchived
    );
  }
);

export const updateClassNameDescription = createAsyncThunk(
  'educationalData/updateClassNameDescription',
  async (args: { classId: string; name: string; description: string }) => {
    return await api.updateClassNameDescription(
      args.classId,
      args.name,
      args.description
    );
  }
);

export const joinGameRoom = createAsyncThunk(
  'educationalData/joinGameRoom',
  async (args: { gameRoomId: string; playerId: string }): Promise<Room> => {
    return await mainApi.joinRoom(args.playerId, args.gameRoomId);
  }
);

export const leaveGameRoom = createAsyncThunk(
  'educationalData/leaveGameRoom',
  async (args: { gameRoomId: string; playerId: string }): Promise<Room> => {
    return await mainApi.leaveRoom(args.playerId, args.gameRoomId);
  }
);

export const deleteGameRoom = createAsyncThunk(
  'educationalData/deleteGameRoom',
  async (args: { gameRoomId: string }): Promise<Room> => {
    return await mainApi.deleteRoom(args.gameRoomId);
  }
);

export const renameGameRoom = createAsyncThunk(
  'educationalData/renameGameRoom',
  async (args: { gameRoomId: string; name: string }): Promise<Room> => {
    return await mainApi.renameRoom(args.name, args.gameRoomId);
  }
);

export const updateGameRoomGameData = createAsyncThunk(
  'educationalData/updateGameRoomGameData',
  async (args: {
    gameRoomId: string;
    gameData: Partial<GameData>;
  }): Promise<Room> => {
    return await mainApi.updateRoom(args.gameRoomId, args.gameData);
  }
);

export const sendGameRoomMessage = createAsyncThunk(
  'educationalData/sendGameRoomMessage',
  async (args: { gameRoomId: string; message: ChatMessage }): Promise<Room> => {
    return await mainApi.sendMessage(args.gameRoomId, args.message);
  }
);

export const fetchRoom = createAsyncThunk(
  'educationalData/fetchRoom',
  async (args: { roomId: string }): Promise<Room> => {
    return await mainApi.fetchRoom(args.roomId);
  }
);

export const createAndJoinGameRoom = createAsyncThunk(
  'educationalData/createAndJoinGameRoom',
  async (args: {
    gameId: string;
    gameName: string;
    playerId: string;
    persistTruthGlobalStateData: string[];
    classId: string;
  }): Promise<Room> => {
    return await mainApi.createAndJoinRoom(
      args.playerId,
      args.gameId,
      args.gameName,
      args.persistTruthGlobalStateData,
      args.classId
    );
  }
);

export const educationalDataSlice = createSlice({
  name: 'educationalData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(createAndJoinGameRoom.fulfilled, (state, action) => {
        addOrUpdateGameRoom(state, action.payload);
      })

      // .addCase(sendGameRoomMessage.fulfilled, (state, action) => {
      //   addOrUpdateGameRoom(state, action.payload);
      // })

      // .addCase(updateGameRoomGameData.fulfilled, (state, action) => {
      //   addOrUpdateGameRoom(state, action.payload);
      // })

      .addCase(fetchRoom.fulfilled, (state, action) => {
        addOrUpdateGameRoom(state, action.payload);
      })

      .addCase(renameGameRoom.fulfilled, (state, action) => {
        addOrUpdateGameRoom(state, action.payload);
      })

      .addCase(deleteGameRoom.fulfilled, (state, action) => {
        removeGameRoom(state, action.payload);
      })

      .addCase(joinGameRoom.fulfilled, (state, action) => {
        addOrUpdateGameRoom(state, action.payload);
      })

      .addCase(leaveGameRoom.fulfilled, (state, action) => {
        removeGameRoom(state, action.payload);
      })

      .addCase(fetchInstructorDataHydration.pending, (state) => {
        state.hydrationLoadStatus = {
          status: LoadStatus.IN_PROGRESS,
          startedAt: Date.now.toString(),
          error: undefined,
        };
      })
      .addCase(fetchInstructorDataHydration.rejected, (state, action) => {
        state.hydrationLoadStatus = {
          status: LoadStatus.FAILED,
          failedAt: Date.now.toString(),
          error: action.error.message,
        };
        state.classes = [];
        state.rooms = [];
        state.students = [];
        state.classMemberships = [];
      })
      .addCase(fetchInstructorDataHydration.fulfilled, (state, action) => {
        state.classes = action.payload.classes;
        state.rooms = action.payload.rooms;
        state.students = action.payload.students;
        state.classMemberships = action.payload.classMemberships;
        state.hydrationLoadStatus = {
          status: LoadStatus.DONE,
          endedAt: Date.now.toString(),
          error: undefined,
        };
      })

      .addCase(fetchStudentDataHydration.pending, (state) => {
        state.hydrationLoadStatus = {
          status: LoadStatus.IN_PROGRESS,
          startedAt: Date.now.toString(),
          error: undefined,
        };
      })
      .addCase(fetchStudentDataHydration.rejected, (state, action) => {
        state.classes = [];
        state.rooms = [];
        state.students = [];
        state.classMemberships = [];
        state.hydrationLoadStatus = {
          status: LoadStatus.FAILED,
          failedAt: Date.now.toString(),
          error: action.error.message,
        };
      })
      .addCase(fetchStudentDataHydration.fulfilled, (state, action) => {
        state.classes = action.payload.classes;
        state.rooms = action.payload.rooms;
        state.students = action.payload.students;
        state.classMemberships = action.payload.classMemberships;
        state.hydrationLoadStatus = {
          status: LoadStatus.DONE,
          endedAt: Date.now.toString(),
          error: undefined,
        };
      })

      .addCase(createClassroom.fulfilled, (state, action) => {
        state.classes.push(action.payload);
      })

      .addCase(createNewClassInviteCode.fulfilled, (state, action) => {
        state.classes = state.classes.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })

      .addCase(revokeClassInviteCode.fulfilled, (state, action) => {
        state.classes = state.classes.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })

      .addCase(joinClassroom.fulfilled, (state, action) => {
        addOrUpdateClassMembership(state, action.payload.classMembership);
        addOrUpdateClass(state, action.payload.classroom);
      })

      .addCase(leaveClassroom.fulfilled, (state, action) => {
        addOrUpdateClassMembership(state, action.payload);
      })

      .addCase(removeStudentFromClass.fulfilled, (state, action) => {
        addOrUpdateClassMembership(state, action.payload);
      })

      .addCase(blockStudentFromClass.fulfilled, (state, action) => {
        addOrUpdateClassMembership(state, action.payload);
      })

      .addCase(unblockStudentFromClass.fulfilled, (state, action) => {
        addOrUpdateClassMembership(state, action.payload);
      })

      .addCase(adjustClassroomArchiveStatus.fulfilled, (state, action) => {
        addOrUpdateClass(state, action.payload);
      })

      .addCase(updateClassNameDescription.fulfilled, (state, action) => {
        addOrUpdateClass(state, action.payload);
      });
  },
});

export default educationalDataSlice.reducer;
