/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Player } from '../player/types';
import * as api from '../../../api';
import { LoadStatus, LoadingState } from '../../../types';

export enum SenderType {
  PLAYER = 'PLAYER',
  SYSTEM = 'SYSTEM',
}

export enum MessageDisplayType {
  TEXT = 'TEXT',
  PENDING_MESSAGE = 'PENDING_MESSAGE',
}

export interface ChatMessage {
  id: string;
  sender: SenderType;
  message: string;
  senderId?: string;
  isPromptResponse?: boolean;
  sessionId: string;
  senderName?: string;
  displayType?: MessageDisplayType;
  disableUserInput?: boolean;
  mcqChoices?: string[];
}

export interface Room {
  _id: string;
  name: string;
  classId?: string;
  gameData: GameData;
}

export interface HeartBeat {
  player: string;
  timestamp: Date;
}

export interface GameData {
  gameId: string;
  heartBeats: HeartBeat[];
  players: Player[];
  chat: ChatMessage[];
  globalStateData: GlobalStateData;
  playerStateData: PlayerStateData[];
}

export interface GameStateData {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface PlayerStateData {
  player: string;
  animation: string;
  gameStateData: GameStateData[];
}

export interface GlobalStateData {
  curStageId: string;
  curStepId: string;
  roomOwnerId: string;
  gameStateData: GameStateData[];
}

interface Data {
  room: Room | undefined;
  rooms: Room[];
  simulation?: string;
  loadStatus: LoadingState;
  roomsLoadStatus: LoadingState;
}
const initialState: Data = {
  room: undefined,
  rooms: [],
  loadStatus: { status: LoadStatus.NONE },
  roomsLoadStatus: { status: LoadStatus.NONE },
};

/** Actions */
export const fetchRooms = createAsyncThunk(
  'gameData/fetchRooms',
  async (args: { gameId?: string }): Promise<Room[]> => {
    return api.fetchRooms(args.gameId || '');
  }
);

export const fetchRoom = createAsyncThunk(
  'gameData/fetchRoom',
  async (args: { roomId: string }): Promise<Room> => {
    return api.fetchRoom(args.roomId);
  }
);

export const createAndJoinRoom = createAsyncThunk(
  'gameData/createAndJoinRoom',
  async (args: {
    gameId: string;
    gameName: string;
    playerId: string;
    persistTruthGlobalStateData: string[];
    classId: string;
  }): Promise<Room> => {
    return api.createAndJoinRoom(
      args.playerId,
      args.gameId,
      args.gameName,
      args.persistTruthGlobalStateData,
      args.classId
    );
  }
);

export const joinRoom = createAsyncThunk(
  'gameData/joinRoom',
  async (args: { roomId: string; playerId: string }): Promise<Room> => {
    return api.joinRoom(args.playerId, args.roomId);
  }
);

export const leaveRoom = createAsyncThunk(
  'gameData/leaveRoom',
  async (args: { roomId: string; playerId: string }): Promise<Room> => {
    return api.leaveRoom(args.playerId, args.roomId);
  }
);

export const deleteRoom = createAsyncThunk(
  'gameData/deleteRoom',
  async (args: { roomId: string }): Promise<Room> => {
    return api.deleteRoom(args.roomId);
  }
);

export const renameRoom = createAsyncThunk(
  'gameData/renameRoom',
  async (args: { roomId: string; name: string }): Promise<Room> => {
    return api.renameRoom(args.name, args.roomId);
  }
);

export const updateRoomGameData = createAsyncThunk(
  'gameData/updateRoomGameData',
  async (args: {
    roomId: string;
    gameData: Partial<GameData>;
  }): Promise<Room> => {
    return api.updateRoom(args.roomId, args.gameData);
  }
);

export const sendMessage = createAsyncThunk(
  'gameData/sendMessage',
  async (
    args: { roomId: string; message: ChatMessage },
    { getState }
  ): Promise<Room> => {
    const state = getState() as { gameData: Data };
    const room = state.gameData.room;
    if (!room) {
      throw new Error('Not in room');
    }
    return api.sendMessage(room._id, args.message);
  }
);

export const dataSlice = createSlice({
  name: 'gameData',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.roomsLoadStatus.status = LoadStatus.IN_PROGRESS;
        state.roomsLoadStatus.startedAt = Date.now.toString();
        state.roomsLoadStatus.error = undefined;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.roomsLoadStatus.status = LoadStatus.DONE;
        state.roomsLoadStatus.endedAt = Date.now.toString();
        state.roomsLoadStatus.error = undefined;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.roomsLoadStatus.status = LoadStatus.FAILED;
        state.roomsLoadStatus.failedAt = Date.now.toString();
        state.roomsLoadStatus.error = action.error.message;
      })

      .addCase(fetchRoom.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        if (state.room) {
          state.room = action.payload;
        }
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(fetchRoom.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(createAndJoinRoom.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(createAndJoinRoom.fulfilled, (state, action) => {
        state.room = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(createAndJoinRoom.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(joinRoom.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.room = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(leaveRoom.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
        state.room = undefined;
      })
      .addCase(leaveRoom.fulfilled, (state) => {
        state.room = undefined;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
        state.room = undefined;
      })
      .addCase(leaveRoom.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
        state.room = undefined;
      })

      .addCase(deleteRoom.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(deleteRoom.fulfilled, (state) => {
        state.room = undefined;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(renameRoom.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(renameRoom.fulfilled, (state, action) => {
        state.room = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(renameRoom.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(updateRoomGameData.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(updateRoomGameData.fulfilled, (state, action) => {
        state.room = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(updateRoomGameData.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(sendMessage.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.room = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      });
  },
});

export default dataSlice.reducer;
