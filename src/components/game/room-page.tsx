/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
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
import { fetchRooms } from '../../api';
import { GAMES } from '../../game/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Room, createAndJoinRoom, joinRoom } from '../../store/slices/game';
import withAuthorizationOnly from '../../wrap-with-authorization-only';

function RoomCard(props: {
  room: Room;
  join: (id: string) => void;
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
          <Typography>{room.name}</Typography>
          <Typography>{room.gameData.players.length} players</Typography>
          <Button variant="contained" onClick={() => props.join(room._id)}>
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
            Status: {room.gameData.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Players: {room.gameData.players.map((p) => p.name).join(', ')}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

function RoomPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { player } = useAppSelector((state) => state.playerData);
  const [selectedGame, setSelectedGame] = React.useState<string>();
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (selectedGame) {
      loadRooms(selectedGame);
    }
  }, [selectedGame]);

  async function loadRooms(gameId: string) {
    if (isLoading) return;
    setIsLoading(true);
    fetchRooms(gameId)
      .then((rooms) => {
        setRooms(rooms);
        setError(undefined);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      });
  }

  function join(roomId: string) {
    if (!player?.clientId) return;
    dispatch(joinRoom({ roomId, playerId: player.clientId }));
  }

  function create(gameId: string) {
    if (!player?.clientId) return;
    dispatch(createAndJoinRoom({ gameId, playerId: player.clientId }));
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
                      {g.description}
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
            {isLoading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">Failed to load rooms</Typography>
            ) : (
              rooms.map((r) => (
                <RoomCard key={`room-${r._id}`} room={r} join={join} />
              ))
            )}
          </div>
          <Button onClick={() => loadRooms(selectedGame)}>Reload rooms</Button>
          <Typography variant="h5" style={{ marginTop: 20 }}>
            Or Create One
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => create(selectedGame)}
          >
            Create new room & join
          </Button>
        </div>
      ) : undefined}
    </div>
  );
}

export default withAuthorizationOnly(RoomPage);
