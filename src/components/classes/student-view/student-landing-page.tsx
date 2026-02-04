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
import { Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { LoadStatus } from '../../../types';
import { ClassMembershipStatus } from '../../../store/slices/educational-data/types';
import { extractErrorMessageFromError } from '../../../helpers';
import { StudentClassroomCard } from './student-classroom-card';

export default function StudentLandingPage(): JSX.Element {
  const { joinClassroom, educationalData } = useWithEducationalData();
  const [inviteCode, setInviteCode] = React.useState('');
  const [joining, setJoining] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const myClassMemberships = educationalData.classMemberships.filter(
    (cm) => cm.status === ClassMembershipStatus.MEMBER
  );
  const myClasses = educationalData.classes.filter((c) =>
    myClassMemberships.some((cm) => cm.classId === c._id)
  );

  const handleJoinClass = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    setJoining(true);
    setError(undefined);
    try {
      await joinClassroom(inviteCode);
      setInviteCode('');
    } catch (err) {
      setError(extractErrorMessageFromError(err) || 'Failed to join classroom');
    } finally {
      setJoining(false);
    }
  };

  if (educationalData.hydrationLoadStatus.status === LoadStatus.IN_PROGRESS) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      className="column"
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Typography variant="h4" style={{ marginBottom: 20 }}>
        My Classes
      </Typography>

      <div
        className="column"
        style={{ width: '90%', maxWidth: 600, marginBottom: 40 }}
      >
        <Typography variant="h6" style={{ marginBottom: 10 }}>
          Join a Class
        </Typography>
        <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <TextField
            data-cy="join-class-invite-code-input"
            fullWidth
            label="Class Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinClass()}
            error={Boolean(error)}
            helperText={error}
            disabled={joining}
          />
          <Button
            data-cy="join-class-join-button"
            variant="contained"
            color="primary"
            onClick={handleJoinClass}
            disabled={joining}
            style={{ height: 56 }}
          >
            {joining ? 'Joining...' : 'Join'}
          </Button>
        </div>
      </div>

      <div className="column" style={{ width: '90%', maxWidth: 800, gap: 15 }}>
        {myClasses.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            You haven&apos;t joined any classes yet. Enter an invite code above
            to join your first class.
          </Typography>
        ) : (
          myClasses.map((classroom) => {
            return (
              <StudentClassroomCard
                key={classroom._id}
                classroom={classroom}
                classMemberships={myClassMemberships}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
