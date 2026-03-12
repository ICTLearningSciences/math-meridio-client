/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { PlayerStatusData, Room } from '../store/slices/game/types';

interface HelpRequestButtonProps {
  myStatusInRoom: PlayerStatusData | undefined;
  setPlayerNeedsHelpInRoom: (needsHelp: boolean) => Promise<Room>;
}

export function HelpRequestButton(props: HelpRequestButtonProps) {
  const { myStatusInRoom, setPlayerNeedsHelpInRoom } = props;
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleHelpRequest = async (needsHelp: boolean) => {
    setIsLoading(true);
    try {
      await setPlayerNeedsHelpInRoom(needsHelp);
    } catch (error) {
      console.error('Error setting help request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!myStatusInRoom) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {isLoading ? (
        <CircularProgress size={24} style={{ color: 'white' }} />
      ) : (
        <>
          {!myStatusInRoom.needsHelpInRoom ? (
            <Button
              variant="text"
              style={{ color: 'white', opacity: 0.9 }}
              onClick={() => handleHelpRequest(true)}
            >
              Request Help?
            </Button>
          ) : (
            <Button
              variant="text"
              style={{ color: 'white' }}
              onClick={() => handleHelpRequest(false)}
            >
              Cancel Help Request
            </Button>
          )}
        </>
      )}
    </div>
  );
}
