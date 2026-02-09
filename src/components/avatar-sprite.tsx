/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Player } from '../store/slices/player';

function AvatarSprite(props: {
  player: Player | undefined;
  bgColor?: string;
  border?: boolean
}): JSX.Element {
  const { player } = props;

  if (!player) return <div />;
  return (
    <div
      style={{
        position: 'relative',
        height: 40,
        width: 40,
        minHeight: 40,
        minWidth: 40,
        borderRadius: 40,
        border: props.border ? '3px solid lightseagreen' : 'none',
        backgroundColor: props.bgColor || 'white',
      }}
    >
      {player.avatar
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
              left: 4,
              top: 0,
              width: 32,
              height: 40,
              backgroundPosition: `top left -${
                a.variant ? a.variant * 32 * 8 : 0
              }px`,
            }}
          />
        ))}
    </div>
  );
}

export default AvatarSprite;
