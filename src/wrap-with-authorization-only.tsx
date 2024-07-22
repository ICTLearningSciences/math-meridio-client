/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

import { LoadStatus } from './types';
import { useWithPlayer } from './store/slices/player/use-with-player-state';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withAuthorizationOnly = (Component: any) => (props: any) => {
  const navigate = useNavigate();
  const { loadStatus, player } = useWithPlayer();

  React.useEffect(() => {
    if (
      (loadStatus.status === LoadStatus.NOT_LOGGED_IN ||
        loadStatus.status === LoadStatus.FAILED) &&
      !player
    ) {
      navigate('/login');
    }
    if (loadStatus.status === LoadStatus.DONE && !player?.description) {
      navigate('/avatar-creator');
    }
  }, [loadStatus]);

  if (
    loadStatus.status === LoadStatus.NONE ||
    loadStatus.status === LoadStatus.IN_PROGRESS
  ) {
    return (
      <div className="root center-div">
        <CircularProgress size="large" />
      </div>
    );
  }

  return loadStatus.status === LoadStatus.DONE ? (
    <Component {...props} />
  ) : (
    <div className="root center-div">
      <CircularProgress size="large" />
    </div>
  );
};

export default withAuthorizationOnly;
