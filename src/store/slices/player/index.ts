/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  PLAYER_DATA,
  localStorageClear,
  localStorageGet,
  localStorageStore,
} from '../../local-storage';
import * as api from '../../../api';
import { LoadStatus, LoadingState } from '../../../types';

export interface Avatar {
  type: string;
  id: string;
  description: string;
  variant?: number;
  variants?: string[];
}

export interface Player {
  clientId: string;
  name: string;
  description: string;
  avatar: Avatar[];
}

interface PlayerData {
  player: Player | undefined;
  loadStatus: LoadingState;
  saveStatus: LoadingState;
}

function loadCache(): PlayerData {
  const cacheData = localStorageGet(PLAYER_DATA) as Player;
  return {
    player: cacheData,
    loadStatus: {
      status: cacheData ? LoadStatus.DONE : LoadStatus.NOT_LOGGED_IN,
    },
    saveStatus: { status: LoadStatus.NONE },
  };
}

function saveCache(state: Player) {
  localStorageStore(PLAYER_DATA, state);
}

/** Actions */
export const fetchPlayer = createAsyncThunk(
  'playerData/fetchPlayer',
  async (args: string): Promise<Player> => {
    return await api.fetchPlayer(args);
  }
);

export const savePlayer = createAsyncThunk(
  'playerData/savePlayer',
  async (args: Player): Promise<Player> => {
    return await api.addOrUpdatePlayer(args);
  }
);

export const dataSlice = createSlice({
  name: 'playerData',
  initialState: loadCache(), // todo: should sync player data with fetchPlayer
  reducers: {
    clearPlayer: (state) => {
      state.player = undefined;
      state.loadStatus = { status: LoadStatus.NOT_LOGGED_IN };
      state.saveStatus = { status: LoadStatus.NONE };
      localStorageClear(PLAYER_DATA);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayer.pending, (state) => {
        state.loadStatus.status = LoadStatus.IN_PROGRESS;
        state.loadStatus.startedAt = Date.now.toString();
        state.loadStatus.error = undefined;
      })
      .addCase(fetchPlayer.fulfilled, (state, action) => {
        state.player = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
        saveCache(action.payload);
      })
      .addCase(fetchPlayer.rejected, (state, action) => {
        state.loadStatus.status = LoadStatus.FAILED;
        state.loadStatus.failedAt = Date.now.toString();
        state.loadStatus.error = action.error.message;
      })

      .addCase(savePlayer.pending, (state) => {
        state.saveStatus.status = LoadStatus.IN_PROGRESS;
        state.saveStatus.startedAt = Date.now.toString();
        state.saveStatus.error = undefined;
      })
      .addCase(savePlayer.fulfilled, (state, action) => {
        state.player = action.payload;
        state.loadStatus.status = LoadStatus.DONE;
        state.loadStatus.endedAt = Date.now.toString();
        state.loadStatus.error = undefined;
        state.saveStatus.status = LoadStatus.DONE;
        state.saveStatus.endedAt = Date.now.toString();
        state.saveStatus.error = undefined;
        saveCache(action.payload);
      })
      .addCase(savePlayer.rejected, (state, action) => {
        state.saveStatus.status = LoadStatus.FAILED;
        state.saveStatus.failedAt = Date.now.toString();
        state.saveStatus.error = action.error.message;
        console.error(action.error.message);
      });
  },
});

export const { clearPlayer } = dataSlice.actions;
export default dataSlice.reducer;
