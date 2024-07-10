/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v4 as uuid } from "uuid";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GameStateHandler } from "../../classes/game-state/game-state-handler";
import { RootState } from "..";
import { ChatMessage, Room, Player } from "../../types";

export interface GameData {
  currentGameId: string;
  players: Player[];
  chat: ChatMessage[];
  room?: Room;
  gameState?: GameStateHandler;
}

const initialState: GameData = {
  currentGameId: "basketball", // todo: hard-coded for now
  players: [],
  chat: [],
};

/** Actions */
export const joinRoom = createAsyncThunk(
  "gameData/joinRoom",
  async (args, thunkAPI): Promise<void> => {
    // todo
  }
);

export const leaveRoom = createAsyncThunk(
  "gameData/leaveRoom",
  async (args, thunkAPI): Promise<void> => {
    // todo
  }
);

export const createRoom = createAsyncThunk(
  "gameData/createRoom",
  async (args, thunkAPI): Promise<void> => {
    // todo
  }
);

export const renameRoom = createAsyncThunk(
  "gameData/renameRoom",
  async (args, thunkAPI): Promise<void> => {
    // todo
  }
);

export const deleteRoom = createAsyncThunk(
  "gameData/deleteRoom",
  async (args, thunkAPI): Promise<void> => {
    // todo
  }
);

// todo: remove this
export const startGame = createAsyncThunk(
  "gameData/startGame",
  async (args: GameStateHandler, thunkAPI): Promise<ChatMessage[]> => {
    return await args.start();
  }
);

export const sendMessage = createAsyncThunk(
  "gameData/sendMessage",
  async (args: ChatMessage, thunkAPI): Promise<ChatMessage[]> => {
    const state = thunkAPI.getState() as RootState;
    const msg = (await state.gameData.gameState?.respond(args)) || [];
    return [args, ...msg];
  }
);

export const dataSlice = createSlice({
  name: "gameData",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startGame.fulfilled, (state, action) => {
        state.gameState = action.meta.arg;
        state.chat.push(...action.payload);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.chat.push(...action.payload);
      });
  },
});

export default dataSlice.reducer;
