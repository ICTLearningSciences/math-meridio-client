/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v4 as uuid } from "uuid";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UserData } from "./userData";

export interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
}

export interface GameData {
  gameRoom: string;
  players: UserData[];
  messages: ChatMessage[];
}

const initialState: GameData = {
  gameRoom: uuid(),
  players: [],
  messages: [],
};

/** Actions */
export const createGameRoom = createAsyncThunk(
  "gameData/createGameRoom",
  async (args, thunkAPI): Promise<void> => {}
);

export const deleteGameRoom = createAsyncThunk(
  "gameData/deleteGameRoom",
  async (args, thunkAPI): Promise<void> => {}
);

export const sendChatMessage = createAsyncThunk(
  "gameData/sendChatMessage",
  async (
    args: {
      senderId: string;
      senderName: string;
      message: string;
    },
    thunkAPI
  ): Promise<ChatMessage> => {
    // TODO: use api
    return {
      senderId: args.senderId,
      senderName: args.senderName,
      message: args.message,
    };
  }
);

export const dataSlice = createSlice({
  name: "gameData",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(sendChatMessage.fulfilled, (state, action) => {
      // todo: return all from api instead
      state.messages.push(action.payload);
    });
  },
});

export const {} = dataSlice.actions;

export default dataSlice.reducer;
