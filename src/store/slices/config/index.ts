/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAbeConfig as _fetchAbeConfig } from '../../../api';
import { AiServiceModelConfigs, LoadStatus } from '../../../types';
import EventSystem from '../../../game/event-system';

export interface Config {
  aiServiceModelConfigs: AiServiceModelConfigs[];
}

export interface ConfigState {
  isMuted: boolean;
  abeConfig: Config;
  abeConfigLoadStatus: LoadStatus;
}

const initialState: ConfigState = {
  isMuted: false,
  abeConfig: {
    aiServiceModelConfigs: [],
  },
  abeConfigLoadStatus: LoadStatus.NONE,
};

export const fetchAbeConfig = createAsyncThunk(
  'config/fetchAbeConfig',
  async (): Promise<Config> => {
    const res = await _fetchAbeConfig();
    return res;
  }
);

export const dataSlice = createSlice({
  name: 'config',
  initialState: initialState,
  reducers: {
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
      EventSystem.emit('setMuted', state.isMuted);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAbeConfig.fulfilled, (state, action) => {
        state.abeConfig = action.payload;
        state.abeConfigLoadStatus = LoadStatus.DONE;
      })
      .addCase(fetchAbeConfig.pending, (state) => {
        state.abeConfigLoadStatus = LoadStatus.IN_PROGRESS;
      })
      .addCase(fetchAbeConfig.rejected, (state) => {
        state.abeConfigLoadStatus = LoadStatus.FAILED;
      });
  },
});

export const { toggleMute } = dataSlice.actions;

export default dataSlice.reducer;
