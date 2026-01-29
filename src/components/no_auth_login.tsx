/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { useWithPlayer } from '../store/slices/player/use-with-player-state';
import { LoadStatus } from '../types';

function LoginPage(): JSX.Element {
  const { player, loadStatus, saveStatus } = useAppSelector(
    (state) => state.playerData
  );
  const [username, setUsername] = React.useState<string>('');
  const isLoading =
    loadStatus.status === LoadStatus.NONE ||
    loadStatus.status === LoadStatus.IN_PROGRESS;

  const navigate = useNavigate();
  const { createPlayerName } = useWithPlayer();

  React.useEffect(() => {
    if (loadStatus.status !== LoadStatus.DONE) return;
    if (player) {
      if (player.description) {
        navigate('/');
      } else {
        navigate('/avatar-creator');
      }
    }
  }, [player, loadStatus]);

  return (
    <div className="root column center-div">
      {isLoading ? (
        <CircularProgress />
      ) : (
        <div
          className="column center-div"
          style={{
            width: '400px',
            textAlign: 'center',
            border: '1px solid lightgrey',
            padding: '20px',
            boxShadow: '-5px 5px 10px 0px rgba(0,0,0,0.75)',
          }}
        >
          <Typography fontSize={24} fontWeight="bold">
            Enter a username:
          </Typography>
          <TextField
            fullWidth
            value={username}
            style={{ width: 300, marginBottom: 10 }}
            onChange={(e) => setUsername(e.target.value)}
          />
          {saveStatus.status === LoadStatus.IN_PROGRESS ? (
            <CircularProgress />
          ) : (
            <Button
              variant="contained"
              color="primary"
              style={{
                fontSize: '16px',
                margin: '10px',
                width: 300,
              }}
              disabled={!username}
              onClick={() => createPlayerName(username)}
            >
              Login
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default LoginPage;
