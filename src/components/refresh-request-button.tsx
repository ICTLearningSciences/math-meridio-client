/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
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
  const { pathname, search } = useLocation();

  const pingTime =
    props.autoRefreshTime ||
    (player?.educationalRole === EducationalRole.INSTRUCTOR ? 60 : 30);
  const [poll, setPoll] = React.useState<NodeJS.Timeout>();

  React.useEffect(() => {
    if (poll) {
      clearInterval(poll);
      setPoll(undefined);
    }
    if (
      player &&
      pingTime &&
      pathname.includes('/classes') &&
      !pathname.includes('/room/') &&
      !search.includes('tab=2')
    ) {
      const timeoutId = setInterval(refresh, pingTime * 1000);
      setPoll(timeoutId);
    }
    return () => {
      if (poll) {
        clearInterval(poll);
        setPoll(undefined);
      }
    };
  }, [player?._id, pathname, search]); // Only depend on playerId

  async function refresh() {
    if (isLoading) return;
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

  if (
    !player ||
    !pingTime ||
    !pathname.includes('/classes') ||
    pathname.includes('/room/') ||
    search.includes('tab=2')
  ) {
    return null;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
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
          onClick={refresh}
        >
          Refresh
        </Button>
      )}
    </div>
  );
}
