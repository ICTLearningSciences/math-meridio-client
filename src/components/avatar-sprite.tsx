/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Player } from '../store/slices/player/types';
import { Pause } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { PlayerStatusData } from '../store/slices/game/types';

export function PlayerSprite(props: {
  player: Player | undefined;
  status?: PlayerStatusData;
  children?: React.ReactNode;
}): JSX.Element {
  const { player, status } = props;
  if (!player) return <div />;
  return (
    <div key={player._id} className="column center-div">
      <AvatarSprite
        player={player}
        bgColor="rgb(218, 183, 250)"
        isPaused={status?.pausedByAdmin}
      />
      <Typography
        variant="body2"
        fontSize={12}
        fontWeight="bold"
        align="center"
        style={{ marginTop: 5 }}
      >
        {player.name}
      </Typography>
      {props.children}
    </div>
  );
}

export default function AvatarSprite(props: {
  player: Player | undefined;
  isPaused?: boolean;
  bgColor?: string;
  border?: boolean;
}): JSX.Element {
  const { player } = props;

  if (!player) return <div />;
  return (
    <div
      style={{
        position: 'relative',
        height: 40,
        width: 40,
        borderRadius: 40,
        padding: 3,
        border: props.border ? '1px solid rgb(114, 20, 201)' : 'none',
        backgroundColor: props.bgColor || 'white',
      }}
    >
      {props.isPaused ? (
        <div
          className="column center-div"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 40,
            backgroundColor: 'black',
            opacity: 0.3,
          }}
        >
          <Pause style={{ color: 'white' }} />
        </div>
      ) : (
        player.avatar
          .filter((a) => a.id && a.type)
          .map((a) => (
            <div
              key={a.id}
              style={{
                backgroundImage: `url(/assets/avatar/sprite/${
                  a.type?.split('_')[1]
                }/${a.id}.png)`,
                position: 'absolute',
                transform: 'scale(1.5)',
                left: 7,
                top: 1,
                width: 32,
                height: 40,
                backgroundPosition: `top left -${
                  a.variant ? a.variant * 32 * 8 : 0
                }px`,
              }}
            />
          ))
      )}
    </div>
  );
}
