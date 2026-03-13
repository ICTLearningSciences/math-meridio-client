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
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Check, Send } from '@mui/icons-material';
import { Room } from '../../store/slices/game/types';
import { Player } from '../../store/slices/player/types';
import AvatarSprite from '../avatar-sprite';
import {
  submitGamePhaseReflection,
  submitReadyToContinue,
} from '../../hooks/game-rooms/game-room-api';
import { ColumnDiv } from '../../styled-components';

interface PlayerReflectionDisplayItemProps {
  player: Player;
  reflection?: string;
}

function PlayerReflectionDisplayItem({
  player,
  reflection,
}: PlayerReflectionDisplayItemProps): JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        border: '1px solid',
        borderRadius: 2,
        width: '25%',
        height: '125px',
      }}
    >
      <ColumnDiv
        style={{
          alignItems: 'center',
        }}
      >
        <AvatarSprite player={player} />
        <Typography fontWeight="bold">{player.name}</Typography>
      </ColumnDiv>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {reflection || '…'}
        </Typography>
      </Box>
    </Box>
  );
}

interface EndOfPhaseReflectionModalProps {
  room: Room;
  player: Player;
  fetchRoom: (roomId: string) => Promise<Room>;
}

export default function EndOfPhaseReflectionModal({
  room,
  player,
  fetchRoom,
}: EndOfPhaseReflectionModalProps): JSX.Element {
  const [reflectionText, setReflectionText] = useState('');
  const [lastSubmittedReflection, setLastSubmittedReflection] = useState('');
  const [locallySubmittedReflection, setLocallySubmittedReflection] =
    useState('');
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [isSubmittingReady, setIsSubmittingReady] = useState(false);
  const [hasLocallySubmitted, setHasLocallySubmitted] = useState(false);
  const [hasSubmittedReady, setHasSubmittedReady] = useState(false);

  const curState = room.gameData.curGameState.curState;
  const selectedQuestion = room.gameData.curGameState.selectedQuestion || '';
  const phaseTitle = room.gameData.phaseProgression.curPhaseTitle;
  const studentReflections =
    room.gameData.curGameState.studentReflections || {};
  const players = room.gameData.players;
  const isMultiplayer = players.length > 1;

  const isInWaitingState = curState === 'WAITING_FOR_STUDENT_READY_TO_CONTINUE';
  const isEndOfPhaseReflection = curState === 'END_OF_PHASE_REFLECTION';
  const isOpen = isEndOfPhaseReflection || isInWaitingState;

  const currentPlayerReflection = studentReflections[player._id];
  const hasSubmittedReflection =
    Boolean(currentPlayerReflection) || hasLocallySubmitted;

  const handleReflectionChange = (text: string) => {
    setReflectionText(text);
    // Reset local submission state if user edits after submitting
    if (hasLocallySubmitted && text !== lastSubmittedReflection) {
      setHasLocallySubmitted(false);
      setLocallySubmittedReflection('');
    }
  };

  const handleSubmitReflection = async () => {
    if (!reflectionText.trim()) return;

    setIsSubmittingReflection(true);
    try {
      await submitGamePhaseReflection(room._id, reflectionText);
      // Optimistic UI update
      setLastSubmittedReflection(reflectionText);
      setLocallySubmittedReflection(reflectionText);
      setHasLocallySubmitted(true);
      await fetchRoom(room._id);
    } catch (error) {
      console.error('Failed to submit reflection:', error);
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  const handleReadyToContinue = async () => {
    setIsSubmittingReady(true);
    try {
      await submitReadyToContinue(room._id);
      setHasSubmittedReady(true);
      // turn back to false after 4 seconds
      setTimeout(() => {
        setHasSubmittedReady(false);
      }, 4000);
    } catch (error) {
      console.error('Failed to submit ready to continue:', error);
      setHasSubmittedReady(false);
    } finally {
      setIsSubmittingReady(false);
    }
  };

  const isSubmitDisabled =
    !reflectionText.trim() || isSubmittingReflection || hasLocallySubmitted;

  const isReadyDisabled =
    !hasSubmittedReflection ||
    isSubmittingReady ||
    hasSubmittedReady ||
    !isInWaitingState;

  if (!isOpen) return <></>;

  return (
    <Dialog open={isOpen} maxWidth="lg" fullWidth disableEscapeKeyDown>
      <DialogContent>
        <DialogTitle style={{ textAlign: 'center' }}>
          Reflection {phaseTitle ? `- ${phaseTitle}` : ''}
        </DialogTitle>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 3,
            minHeight: 400,
            paddingTop: 2,
          }}
        >
          {/* Question at top */}
          <Typography variant="h6" gutterBottom style={{ textAlign: 'left' }}>
            {selectedQuestion}
          </Typography>

          {/* Player Reflections (horizontal scroll in multiplayer) */}
          {isMultiplayer && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                style={{ textAlign: 'left' }}
              >
                Player Reflections
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  overflowX: 'auto',
                  paddingBottom: 1,
                }}
              >
                {players.map((p) => {
                  // Show optimistic reflection for current player
                  const reflection =
                    p._id === player._id && locallySubmittedReflection
                      ? locallySubmittedReflection
                      : studentReflections[p._id];
                  return (
                    <PlayerReflectionDisplayItem
                      key={p._id}
                      player={p}
                      reflection={reflection}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Input section */}
          <Box
            sx={{ display: 'flex', gap: 2, width: '100%', borderRadius: 10 }}
          >
            <TextField
              multiline
              minRows={2}
              maxRows={8}
              value={reflectionText}
              onChange={(e) => handleReflectionChange(e.target.value)}
              placeholder="Write your reflection here..."
              variant="outlined"
              style={{ borderRadius: 10 }}
              sx={{ flex: 1, borderRadius: 10 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSubmitReflection}
                      disabled={isSubmitDisabled}
                      edge="end"
                      style={{
                        height: '100%',
                        color: 'black',
                      }}
                    >
                      {isSubmittingReflection ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Send />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {isInWaitingState && (
              <Button
                variant="contained"
                onClick={handleReadyToContinue}
                disabled={isReadyDisabled}
                sx={{
                  width: '20%',
                  backgroundColor: hasSubmittedReady
                    ? 'success.main'
                    : undefined,
                  '&:hover': {
                    backgroundColor: hasSubmittedReady
                      ? 'success.dark'
                      : undefined,
                  },
                }}
              >
                {isSubmittingReady ? (
                  <CircularProgress size={24} color="inherit" />
                ) : hasSubmittedReady ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Check />
                    <span>Ready!</span>
                  </Box>
                ) : (
                  'Ready to continue!'
                )}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
