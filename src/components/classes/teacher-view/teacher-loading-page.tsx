/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { LoadStatus } from '../../../types';

export default function TeacherLoading(): JSX.Element {
  const { player } = useAppSelector((state) => state.playerData);
  const { educationalData, createClassroom } = useWithEducationalData();
  const [creating, setCreating] = React.useState(false);
  const myClasses = educationalData.classes.filter(
    (c) => c.teacherId === player?._id
  );

  const handleCreateClass = async () => {
    setCreating(true);
    try {
      await createClassroom();
    } catch (err) {
      console.error('Failed to create classroom', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="root center-div">
      <img height={100} src="/logo.png" alt="image" />
      <Typography
        variant="h4"
        fontWeight="bold"
        color="rgb(65, 32, 116)"
        style={{ marginTop: 20, marginBottom: 20 }}
      >
        Welcome, {player?.name || 'Teacher Name'}
      </Typography>

      {educationalData.hydrationLoadStatus.status === LoadStatus.IN_PROGRESS ? (
        <CircularProgress />
      ) : myClasses.length === 0 ? (
        <div>
          <Typography variant="body1" align="center">
            Click the button below to create your first class.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={creating}
            onClick={handleCreateClass}
            style={{ marginTop: 20 }}
          >
            {creating ? 'Creating...' : 'Create New Class'}
          </Button>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
