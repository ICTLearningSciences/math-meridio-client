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
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import { useAppSelector } from '../../store/hooks';
import { LoadStatus } from '../../types';
import { ClassMembershipStatus } from '../../store/slices/educational-data/types';

export default function TeacherLandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { createClassroom, educationalData } = useWithEducationalData();
  const { player } = useAppSelector((state) => state.playerData);
  const [creating, setCreating] = React.useState(false);

  const myClasses = educationalData.classes.filter(
    (c) => c.teacherId === player?._id
  );

  const handleCreateClass = async () => {
    setCreating(true);
    try {
      const newClass = await createClassroom();
      navigate(`/classes/${newClass._id}`);
    } catch (err) {
      console.error('Failed to create classroom', err);
    } finally {
      setCreating(false);
    }
  };

  const handleClassClick = (classId: string) => {
    navigate(`/classes/${classId}`);
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

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateClass}
        disabled={creating}
        style={{ marginBottom: 40 }}
      >
        {creating ? 'Creating...' : 'Create New Class'}
      </Button>

      <div className="column" style={{ width: '90%', maxWidth: 800, gap: 15 }}>
        {myClasses.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            You haven&apos;t created any classes yet. Click the button above to
            create your first class.
          </Typography>
        ) : (
          myClasses.map((classroom) => {
            const studentCount = educationalData.classMemberships.filter(
              (cm) =>
                cm.classId === classroom._id &&
                cm.status === ClassMembershipStatus.MEMBER
            ).length;

            return (
              <Card
                key={classroom._id}
                style={{
                  width: '100%',
                }}
              >
                <CardActionArea onClick={() => handleClassClick(classroom._id)}>
                  <CardContent>
                    <div
                      className="row"
                      style={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <Typography variant="h6">{classroom.name}</Typography>
                        {classroom.description && (
                          <Typography variant="body2" color="text.secondary">
                            {classroom.description}
                          </Typography>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          {studentCount}{' '}
                          {studentCount === 1 ? 'student' : 'students'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created:{' '}
                          {new Date(classroom.createdAt).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
