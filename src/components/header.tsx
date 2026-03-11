/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import { Create, Save } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearPlayer } from '../store/slices/player';
import AvatarSprite from './avatar-sprite';
import { UseWithLogin } from '../store/slices/player/use-with-login';
import { ContainedButton } from './button';
import { useWithEducationalData } from '../store/slices/educational-data/use-with-educational-data';
import { getCurPhaseTitleFromRoom } from '../store/slices/educational-data/helpers';
import { RowDiv } from '../styled-components';
import { EducationalRole } from '../store/slices/player/types';

export function Header(props: { useLogin: UseWithLogin }) {
  const dispatch = useAppDispatch();
  const { player } = useAppSelector((state) => state.playerData);
  const { roomId } = useParams<{ roomId: string }>();
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const { logout } = props.useLogin;
  const { pathname } = useLocation();
  const {
    leaveGameRoom,
    renameGameRoom,
    educationalData,
    fetchInstructorDataHydration,
  } = useWithEducationalData();
  const isInstructor = player?.educationalRole === EducationalRole.INSTRUCTOR;
  const room = educationalData.rooms.find((r) => r._id === roomId);
  const totalPhases =
    room?.gameData.phaseProgression.startingPhaseStepsOrdered.length;
  const curPhaseIndex =
    room?.gameData.phaseProgression.startingPhaseStepsOrdered.indexOf(
      room?.gameData.phaseProgression.curPhaseStepId || ''
    );
  // const completedPhases = room?.gameData.phaseProgression.phasesCompleted.length;
  const progressString =
    totalPhases !== undefined && curPhaseIndex !== undefined
      ? `${curPhaseIndex + 1}/${totalPhases}`
      : '';
  const curPhaseTitle = room ? getCurPhaseTitleFromRoom(room) : '';
  const [name, setName] = React.useState<string>(room?.name || '');
  const navigate = useNavigate();

  function homeButtonClick() {
    // if (roomId) {
    //   leaveGameRoom(roomId);
    // }
    navigate('/classes');
  }

  if (!player) {
    return (
      <header
        className="header row center-div"
        style={{
          height: 80,
          justifyContent: 'space-between',
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <img height={60} src="/logo.png" alt="image" />
        <ContainedButton style={{ backgroundColor: 'white', color: 'black' }}>
          HELP
        </ContainedButton>
      </header>
    );
  }

  return (
    <header className="column header" style={{ height: 80 }}>
      <div
        className="row center-div"
        style={{ justifyContent: 'space-between' }}
      >
        <IconButton style={{ width: 150 }} onClick={homeButtonClick}>
          <img height={60} src="/logo.png" alt="image" />
        </IconButton>
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
            <Typography variant="h5">{room ? room.name : ''}</Typography>
          )}
          {pathname.startsWith('/game/') ? (
            <IconButton
              style={{ color: 'white' }}
              onClick={() => {
                if (isEditing) {
                  renameGameRoom(room?._id || '', name);
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
              onClick={() => leaveGameRoom(room?._id || '')}
            >
              Leave Room
            </Button>
          ) : (
            <Button
              disabled={!player}
              style={{
                height: 'fit-content',
                color: 'white',
                textTransform: 'none',
              }}
              onClick={() => {
                dispatch(clearPlayer());
                logout();
              }}
            >
              Logout
            </Button>
          )}
          {player && (
            <AvatarSprite bgColor="rgb(217, 217, 217)" player={player} />
          )}
        </div>
      </div>
      <RowDiv
        style={{
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }} />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {curPhaseTitle && (
            <Typography variant="h6" style={{ flex: 1 }} textAlign="center">
              <b>Phase {progressString}:</b> {curPhaseTitle}
            </Typography>
          )}
        </div>

        {/* <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {isInstructor && (
            <Button
              style={{ backgroundColor: 'white', color: 'black' }}
              onClick={() => {
                fetchInstructorDataHydration();
              }}
            >
              Refresh
            </Button>
          )}
        </div> */}
      </RowDiv>
    </header>
  );
}
