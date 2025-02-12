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
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { GAMES } from '../../game/types';
import { Room, deleteRoom, fetchRooms } from '../../store/slices/game';
import { useWithGame } from '../../store/slices/game/use-with-game-state';
import withAuthorizationOnly from '../../wrap-with-authorization-only';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { LoadStatus } from '../../types';

function RoomCard(props: {
  room: Room;
  join: (id: string) => void;
  delete: (id: string) => void;
}): JSX.Element {
  const { room } = props;
  const [expanded, setIsExpanded] = React.useState<boolean>(false);
  return (
    <Card
      className="list-item"
      style={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <CardContent className="row" style={{ padding: 10 }}>
        <IconButton onClick={() => setIsExpanded(!expanded)}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        <div
          className="row"
          style={{
            flexGrow: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography style={{ flexGrow: 1 }}>{room.name}</Typography>
          <Typography style={{ marginRight: 10 }}>
            {room.gameData.players.length} players
          </Typography>
          <Button
            variant="contained"
            disabled={room.gameData.players.length >= 4}
            onClick={() => props.join(room._id)}
          >
            Join
          </Button>
        </div>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent style={{ backgroundColor: '#fcfcfc' }}>
          <Typography variant="body2" color="text.secondary">
            Game: {room.gameData.gameId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Stage: {room.gameData.globalStateData.curStageId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Step: {room.gameData.globalStateData.curStepId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Players: {room.gameData.players.map((p) => p.name).join(', ')}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => props.delete(room._id)}
          >
            Delete Room
          </Button>
        </CardContent>
      </Collapse>
    </Card>
  );
}

function RoomPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { joinRoom, createRoom } = useWithGame();
  const { room, rooms, roomsLoadStatus } = useAppSelector(
    (state) => state.gameData
  );
  const [selectedGame, setSelectedGame] = React.useState<string>();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (selectedGame) {
      reloadRooms(selectedGame);
    }
  }, [selectedGame]);

  React.useEffect(() => {
    if (room) {
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
                  minHeight: 300,
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
              rooms
                .filter((r) => r.gameData?.gameId === selectedGame)
                .map((r) => (
                  <RoomCard
                    key={`room-${r._id}`}
                    room={r}
                    join={(id) => joinRoom(id)}
                    delete={(id) => onDeleteRoom(id)}
                  />
                ))
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
