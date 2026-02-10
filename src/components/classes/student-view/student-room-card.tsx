/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from 'react';
import { Button, Card, CardContent, Typography } from '@mui/material';
import { Room } from '../../../store/slices/game/types';
import { Player } from '../../../store/slices/player/types';
import { useNavigate } from 'react-router-dom';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';

export function StudentRoomCard(props: {
  room: Room;
  player: Player;
  classId: string;
}): JSX.Element {
  const navigate = useNavigate();
  const { joinGameRoom } = useWithEducationalData();
  const { room, player, classId } = props;
  const [joining, setJoining] = useState<string>();
  const isInRoom = room.gameData.players.some((p) => p._id === player?._id);
  const ownerPresent = room.gameData.players.some(
    (p) => p._id === room.gameData.globalStateData.roomOwnerId
  );

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
              {room.gameData.players.length === 1 ? 'player' : 'players'}
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
            {joining === room._id ? 'Joining...' : isInRoom ? 'Rejoin' : 'Join'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
