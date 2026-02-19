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
import { Stack, Typography } from '@mui/material';
import { Player } from '../../store/slices/player/types';
import {
  CurGameState,
  RequireInputType,
} from '../discussion-stage-builder/types';
import { RowDiv } from '../../styled-components';
import AvatarSprite from '../avatar-sprite';

enum PlayerColors {
  Blue = 'info.main',
  Green = 'success.main',
  Orange = 'warning.main',
  Lavender = 'secondary.main',
  Grey = 'text.secondary',
  Red = 'error.main',
}

interface WaitingForPlayersProps {
  numPlayersInRoom: number;
  playersBeingWaitedFor: Player[];
  currentPlayerId?: string;
  requestUserInputPhaseData: CurGameState;
  roomIsProcessing: boolean;
}

export default function WaitingForPlayers(
  props: WaitingForPlayersProps
): JSX.Element {
  const {
    numPlayersInRoom,
    playersBeingWaitedFor,
    currentPlayerId,
    requestUserInputPhaseData,
    roomIsProcessing,
  } = props;

  if (
    !playersBeingWaitedFor ||
    playersBeingWaitedFor.length === 0 ||
    roomIsProcessing ||
    numPlayersInRoom === 1
  ) {
    return <></>;
  }

  const isOrderedResponse =
    requestUserInputPhaseData.curState ===
    RequireInputType.ALL_USER_RESPONSES_REQUIRED_IN_ORDER;
  const shouldShowUpNext =
    isOrderedResponse && playersBeingWaitedFor.length > 1;

  return (
    <Stack
      direction="column"
      key={`waiting-for-players-${playersBeingWaitedFor
        .map((p) => p._id)
        .join(',')}`}
      sx={{ p: 1 }}
      spacing={2}
      style={{
        backgroundColor: '#1a699c',
        borderRadius: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 'fit-content',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
        padding: 10,
        color: 'white',
      }}
    >
      <b>Waiting for response(s) from:</b>
      {playersBeingWaitedFor.map((p, i) => (
        <React.Fragment key={`waiting-for-player-${p.name}-fragment`}>
          <RowDiv
            key={`waiting-for-player-${p.name}`}
            style={{
              backgroundColor: 'lightyellow',
              borderRadius: 10,
              opacity: i !== 0 && isOrderedResponse ? 0.8 : 1,
              marginTop: 8,
            }}
          >
            <RowDiv>
              <AvatarSprite
                player={p}
                bgColor={PlayerColors.Blue}
                border={false}
              />
              <Typography
                key={`waiting-for-player-${p.name}-text`}
                color={'black'}
              >
                <b>{p.name}</b>
              </Typography>
            </RowDiv>
            {currentPlayerId === p._id ? (
              <Typography
                color={'black'}
                style={{ width: '100%', textAlign: 'center' }}
              >
                (You)
              </Typography>
            ) : undefined}
          </RowDiv>
          {i === 0 && shouldShowUpNext && (
            <Typography
              key={`up-next-divider`}
              color={'white'}
              style={{
                textAlign: 'center',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              (up next)
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
}
