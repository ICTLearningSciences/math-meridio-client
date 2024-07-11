/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v4 as uuid } from "uuid";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  PLAYER_DATA,
  localStorageGet,
  localStorageStore,
} from "../local-storage";
import { Player } from "../../types";
import * as api from "../../api";

const initialState: Player = {
  clientId: uuid(),
  name: "",
  avatar: "",
  description: "",
};

function loadCache(): Player {
  const cacheData = localStorageGet(PLAYER_DATA) as Player;
  if (cacheData) {
    return {
      ...initialState,
      ...cacheData,
    };
  }
  return initialState;
}

function saveCache(state: Player) {
  localStorageStore(PLAYER_DATA, state);
}

/** Actions */
export const fetchPlayer = createAsyncThunk(
  "playerData/fetchPlayer",
  async (args: string, thunkAPI): Promise<Player> => {
    const cacheData = localStorageGet(PLAYER_DATA) as Player;
    if (!cacheData) return initialState;
    return await api.fetchPlayer(cacheData.clientId);
  }
);

export const updatePlayer = createAsyncThunk(
  "playerData/updatePlayer",
  async (args: Player, thunkAPI): Promise<Player> => {
    return await api.addOrUpdatePlayer(args);
  }
);

export const dataSlice = createSlice({
  name: "playerData",
  initialState: loadCache(), // todo: should sync player data with fetchPlayer
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayer.fulfilled, (state, action) => {
        saveCache(state);
        return action.payload;
      })
      .addCase(updatePlayer.fulfilled, (state, action) => {
        saveCache(state);
        return action.payload;
      });
  },
});

export const {} = dataSlice.actions;

export default dataSlice.reducer;
