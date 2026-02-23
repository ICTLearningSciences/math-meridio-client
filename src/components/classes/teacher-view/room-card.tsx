/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import { Card, CardContent, IconButton, Typography } from '@mui/material';
import { Room } from '../../../store/slices/game/types';
import { GAMES } from '../../../game/types';
import AvatarSprite from '../../avatar-sprite';
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
          </div>
          <div
            className="row center-div"
            style={{
              justifyContent: 'space-evenly',
              overflowX: 'scroll',
              scrollbarWidth: 'none',
            }}
          >
            {room.gameData.players.map((player) => {
              const curDate = new Date().getTime();
              const loginAt = new Date(player.lastLoginAt).getTime();
              const hoursSince = Math.floor(
                Math.abs(curDate - loginAt) / (1000 * 60 * 60)
              );
              const activityStr =
                hoursSince === 0
                  ? 'ACTIVE'
                  : hoursSince > 24
                  ? `${Math.floor(hoursSince / 24)} DAYS AGO`
                  : `${hoursSince} HOURS AGO`;
              return (
                <div key={player._id} className="column center-div">
                  <AvatarSprite player={player} bgColor="rgb(218, 183, 250)" />
                  <Typography
                    variant="body2"
                    fontSize={12}
                    fontWeight="bold"
                    align="center"
                    style={{ marginTop: 5 }}
                  >
                    {player.name}
                  </Typography>
                  <Typography fontSize={10} fontWeight="lighter">
                    {activityStr}
                  </Typography>
                </div>
              );
            })}
          </div>
          <ProgressBar value={25} />
          <Typography variant="body2">
            {game?.name || room?.gameData.gameId}
          </Typography>
          <IconButton
            size="small"
            style={{ position: 'absolute', bottom: 5, right: 5 }}
            onClick={enterRoom}
          >
            <ArrowForward />
          </IconButton>
        </CardContent>
      </Card>
    </div>
  );
}
