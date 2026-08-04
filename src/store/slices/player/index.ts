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
import * as api from "../../../api";
import type { LoadingState } from "../../../types";
import type { EducationalRole, UserRole } from "./types";
import {
  refreshAccessToken as _refreshAccessToken,
  login as _login,
} from "./api";
import {
  ACCESS_TOKEN_KEY,
  localStorageClear,
  localStorageStore,
} from "../../local-storage";
import type { Player } from "./types";

export interface PlayerStateData {
  player: Player | undefined;
  loginStatus: LoadingState;
  saveStatus: LoadingState;
  accessToken?: string;
  userRole?: UserRole;
  viewingAs: EducationalRole | undefined;
}

const initialState: PlayerStateData = {
  player: undefined,
  loginStatus: { status: 0 },
  saveStatus: { status: 0 },
  accessToken: undefined,
  userRole: undefined,
  viewingAs: undefined,
};

/** Actions */
export const fetchPlayer = createAsyncThunk(
  "playerData/fetchPlayer",
  async (args: string): Promise<Player> => {
    return await api.fetchPlayer(args);
  },
);

export const savePlayer = createAsyncThunk(
  "playerData/savePlayer",
  async (args: {
    playerId: string;
    player: Partial<Player>;
  }): Promise<Player> => {
    return await api.addOrUpdatePlayer(args.playerId, args.player);
  },
);

export const refreshAccessToken = createAsyncThunk(
  "login/refreshAccessToken",
  async () => {
    return await _refreshAccessToken();
  },
);

export const login = createAsyncThunk(
  "login/login",
  async (args: { accessToken: string }) => {
    return await _login(args.accessToken);
  },
);

export const logout = createAsyncThunk("login/logout", async () => {
  return Promise.resolve();
});

export const dataSlice = createSlice({
  name: "playerData",
  initialState,
  reducers: {
    clearPlayer: (state) => {
      state.player = undefined;
      state.loginStatus = { status: 4 };
      state.saveStatus = { status: 0 };
    },
    setViewingAs: (state, action: PayloadAction<EducationalRole>) => {
      state.viewingAs = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.player = undefined;
        state.loginStatus = { status: 4 };
        state.saveStatus = { status: 0 };
        state.accessToken = undefined;
        state.userRole = undefined;
        state.viewingAs = undefined;
      })

      .addCase(login.pending, (state) => {
        state.loginStatus.status = 1;
        state.loginStatus.startedAt = Date.now.toString();
        state.loginStatus.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        localStorageStore(ACCESS_TOKEN_KEY, action.payload.accessToken);
        state.player = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.userRole = action.payload.user.userRole;
        state.loginStatus.status = 2;
        state.loginStatus.endedAt = Date.now.toString();
        state.loginStatus.error = undefined;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginStatus.status = 3;
        state.loginStatus.failedAt = Date.now.toString();
        state.loginStatus.error = action.error.message;
        localStorageClear(ACCESS_TOKEN_KEY);
      })

      .addCase(refreshAccessToken.pending, (state) => {
        state.loginStatus.status = 1;
        state.loginStatus.startedAt = Date.now.toString();
        state.loginStatus.error = undefined;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        localStorageStore(ACCESS_TOKEN_KEY, action.payload.accessToken);
        state.player = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.userRole = action.payload.user.userRole;
        state.loginStatus.status = 2;
        state.loginStatus.endedAt = Date.now.toString();
        state.loginStatus.error = undefined;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loginStatus.status = 3;
        state.loginStatus.failedAt = Date.now.toString();
        state.loginStatus.error = action.error.message;
        localStorageClear(ACCESS_TOKEN_KEY);
      })

      .addCase(fetchPlayer.pending, (state) => {
        state.loginStatus.status = 1;
        state.loginStatus.startedAt = Date.now.toString();
        state.loginStatus.error = undefined;
      })
      .addCase(fetchPlayer.fulfilled, (state, action) => {
        state.player = action.payload;
        state.loginStatus.status = 2;
        state.loginStatus.endedAt = Date.now.toString();
        state.loginStatus.error = undefined;
      })
      .addCase(fetchPlayer.rejected, (state, action) => {
        state.loginStatus.status = 3;
        state.loginStatus.failedAt = Date.now.toString();
        state.loginStatus.error = action.error.message;
      })

      .addCase(savePlayer.pending, (state) => {
        state.saveStatus.status = 1;
        state.saveStatus.startedAt = Date.now.toString();
        state.saveStatus.error = undefined;
      })
      .addCase(savePlayer.fulfilled, (state, action) => {
        state.player = action.payload;
        state.saveStatus.status = 2;
        state.saveStatus.endedAt = Date.now.toString();
        state.saveStatus.error = undefined;
      })
      .addCase(savePlayer.rejected, (state, action) => {
        state.saveStatus.status = 3;
        state.saveStatus.failedAt = Date.now.toString();
        state.saveStatus.error = action.error.message;
        console.error(action.error.message);
      });
  },
});

export const { clearPlayer, setViewingAs } = dataSlice.actions;
export default dataSlice.reducer;
