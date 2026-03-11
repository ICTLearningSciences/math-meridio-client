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
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import { clearAwayStatus } from '../../hooks/game-rooms/game-room-api';

interface AwayStatusModalProps {
  roomId: string;
  playerId: string;
  iAmAway: boolean;
}

export default function AwayStatusModal({
  roomId,
  playerId,
  iAmAway,
}: AwayStatusModalProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show modal when user is away and not in cooldown period
  useEffect(() => {
    if (iAmAway && !isInCooldown) {
      setIsOpen(true);
    }
  }, [iAmAway, isInCooldown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  const handleImHere = async () => {
    setIsLoading(true);
    try {
      await clearAwayStatus(roomId, playerId);
      setIsOpen(false);
      setIsInCooldown(true);

      // Clear any existing timeout
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }

      // Wait 6 seconds before allowing modal to reopen
      cooldownTimeoutRef.current = setTimeout(() => {
        setIsInCooldown(false);
      }, 6000);
    } catch (error) {
      console.error('Failed to clear away status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} disableEscapeKeyDown maxWidth="sm" fullWidth>
      <DialogTitle textAlign="center">Are You Still There?</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You appear to be away from your keyboard. Please confirm you&apos;re
            still here to continue playing.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleImHere}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            fullWidth
          >
            {isLoading ? 'Confirming...' : "I'm here!"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
