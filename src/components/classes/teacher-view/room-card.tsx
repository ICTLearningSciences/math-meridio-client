/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as motion from 'motion/react-client';
import { ArrowForward } from '@mui/icons-material';
import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';

import { Room } from '../../../store/slices/game/types';
import { GAMES } from '../../../game/types';
import AvatarSprite from '../../avatar-sprite';
import ProgressBar from '../../progress-bar';
import { Classroom } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { TwoOptionDialog } from '../../dialog';
import { Player } from '../../../store/slices/player/types';

export default function RoomCard(props: {
  classroom: Classroom;
  room: Room;
  classes: Record<string, string>;
}): JSX.Element {
  const { room, classroom, classes } = props;
  const navigate = useNavigate();
  const { togglePlayerPausedInRoomStatus } = useWithEducationalData();
  const [pausePlayer, setPausePlayer] = React.useState<Player>();
  const [updating, setUpdating] = React.useState<boolean>(false);

  const game = GAMES.find((g) => g.id === room?.gameData.gameId);

  const enterRoom = () => {
    navigate(`/classes/${classroom._id}/room/${room._id}`);
  };

  const onTogglePause = async () => {
    if (!pausePlayer) return;
    setUpdating(true);
    try {
      await togglePlayerPausedInRoomStatus(room._id, pausePlayer._id);
      setUpdating(false);
      setPausePlayer(undefined);
    } catch {
      setUpdating(false);
      setPausePlayer(undefined);
    }
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
              const isActive =
                room.gameData.playersStatusRecord[player._id].computedState ===
                'ACTIVE';
              const isPaused =
                room.gameData.playersStatusRecord[player._id].pausedByAdmin;
              const curDate = new Date().getTime();
              const loginAt = new Date(player.lastLoginAt).getTime();
              const minsSince = Math.floor(
                Math.abs(curDate - loginAt) / (1000 * 60)
              );
              const activityStr =
                minsSince < 60
                  ? `${minsSince} MINS AGO`
                  : minsSince < 60 * 24
                  ? `${Math.floor(minsSince / 60)} HOURS AGO`
                  : `${Math.floor(minsSince / (60 * 24))} DAYS AGO`;
              if (isPaused) {
                return (
                  <Tooltip key={player._id} title="Unpause player">
                    <div className="column center-div">
                      <motion.div
                        className="column center-div"
                        whileHover={{ scale: 1.05, filter: 'brightness(0.8)' }}
                        onClick={() => setPausePlayer(player)}
                      >
                        <AvatarSprite
                          player={player}
                          bgColor="rgb(218, 183, 250)"
                          isPaused={isPaused}
                        />
                      </motion.div>

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
                        PAUSED
                      </Typography>
                    </div>
                  </Tooltip>
                );
              }
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
                    {isActive
                      ? room.gameData.playersStatusRecord[player._id]
                          .computedState
                      : activityStr}
                  </Typography>
                  <Tooltip title="Pause player">
                    <motion.div
                      whileHover={{ scale: 1.05, filter: 'brightness(0.8)' }}
                      onClick={() => setPausePlayer(player)}
                      style={{
                        position: 'absolute',
                        marginRight: -30,
                        width: 12,
                        height: 12,
                        borderRadius: 12,
                        backgroundColor: isActive
                          ? 'rgb(91, 197, 57)'
                          : 'white',
                        border: `1px solid ${isActive ? 'white' : 'black'}`,
                      }}
                    ></motion.div>
                  </Tooltip>
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
      {pausePlayer && (
        <TwoOptionDialog
          title={`Mark ${pausePlayer.name} as ${
            room.gameData.playersStatusRecord[pausePlayer._id].pausedByAdmin
              ? 'active'
              : 'inactive'
          }?`}
          open={Boolean(pausePlayer)}
          actionInProgress={updating}
          option1={{
            display: `${
              room.gameData.playersStatusRecord[pausePlayer._id].pausedByAdmin
                ? 'Unpause'
                : 'Pause'
            } Player`,
            onClick: () => onTogglePause(),
          }}
          option2={{
            display: 'Cancel',
            onClick: () => setPausePlayer(undefined),
          }}
        />
      )}
    </div>
  );
}
