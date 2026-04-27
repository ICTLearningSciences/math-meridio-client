/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useRef } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { useWithEducationalData } from '../store/slices/educational-data/use-with-educational-data';
import { EducationalRole } from '../store/slices/player/types';
import { useLocation } from 'react-router-dom';

export function RefreshRequestButton(props: { autoRefreshTime?: number }) {
  const { player } = useAppSelector((state) => state.playerData);
  const { fetchInstructorDataHydration, fetchStudentDataHydration } =
    useWithEducationalData();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { pathname } = useLocation();

  const pingTime =
    props.autoRefreshTime ||
    (player?.educationalRole === EducationalRole.INSTRUCTOR ? 60 : 30);
  const pingRef = useRef(refreshButtonClick);

  React.useEffect(() => {
    if (!player || !pingTime || !pathname.includes('/classes')) {
      return;
    }
    if (
      player.educationalRole === EducationalRole.STUDENT &&
      pathname.includes('/room')
    ) {
      return;
    }
    let isActive = true;
    const poll = async () => {
      if (!isActive) return;
      try {
        // Wait for both request to complete (success or failure)
        await Promise.all([pingRef.current()]);
      } catch (error) {
        // Continue polling even if there's an error
        console.error('Polling error:', error);
      }
      // Schedule next poll after 1 second, only if still active
      if (isActive) {
        setTimeout(() => poll(), pingTime * 1000);
      }
    };
    // Start polling immediately
    poll();
    // Cleanup: stop polling when playerId changes or component unmounts
    return () => {
      isActive = false;
    };
  }, [player?._id, pathname]); // Only depend on playerId

  async function refreshButtonClick() {
    setIsLoading(true);
    try {
      if (player?.educationalRole === EducationalRole.INSTRUCTOR) {
        await fetchInstructorDataHydration();
      } else if (player?.educationalRole === EducationalRole.STUDENT) {
        await fetchStudentDataHydration();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!player) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {isLoading ? (
        <CircularProgress size={24} style={{ color: 'white' }} />
      ) : (
        <Button
          variant="text"
          style={{
            color: 'white',
            opacity: 0.9,
            textTransform: 'none',
          }}
          onClick={refreshButtonClick}
        >
          Refresh
        </Button>
      )}
    </div>
  );
}
