/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import {
  ClassMembership,
  ClassMembershipStatus,
  Classroom,
} from '../../../store/slices/educational-data/types';
import { useNavigate } from 'react-router-dom';

export function StudentClassroomCard(props: {
  classroom: Classroom;
  classMemberships: ClassMembership[];
}): JSX.Element {
  const navigate = useNavigate();
  const { classroom, classMemberships } = props;
  const studentCount = classMemberships.filter(
    (cm) =>
      cm.classId === classroom._id && cm.status === ClassMembershipStatus.MEMBER
  ).length;

  const handleClassClick = (classId: string) => {
    navigate(`/classes/${classId}`);
  };
  return (
    <Card
      data-cy={`student-classroom-card-${classroom._id}`}
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
                {studentCount} {studentCount === 1 ? 'student' : 'students'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(classroom.createdAt).toLocaleDateString()}
              </Typography>
            </div>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
