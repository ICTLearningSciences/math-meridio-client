/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import { useAppSelector } from '../../store/hooks';
import { LoadStatus } from '../../types';
import { GAMES, Game } from '../../game/types';

export default function StudentSelectedClassPage(): JSX.Element {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { createAndJoinGameRoom, joinGameRoom, educationalData } =
    useWithEducationalData();
  const { player } = useAppSelector((state) => state.playerData);
  const [selectedGame, setSelectedGame] = React.useState<Game>();
  const [creating, setCreating] = React.useState(false);
  const [joining, setJoining] = React.useState<string>();

  const classroom = educationalData.classes.find((c) => c._id === classId);
  const classRooms = educationalData.rooms.filter((r) => r.classId === classId);
  const gameRooms = selectedGame
    ? classRooms.filter((r) => r.gameData.gameId === selectedGame.id)
    : [];

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
  };

  const handleCreateRoom = async () => {
    if (!selectedGame || !player || !classId) return;
    setCreating(true);
    try {
      const room = await createAndJoinGameRoom(
        selectedGame.id,
        selectedGame.name,
        player._id,
        selectedGame.persistTruthGlobalStateData,
        classId
      );
      navigate(`/classes/${classId}/room/${room._id}`);
    } catch (err) {
      console.error('Failed to create room', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!player) return;
    setJoining(roomId);
    try {
      await joinGameRoom(roomId, player._id);
      navigate(`/classes/${classId}/room/${roomId}`);
    } catch (err) {
      console.error('Failed to join room', err);
    } finally {
      setJoining(undefined);
    }
  };

  if (educationalData.hydrationLoadStatus.status === LoadStatus.IN_PROGRESS) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="root center-div">
        <Typography variant="h6" color="error">
          Classroom not found
        </Typography>
      </div>
    );
  }

  return (
    <div
      className="column"
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Typography variant="h4" style={{ marginBottom: 10 }}>
        {classroom.name}
      </Typography>
      {classroom.description && (
        <Typography
          variant="body1"
          color="text.secondary"
          style={{ marginBottom: 20 }}
        >
          {classroom.description}
        </Typography>
      )}

      <div
        className="column"
        style={{ width: '90%', maxWidth: 800, marginBottom: 40 }}
      >
        <Typography variant="h5" style={{ marginBottom: 15 }}>
          Select a Game
        </Typography>
        <div className="row list center-div">
          {GAMES.map((game) => (
            <Card
              key={game.id}
              style={{
                width: 300,
                marginLeft: 5,
                marginRight: 5,
                backgroundColor: selectedGame?.id === game.id ? '#D2EBFE' : '',
              }}
            >
              <CardActionArea onClick={() => handleSelectGame(game)}>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    textAlign="center"
                  >
                    {game.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {game.problem}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </div>
      </div>

      {selectedGame && (
        <div
          className="column"
          style={{ width: '90%', maxWidth: 800, gap: 15 }}
        >
          <Typography variant="h5" style={{ marginBottom: 10 }}>
            Game Rooms
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateRoom}
            disabled={creating}
            style={{ marginBottom: 20 }}
          >
            {creating ? 'Creating...' : 'Create New Game Room'}
          </Button>

          {gameRooms.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No game rooms yet. Create one to get started!
            </Typography>
          ) : (
            gameRooms.map((room) => {
              const isInRoom = room.gameData.players.some(
                (p) => p._id === player?._id
              );
              const ownerPresent = room.gameData.players.some(
                (p) => p._id === room.gameData.globalStateData.roomOwnerId
              );

              return (
                <Card key={room._id} style={{ width: '100%' }}>
                  <CardContent>
                    <div
                      className="row"
                      style={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <Typography variant="h6">{room.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {room.gameData.players.length}{' '}
                          {room.gameData.players.length === 1
                            ? 'player'
                            : 'players'}
                        </Typography>
                        {!ownerPresent && (
                          <Typography
                            variant="body2"
                            color="warning.main"
                            style={{ marginTop: 5 }}
                          >
                            Owner not present
                          </Typography>
                        )}
                      </div>
                      <Button
                        variant={isInRoom ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => handleJoinRoom(room._id)}
                        disabled={joining === room._id}
                      >
                        {joining === room._id
                          ? 'Joining...'
                          : isInRoom
                          ? 'Rejoin'
                          : 'Join'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
