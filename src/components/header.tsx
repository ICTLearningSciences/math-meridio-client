/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearPlayer } from '../store/slices/player';
import AvatarSprite from './avatar-sprite';
import { UseWithLogin } from '../store/slices/player/use-with-login';
import { useWithEducationalData } from '../store/slices/educational-data/use-with-educational-data';
import { HelpRequestButton } from './help-request-button';
import { RefreshRequestButton } from './refresh-request-button';
import { EducationalRole, UserRole } from '../store/slices/player/types';
import { Logout } from '@mui/icons-material';

export function Header(props: { useLogin: UseWithLogin }) {
  const dispatch = useAppDispatch();
  const { player } = useAppSelector((state) => state.playerData);
  const { roomId } = useParams<{ roomId: string }>();
  const { logout } = props.useLogin;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { educationalData, setPlayerNeedsHelpInRoom } =
    useWithEducationalData();

  const room = educationalData.rooms.find((r) => r._id === roomId);
  const myStatusInRoom =
    player?._id && room
      ? room?.gameData.playersStatusRecord[player?._id]
      : undefined;
  const isTeacher = player?.educationalRole === EducationalRole.INSTRUCTOR;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  function homeButtonClick() {
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
      </header>
    );
  }

  return (
    <header className="column header" style={{ height: 80 }}>
      <div
        className="row center-div"
        style={{ justifyContent: 'space-between' }}
      >
        <div style={{ width: 300 }}>
          <IconButton onClick={homeButtonClick}>
            <img height={60} src="/logo.png" alt="image" />
          </IconButton>
        </div>
        {/* Empty div for spacing */}
        <div className="row center-div" style={{ flexGrow: 1 }}>
          <Typography variant="h5">{room ? room.name : ''}</Typography>
        </div>
        <div
          className="row center-div spacing"
          style={{ justifyContent: 'flex-end', marginRight: 10 }}
        >
          <RefreshRequestButton />
          {!isTeacher && (
            <HelpRequestButton
              myStatusInRoom={myStatusInRoom}
              setPlayerNeedsHelpInRoom={setPlayerNeedsHelpInRoom}
            />
          )}
          {pathname.includes('/room/') && (
            <Tooltip title="Leave Room">
              <IconButton
                disabled={!player || !room}
                style={{ color: 'white' }}
                onClick={() => navigate('/classes')}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          )}
          {player && (
            <div>
              <Tooltip title="Logout">
                <Button onClick={handleButtonClick}>
                  <AvatarSprite bgColor="rgb(217, 217, 217)" player={player} />
                </Button>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    dispatch(clearPlayer());
                    logout();
                  }}
                >
                  Logout
                </MenuItem>
                {player.userRole === UserRole.ADMIN && (
                  <MenuItem onClick={() => navigate('/admin')}>Admin</MenuItem>
                )}
              </Menu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
