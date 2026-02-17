/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useAppSelector, useAppDispatch } from '../../hooks';
import * as loginActions from './index';
import { useEffect } from 'react';
import { ACCESS_TOKEN_KEY, localStorageGet } from '../../local-storage';
import { EducationalRole, UserAccessToken } from './types';
import { PlayerStateData } from './index';
import { LoadStatus } from '../../../types';

export interface UseWithLogin {
  state: PlayerStateData;
  logout: () => Promise<void>;
  loginWithGoogle: (
    googleAccessToken: string,
    educationalLoginRole: EducationalRole
  ) => Promise<UserAccessToken | undefined>;
  refreshAccessToken: () => void;
  setViewingAs: (educationalRole: EducationalRole) => void;
}

// Gives you a way to interface with the redux store (which has the user information)
export function useWithLogin(): UseWithLogin {
  const dispatch = useAppDispatch();
  const state: PlayerStateData = useAppSelector((state) => state.playerData);

  useEffect(() => {
    if (
      state.loginStatus.status === LoadStatus.DONE ||
      state.loginStatus.status === LoadStatus.IN_PROGRESS
    ) {
      return;
    }
    const token = localStorageGet(ACCESS_TOKEN_KEY);
    if (token) {
      refreshAccessToken();
    } else {
      console.log('logging out');
      dispatch(loginActions.logout());
    }
  }, [state.loginStatus.status]);

  function setViewingAs(educationalRole: EducationalRole) {
    dispatch(loginActions.setViewingAs(educationalRole));
  }

  async function loginWithGoogle(
    googleAccessToken: string,
    educationalLoginRole: EducationalRole
  ) {
    if (
      state.loginStatus.status === LoadStatus.NONE ||
      state.loginStatus.status === LoadStatus.NOT_LOGGED_IN ||
      state.loginStatus.status === LoadStatus.FAILED
    ) {
      return await dispatch(
        loginActions.login({
          accessToken: googleAccessToken,
          educationalLoginRole: educationalLoginRole,
        })
      ).unwrap();
    }
  }

  function refreshAccessToken() {
    if (
      state.loginStatus.status === LoadStatus.NONE ||
      state.loginStatus.status === LoadStatus.NOT_LOGGED_IN ||
      state.loginStatus.status === LoadStatus.FAILED
    ) {
      dispatch(loginActions.refreshAccessToken());
    }
  }

  async function logout() {
    await dispatch(loginActions.logout());
  }

  return {
    state,
    logout,
    loginWithGoogle,
    refreshAccessToken,
    setViewingAs,
  };
}
