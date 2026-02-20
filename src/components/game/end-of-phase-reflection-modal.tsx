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
  Stack,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import { Room } from '../../store/slices/game/types';
import { Player } from '../../store/slices/player/types';
import AvatarSprite from '../avatar-sprite';
import {
  submitGamePhaseReflection,
  submitReadyToContinue,
} from '../../hooks/game-rooms/game-room-api';

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
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <AvatarSprite player={player} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {player.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
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
  const studentReflections =
    room.gameData.curGameState.studentReflections || {};
  const players = room.gameData.players;
  const isMultiplayer = players.length > 1;

  const isEndOfPhaseReflection = curState === 'END_OF_PHASE_REFLECTION';
  const isWaitingForReady =
    curState === 'WAITING_FOR_STUDENT_READY_TO_CONTINUE';
  const isOpen = isEndOfPhaseReflection || isWaitingForReady;

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
    } catch (error) {
      console.error('Failed to submit ready to continue:', error);
      setHasSubmittedReady(false);
    } finally {
      setIsSubmittingReady(false);
    }
  };

  const renderButtons = () => {
    // Submit Reflection button - always shown
    const isSubmitDisabled =
      !reflectionText.trim() || isSubmittingReflection || hasLocallySubmitted;

    const submitButton = (
      <Button
        variant="contained"
        onClick={handleSubmitReflection}
        disabled={isSubmitDisabled}
        fullWidth
      >
        {isSubmittingReflection ? (
          <>
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            Submitting...
          </>
        ) : (
          'Submit Reflection'
        )}
      </Button>
    );

    // Ready to Continue button - only shown in WAITING_FOR_STUDENT_READY_TO_CONTINUE state
    if (isWaitingForReady) {
      const isReadyDisabled =
        !hasSubmittedReflection || isSubmittingReady || hasSubmittedReady;
      const readyButton = (
        <Button
          variant="contained"
          onClick={handleReadyToContinue}
          disabled={isReadyDisabled}
          fullWidth
          sx={{
            backgroundColor: hasSubmittedReady ? 'success.main' : undefined,
            '&:hover': {
              backgroundColor: hasSubmittedReady ? 'success.dark' : undefined,
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
      );

      return (
        <Stack spacing={2}>
          {submitButton}
          {readyButton}
        </Stack>
      );
    }

    // In END_OF_PHASE_REFLECTION state, only show submit button
    return submitButton;
  };

  if (!isOpen) return <></>;

  return (
    <Dialog open={isOpen} maxWidth="lg" fullWidth disableEscapeKeyDown>
      <DialogTitle style={{ textAlign: 'center' }}>
        Phase Reflection
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMultiplayer ? 'row' : 'column',
            gap: 3,
            minHeight: 400,
            paddingTop: 2,
          }}
        >
          {/* Left side: Question and Input */}
          <Box sx={{ flex: isMultiplayer ? 1 : undefined, width: '100%' }}>
            <Typography
              variant="h6"
              gutterBottom
              style={{ textAlign: 'center' }}
            >
              {selectedQuestion}
            </Typography>
            <TextField
              multiline
              rows={8}
              fullWidth
              value={reflectionText}
              onChange={(e) => handleReflectionChange(e.target.value)}
              placeholder="Write your reflection here..."
              variant="outlined"
              sx={{ marginBottom: 2 }}
            />
            {renderButtons()}
          </Box>

          {/* Right side: Player Reflections (only in multiplayer) */}
          {isMultiplayer && (
            <Box
              sx={{
                flex: 1,
                borderLeft: '2px solid #e0e0e0',
                paddingLeft: 3,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                style={{ textAlign: 'center' }}
              >
                Player Reflections
              </Typography>
              <Stack spacing={2} sx={{ maxHeight: 500, overflowY: 'auto' }}>
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
              </Stack>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
