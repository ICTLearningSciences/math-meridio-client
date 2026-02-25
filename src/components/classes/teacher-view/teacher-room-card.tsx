/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as motion from 'motion/react-client';
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
import AvatarSprite, { PlayerSprite } from '../../avatar-sprite';
import { TwoOptionDialog } from '../../dialog';
import ProgressBar from '../../progress-bar';
import {
  calculatePercentSkillsMet,
  getLastActivityString,
} from '../../../helpers';
import { Classroom } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
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
            {room.gameData.players.map((player) => {
              const isActive =
                room.gameData.playersStatusRecord[player._id].computedState ===
                'ACTIVE';
              const isPaused =
                room.gameData.playersStatusRecord[player._id].pausedByAdmin;

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
                <PlayerSprite key={player._id} player={player}>
                  <Typography fontSize={10} fontWeight="lighter">
                    {isActive
                      ? room.gameData.playersStatusRecord[player._id]
                          .computedState
                      : getLastActivityString(player.lastLoginAt)}
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
                    />
                  </Tooltip>
                </PlayerSprite>
              );
            })}
          </div>

          <ProgressBar
            value={calculatePercentSkillsMet(
              room.gameData.mathStandardsCompleted
            )}
          />
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

      {pausePlayer && (
        <TwoOptionDialog
          title={`Mark [${pausePlayer.name}] as ${
            room.gameData.playersStatusRecord[pausePlayer._id].pausedByAdmin
              ? 'Active'
              : 'Inactive'
          }?`}
          open={Boolean(pausePlayer)}
          actionInProgress={updating}
          option1={{
            display: 'Confirm',
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
