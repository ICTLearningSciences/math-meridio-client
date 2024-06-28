/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v4 as uuid } from "uuid";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  USER_DATA,
  localStorageClear,
  localStorageGet,
  localStorageStore,
} from "../local-storage";

export interface UserData {
  username: string;
  userId: string;
}

const initialState: UserData = {
  userId: uuid(),
  username: "user-0",
};

function loadCache(): UserData {
  const cacheData = localStorageGet(USER_DATA) as UserData;
  if (cacheData) {
    return {
      ...initialState,
      ...cacheData,
    };
  }
  return initialState;
}

function saveCache(state: UserData) {
  localStorageStore(USER_DATA, {
    name: state.username,
  });
}

/** Actions */
export const joinGamRoom = createAsyncThunk(
  "userData/joinGamRoom",
  async (args, thunkAPI): Promise<void> => {}
);

export const leaveGameRoom = createAsyncThunk(
  "userData/leaveGameRoom",
  async (args, thunkAPI): Promise<void> => {}
);

export const dataSlice = createSlice({
  name: "userData",
  initialState: loadCache(),
  reducers: {
    clearCache: (state) => {
      state.username = initialState.username;
      localStorageClear(USER_DATA);
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
      saveCache(state);
    },
  },
  extraReducers: (builder) => {
    builder;
  },
});

export const { clearCache, setUsername } = dataSlice.actions;

export default dataSlice.reducer;
