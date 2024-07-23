/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

import { LoadStatus } from './types';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { clearPlayer } from './store/slices/player';
import { fetchDiscussionStages } from './store/slices/stages';
import { Room, fetchRooms, leaveRoom } from './store/slices/game';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withAuthorizationOnly = (Component: any) => (props: any) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { roomsLoadStatus } = useAppSelector((state) => state.gameData);
  const { player, loadStatus: playerLoadStatus } = useAppSelector(
    (state) => state.playerData
  );
  const { loadStagesStatus } = useAppSelector((state) => state.stages);

  // const { loadStatus, player } = useWithPlayer();

  React.useEffect(() => {
    if (
      playerLoadStatus.status === LoadStatus.NONE ||
      playerLoadStatus.status === LoadStatus.NOT_LOGGED_IN ||
      playerLoadStatus.status === LoadStatus.FAILED ||
      !player
    ) {
      dispatch(clearPlayer());
      navigate('/login');
      return;
    }
    if (playerLoadStatus.status === LoadStatus.DONE && !player.description) {
      navigate('/avatar-creator');
    }
  }, [playerLoadStatus.status]);

  React.useEffect(() => {
    if (loadStagesStatus === LoadStatus.NONE) {
      dispatch(fetchDiscussionStages());
    }
  }, [loadStagesStatus]);

  React.useEffect(() => {
    if (!player) return;
    if (roomsLoadStatus.status === LoadStatus.NONE) {
      dispatch(fetchRooms({})).then((res) => {
        const rooms = res.payload as Room[];
        for (const room of rooms) {
          if (
            room.gameData?.players.find((p) => p.clientId === player.clientId)
          ) {
            dispatch(
              leaveRoom({ playerId: player.clientId, roomId: room._id })
            );
          }
        }
      });
    }
  }, [player, roomsLoadStatus.status]);

  if (
    playerLoadStatus.status === LoadStatus.NONE ||
    playerLoadStatus.status === LoadStatus.IN_PROGRESS
  ) {
    return (
      <div className="root center-div">
        <CircularProgress size="large" />
      </div>
    );
  }

  return playerLoadStatus.status === LoadStatus.DONE ? (
    <Component {...props} />
  ) : (
    <div className="root center-div">
      <CircularProgress size="large" />
    </div>
  );
};

export default withAuthorizationOnly;
