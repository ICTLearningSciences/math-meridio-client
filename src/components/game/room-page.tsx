/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { GAMES } from '../../game/types';
import { deleteRoom, fetchRooms } from '../../store/slices/game';
import { useWithGame } from '../../store/slices/game/use-with-game-state';
import withAuthorizationOnly from '../../wrap-with-authorization-only';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { LoadStatus } from '../../types';
import { ColumnDiv } from '../../styled-components';
import RoomDropdown from '../room-dropdown';

function RoomPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { joinRoom, createRoom } = useWithGame();
  const {
    room,
    rooms: _rooms,
    roomsLoadStatus,
  } = useAppSelector((state) => state.gameData);
  const player = useAppSelector((state) => state.playerData.player);
  const [selectedGame, setSelectedGame] = React.useState<string>();
  const rooms = _rooms.filter((r) => r.gameData?.gameId === selectedGame);
  const myRooms = rooms.filter(
    (r) => r.gameData.globalStateData.roomOwnerId === player?._id
  );
  const notMyRooms = rooms.filter(
    (r) => !myRooms.some((presentRoom) => presentRoom._id === r._id)
  );
  const roomsWithOwnerPresent = notMyRooms.filter((r) =>
    r.gameData.players.some(
      (p) => p._id === r.gameData.globalStateData.roomOwnerId
    )
  );
  const roomsWithoutOwnerPresent = notMyRooms.filter(
    (r) =>
      !roomsWithOwnerPresent.some((presentRoom) => presentRoom._id === r._id)
  );
  const navigate = useNavigate();
  const [activeExpanded, setActiveExpanded] = React.useState<boolean>(true);
  const [myRoomsExpanded, setMyRoomsExpanded] = React.useState<boolean>(true);
  const [inactiveExpanded, setInactiveExpanded] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (selectedGame) {
      reloadRooms(selectedGame);
    }
  }, [selectedGame]);

  React.useEffect(() => {
    if (room) {
      console.log('navigating to game');
      navigate(`/game/${room._id}`);
    }
  }, [room]);

  async function reloadRooms(gameId: string) {
    dispatch(fetchRooms({ gameId }));
  }

  async function onDeleteRoom(roomId: string) {
    await dispatch(deleteRoom({ roomId: roomId }));
    if (selectedGame) {
      reloadRooms(selectedGame);
    }
  }

  return (
    <div
      className="column"
      style={{ width: '100%', height: '100%', alignItems: 'center' }}
    >
      <div className="column center-div" style={{ width: '90%', padding: 20 }}>
        <Typography variant="h5">Select a Game</Typography>
        <div className="row list center-div">
          {GAMES.map((g) => {
            return (
              <Card
                key={g.id}
                style={{
                  width: 300,
                  marginLeft: 5,
                  marginRight: 5,
                  backgroundColor: selectedGame === g.id ? '#D2EBFE' : '',
                }}
              >
                <CardActionArea onClick={() => setSelectedGame(g.id)}>
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      textAlign="center"
                    >
                      {g.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {g.problem}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </div>
      </div>
      {selectedGame ? (
        <div
          className="column"
          style={{
            width: '90%',
            padding: 20,
            flexGrow: 1,
            alignItems: 'center',
          }}
        >
          <Typography variant="h5">Join an Existing Room</Typography>
          <div
            className="column list"
            style={{ flexGrow: 1, alignItems: 'center' }}
          >
            {roomsLoadStatus.status === LoadStatus.IN_PROGRESS ? (
              <CircularProgress />
            ) : roomsLoadStatus.status === LoadStatus.FAILED ? (
              <Typography color="error">Failed to load rooms</Typography>
            ) : (
              <ColumnDiv style={{ width: '100%' }}>
                {roomsWithOwnerPresent.length > 0 && (
                  <RoomDropdown
                    title="Active Rooms"
                    rooms={roomsWithOwnerPresent.filter(
                      (r) => r.gameData?.gameId === selectedGame
                    )}
                    expanded={activeExpanded}
                    setExpanded={setActiveExpanded}
                    joinRoom={joinRoom}
                    deleteRoom={onDeleteRoom}
                    ownerPresent={true}
                  />
                )}
                {myRooms.length > 0 && (
                  <RoomDropdown
                    title="My Rooms"
                    rooms={myRooms.filter(
                      (r) => r.gameData?.gameId === selectedGame
                    )}
                    expanded={myRoomsExpanded}
                    setExpanded={setMyRoomsExpanded}
                    joinRoom={joinRoom}
                    deleteRoom={onDeleteRoom}
                    ownerPresent={true}
                  />
                )}
                {roomsWithoutOwnerPresent.length > 0 && (
                  <RoomDropdown
                    title="Inactive Rooms (Owner not present)"
                    rooms={roomsWithoutOwnerPresent.filter(
                      (r) => r.gameData?.gameId === selectedGame
                    )}
                    expanded={inactiveExpanded}
                    setExpanded={setInactiveExpanded}
                    joinRoom={joinRoom}
                    deleteRoom={onDeleteRoom}
                    ownerPresent={false}
                  />
                )}
              </ColumnDiv>
            )}
          </div>
          <Button onClick={() => reloadRooms(selectedGame)}>
            Reload rooms
          </Button>
          <Typography variant="h5" style={{ marginTop: 20 }}>
            Or Create One
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => createRoom(selectedGame)}
          >
            Create new room & join
          </Button>
        </div>
      ) : undefined}
    </div>
  );
}

export default withAuthorizationOnly(RoomPage);
