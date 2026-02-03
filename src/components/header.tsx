/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import { Create, Home, Save } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearPlayer } from '../store/slices/player';
import { useWithGame } from '../store/slices/game/use-with-game-state';
import AvatarSprite from './avatar-sprite';
import { UseWithLogin } from '../store/slices/player/use-with-login';

export function Header(props: { useLogin: UseWithLogin }) {
  const dispatch = useAppDispatch();
  const { player } = useAppSelector((state) => state.playerData);
  const { room } = useAppSelector((state) => state.gameData);
  const [name, setName] = React.useState<string>(room?.name || '');
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const { logout } = props.useLogin;
  const { pathname } = useLocation();
  const { leaveRoom, renameRoom } = useWithGame();
  const navigate = useNavigate();

  function homeButtonClick() {
    leaveRoom();
    navigate('/classes');
  }

  return (
    <header
      className="row center-div header"
      style={{ justifyContent: 'space-between' }}
    >
      <div style={{ marginLeft: 20, width: 150 }}>
        <IconButton onClick={homeButtonClick}>
          <Home style={{ color: 'white' }} />
        </IconButton>
      </div>
      <div className="row center-div">
        {isEditing ? (
          <TextField
            style={{ width: 300 }}
            sx={{ input: { color: 'white' } }}
            value={name}
            variant="standard"
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <Typography variant="h5">
            {room ? room.name : 'Math Meridio'}
          </Typography>
        )}
        {pathname.startsWith('/game/') ? (
          <IconButton
            style={{ color: 'white' }}
            onClick={() => {
              if (isEditing) {
                renameRoom(room?._id || '', name);
                setIsEditing(false);
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? <Save /> : <Create />}
          </IconButton>
        ) : undefined}
      </div>
      <div style={{ display: 'flex', width: 150, alignItems: 'center' }}>
        {pathname.startsWith('/game/') ? (
          <Button
            variant="text"
            disabled={!player || !room}
            style={{
              height: 'fit-content',
              color: 'white',
              marginRight: 5,
              padding: 0,
            }}
            onClick={leaveRoom}
          >
            Leave Room
          </Button>
        ) : (
          <Button
            variant="outlined"
            disabled={!player}
            style={{ height: 'fit-content', color: 'white', marginRight: 5 }}
            onClick={() => {
              dispatch(clearPlayer());
              logout();
            }}
          >
            Logout
          </Button>
        )}
        {player && <AvatarSprite player={player} />}
      </div>
    </header>
  );
}
