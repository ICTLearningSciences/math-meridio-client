/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  addOrUpdateDiscussionStage as _addOrUpdateDiscussionStage,
  fetchDiscussionStages as _fetchDiscussionStages,
} from "../../../api";
import type { DiscussionStage } from "../../../components/discussion-stage-builder/types";
import type { LoadStatus } from "../../../types";

export interface Stages {
  discussionStages: DiscussionStage[];
  loadStagesStatus: LoadStatus;
  addOrUpdateStatus: LoadStatus;
}

const initialState: Stages = {
  discussionStages: [],
  loadStagesStatus: 0,
  addOrUpdateStatus: 0,
};

export const addOrUpdateDiscussionStage = createAsyncThunk(
  "stages/addOrUpdateDiscussionStage",
  async (args: {
    stage: DiscussionStage;
    password: string;
  }): Promise<DiscussionStage> => {
    const res = await _addOrUpdateDiscussionStage(args.stage, args.password);
    return res;
  },
);

export const fetchDiscussionStages = createAsyncThunk(
  "stages/fetchDiscussionStages",
  async (): Promise<DiscussionStage[]> => {
    const res = await _fetchDiscussionStages();
    return res;
  },
);

export const dataSlice = createSlice({
  name: "gameData",
  initialState: initialState,
  reducers: {
    addNewLocalDiscussionStage: (
      state,
      action: PayloadAction<DiscussionStage>,
    ) => {
      state.discussionStages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOrUpdateDiscussionStage.pending, (state) => {
        state.addOrUpdateStatus = 1;
      })
      .addCase(addOrUpdateDiscussionStage.rejected, (state) => {
        state.addOrUpdateStatus = 3;
      })
      .addCase(addOrUpdateDiscussionStage.fulfilled, (state, action) => {
        state.discussionStages = state.discussionStages.filter(
          (s) => s.clientId !== action.payload.clientId,
        );
        state.discussionStages.push(action.payload);
        state.addOrUpdateStatus = 2;
      })
      .addCase(fetchDiscussionStages.fulfilled, (state, action) => {
        state.discussionStages = action.payload;
        state.loadStagesStatus = 2;
      })
      .addCase(fetchDiscussionStages.pending, (state) => {
        state.loadStagesStatus = 1;
      })
      .addCase(fetchDiscussionStages.rejected, (state) => {
        state.loadStagesStatus = 3;
      });
  },
});

export const { addNewLocalDiscussionStage } = dataSlice.actions;

export default dataSlice.reducer;
