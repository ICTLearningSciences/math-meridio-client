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
import React, { useEffect, useState, useRef } from 'react';
import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import { Player } from '../../store/slices/player/types';
import {
  CurGameState,
  RequireInputType,
} from '../discussion-stage-builder/types';
import { RowDiv } from '../../styled-components';
import AvatarSprite from '../avatar-sprite';
import { Room } from '../../store/slices/game/types';

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
  isInRequestUserInputState: boolean;
  reportPlayerAway: (userIdToReportAway: string) => Promise<Room>;
  requestInputStartTime: number | null; // Timestamp when isInRequestUserInputState became true
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
    isInRequestUserInputState,
    reportPlayerAway,
    requestInputStartTime,
  } = props;

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [reportingPlayerId, setReportingPlayerId] = useState<string | null>(
    null
  );
  const [recentlyReportedPlayers, setRecentlyReportedPlayers] = useState<
    Set<string>
  >(new Set());
  const reportTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update current time every second to check if 60 seconds have passed
  useEffect(() => {
    if (!requestInputStartTime || !isInRequestUserInputState) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [requestInputStartTime, isInRequestUserInputState]);

  const has60SecondsPassed =
    requestInputStartTime !== null &&
    currentTime - requestInputStartTime >= 60000;

  const handleReportAway = async (playerId: string) => {
    setReportingPlayerId(playerId);
    try {
      await reportPlayerAway(playerId);

      // Show "Reported" for 5 seconds
      setReportingPlayerId(null);
      setRecentlyReportedPlayers((prev) => new Set(prev).add(playerId));

      // Clear any existing timeout for this player
      if (reportTimeoutRefs.current.has(playerId)) {
        clearTimeout(reportTimeoutRefs.current.get(playerId)!);
      }

      // Set timeout to remove from recently reported after 5 seconds
      const timeout = setTimeout(() => {
        setRecentlyReportedPlayers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(playerId);
          return newSet;
        });
        reportTimeoutRefs.current.delete(playerId);
      }, 5000);

      reportTimeoutRefs.current.set(playerId, timeout);
    } catch (error) {
      console.error('Failed to report player away:', error);
      setReportingPlayerId(null);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      reportTimeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  if (
    !playersBeingWaitedFor ||
    playersBeingWaitedFor.length === 0 ||
    roomIsProcessing ||
    numPlayersInRoom === 1 ||
    !isInRequestUserInputState
  ) {
    return <></>;
  }

  const isOrderedResponse =
    requestUserInputPhaseData.curState ===
    RequireInputType.ALL_USER_RESPONSES_REQUIRED_IN_ORDER;
  const shouldShowUpNext =
    isOrderedResponse && playersBeingWaitedFor.length > 1;

  const shouldShowReportButton = (
    playerIndex: number,
    playerId: string
  ): boolean => {
    if (currentPlayerId === playerId) {
      return false;
    }
    if (isOrderedResponse) {
      return playerIndex === 0 && has60SecondsPassed;
    }
    return has60SecondsPassed;
  };

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
            ) : shouldShowReportButton(i, p._id) ? (
              <Button
                variant="text"
                size="small"
                onClick={() => handleReportAway(p._id)}
                disabled={
                  reportingPlayerId === p._id ||
                  recentlyReportedPlayers.has(p._id)
                }
                sx={{
                  minWidth: '100px',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  width: 'fit-content',
                }}
              >
                {reportingPlayerId === p._id ? (
                  <CircularProgress size={16} sx={{ color: 'black' }} />
                ) : recentlyReportedPlayers.has(p._id) ? (
                  'Reported'
                ) : (
                  'Report Away'
                )}
              </Button>
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
