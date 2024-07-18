/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Player } from '../player';
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
  senderName?: string;
  displayType?: MessageDisplayType;
  disableUserInput?: boolean;
  mcqChoices?: string[];
}

export interface Room {
  _id: string;
  name: string;
  gameData: GameData;
}

export interface GameData {
  gameId: string;
  status: GameStatus;
  players: Player[];
  chat: ChatMessage[];
  globalStateData: GlobalStateData;
  gameStateData: Record<string, any>;
}

export enum GameStatus {
  IN_LOBBY = 'IN_LOBBY',
  IN_GAME = 'IN_GAME',
  IN_SIMULATION = 'IN_SIMULATION',
  IN_RESULTS = 'IN_RESULTS',
}

export interface PlayerState {
  player: string;
  animation: string;
  locationX: number;
  locationY: number;
}

export interface GlobalStateData {
  curStageId: string;
  curStepId: string;
  playerState: PlayerState[];
}

interface Data {
  room: Room | undefined;
  loadStatus: LoadingState;
}
const initialState: Data = {
  room: undefined,
  loadStatus: { status: LoadStatus.NONE },
};

/** Actions */
export const createAndJoinRoom = createAsyncThunk(
  'gameData/createAndJoinRoom',
  async (args: { gameId: string; playerId: string }): Promise<Room> => {
    return api.createAndJoinRoom(args.playerId, args.gameId);
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
  async (args: { roomId: string; playerId: string }): Promise<boolean> => {
    return api.leaveRoom(args.playerId, args.roomId);
  }
);

export const deleteRoom = createAsyncThunk(
  'gameData/deleteRoom',
  async (args: { roomId: string }): Promise<boolean> => {
    return api.deleteRoom(args.roomId);
  }
);

export const renameRoom = createAsyncThunk(
  'gameData/renameRoom',
  async (args: { roomId: string; name: string }): Promise<Room> => {
    return api.renameRoom(args.name, args.roomId);
  }
);

export const pollRoomGameData = createAsyncThunk(
  'gameData/pollRoomGameData',
  async (args: { roomId: string }): Promise<Room> => {
    return api.fetchRoom(args.roomId);
  }
);

export const updateRoomGameData = createAsyncThunk(
  'gameData/updateRoomGameData',
  async (args: {
    roomId: string;
    gameData: Partial<GameData>;
  }): Promise<Room> => {
    return api.updateRoomGameData(args.roomId, args.gameData);
  }
);

export const sendMessage = createAsyncThunk(
  'gameData/sendMessage',
  async (args: { roomId: string; message: ChatMessage }): Promise<Room> => {
    return api.sendMessage(args.roomId, args.message);
  }
);

export const dataSlice = createSlice({
  name: 'gameData',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAndJoinRoom.pending, (state, action) => {
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

      .addCase(joinRoom.pending, (state, action) => {
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

      .addCase(leaveRoom.pending, (state, action) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(leaveRoom.fulfilled, (state, action) => {
        state.room = undefined;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(leaveRoom.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(deleteRoom.pending, (state, action) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
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

      .addCase(renameRoom.pending, (state, action) => {
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

      .addCase(pollRoomGameData.pending, (state, action) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(pollRoomGameData.fulfilled, (state, action) => {
        state.room = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(pollRoomGameData.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(updateRoomGameData.pending, (state, action) => {
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

      .addCase(sendMessage.pending, (state, action) => {
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
