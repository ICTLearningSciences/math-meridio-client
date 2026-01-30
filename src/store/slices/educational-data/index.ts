/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from './api';
import { LoadStatus, LoadingState } from '../../../types';
import { ClassMembership, Classroom } from './types';
import { Player } from '../player/types';
import { Room } from '../game';
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

export const educationalDataSlice = createSlice({
  name: 'educationalData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default educationalDataSlice.reducer;
