/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowForward,
  CheckCircleOutline,
  ErrorOutline,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';

import { Room } from '../../../store/slices/game/types';
import { GAMES } from '../../../game/types';
import { PlayerActivitySprite } from '../../avatar-sprite';
import ProgressBar from '../../progress-bar';
import { Classroom } from '../../../store/slices/educational-data/types';

export default function RoomCard(props: {
  classroom: Classroom;
  room: Room;
  classes: Record<string, string>;
}): JSX.Element {
  const { room, classroom, classes } = props;
  const navigate = useNavigate();

  const game = GAMES.find((g) => g.id === room?.gameData.gameId);
  const numPlayersPaused = room.gameData.players
    .map((p) => room.gameData.playersStatusRecord[p._id])
    .filter(
      (s) =>
        s.pausedByAdmin ||
        s.reportedAwayStatus.isAway ||
        s.computedState !== 'ACTIVE'
    ).length;

  const enterRoom = () => {
    navigate(`/classes/${classroom._id}/room/${room._id}`);
  };

  return (
    <div>
      <Card className={classes.card}>
        <CardContent
          className="column spacing"
          style={{ position: 'relative' }}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <Typography
              style={{
                whiteSpace: 'nowrap',
                overflowX: 'scroll',
                scrollbarWidth: 'none',
              }}
              className={classes.headerText}
            >
              {room.name}
            </Typography>
            {!numPlayersPaused ? (
              <CheckCircleOutline color="success" />
            ) : numPlayersPaused === room.gameData.players.length ? (
              <ErrorOutline color="error" />
            ) : (
              <WarningAmberOutlined color="warning" />
            )}
          </div>

          <div
            className="row center-div"
            style={{
              justifyContent: 'space-evenly',
              overflowX: 'scroll',
              scrollbarWidth: 'none',
            }}
          >
            {room.gameData.players.map((player) => (
              <PlayerActivitySprite
                key={player._id}
                player={player}
                room={room}
              />
            ))}
          </div>

          <ProgressBar phases={room.gameData.phaseProgression} />
          <Typography variant="body2">
            {game?.name || room?.gameData.gameId}
          </Typography>
          <Tooltip title="Enter room">
            <IconButton
              size="small"
              style={{ position: 'absolute', bottom: 5, right: 5 }}
              onClick={enterRoom}
            >
              <ArrowForward />
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
}
