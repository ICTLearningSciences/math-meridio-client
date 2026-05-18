/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';

import {
  ClassMembershipStatus,
  Classroom,
} from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { Tabs } from '../../tab';
import { RoomSetupView } from './teacher-room-setup';
import TeacherInviteCode from './teacher-invite-code';
import { useWithWindow } from '../../../hooks/use-with-window';

function TeacherSummary(props: { classroom?: Classroom }): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();

  const studentMemberships = educationalData.classMemberships.filter(
    (cm) =>
      cm.classId === classroom?._id &&
      cm.status === ClassMembershipStatus.MEMBER
  );
  const students = educationalData.students.filter((s) =>
    studentMemberships.some((sm) => sm.userId === s._id)
  );
  const rooms = educationalData.rooms.filter(
    (r) => r.classId === classroom?._id
  );

  if (!classroom) {
    return (
      <div className="root center-div">
        <Typography variant="h6" color="error">
          Classroom not found
        </Typography>
      </div>
    );
  }

  return (
    <div className="column spacing">
      <Typography fontSize={16} fontWeight="bold">
        STUDENTS
      </Typography>
      <Card style={{ borderRadius: 10 }}>
        <CardContent
          className="column spacing"
          style={{ position: 'relative', padding: 20 }}
        >
          {students.length === 0 ? (
            <Typography variant="body2" color="error">
              No students have joined yet
            </Typography>
          ) : (
            <TableContainer
              sx={{
                borderRadius: 3,
                border: 1,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Current Room #</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const room = rooms.find((r) =>
                      r.gameData.players.find((s) => s._id === student._id)
                    );
                    const groupId = studentMemberships.find(
                      (s) => s.userId === student._id
                    )?.groupId;
                    return (
                      <TableRow key={student._id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student._id}</TableCell>
                        <TableCell>
                          {new Date(student.lastLoginAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {room && groupId !== undefined ? groupId + 1 : 'none'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TeacherEditClass(props: {
  classroom?: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { updateClassNameDescription } = useWithEducationalData();

  const [className, setClassName] = React.useState('');
  const [classDescription, setClassDescription] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (classroom) {
      setClassName(classroom.name);
      setClassDescription(classroom.description || '');
    }
  }, [classroom]);

  const handleUpdateClass = async () => {
    if (!classroom) return;
    setCreating(true);
    try {
      await updateClassNameDescription(
        classroom._id,
        className,
        classDescription
      );
    } catch (err) {
      console.error('Failed to update class', err);
    } finally {
      setCreating(false);
    }
  };

  if (!classroom) {
    return (
      <div className="root center-div">
        <Typography variant="h6" color="error">
          Classroom not found
        </Typography>
      </div>
    );
  }

  return (
    <div className="column spacing">
      <Typography fontSize={16} fontWeight="bold">
        EDIT CLASS
      </Typography>
      <Card style={{ borderRadius: 10 }}>
        <CardContent
          className="column spacing"
          style={{ position: 'relative', padding: 20 }}
        >
          <TextField
            fullWidth
            label="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            style={{ marginTop: 10, marginBottom: 20 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={classDescription}
            onChange={(e) => setClassDescription(e.target.value)}
            multiline
            rows={3}
          />
          <div className="row spacing">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={
                creating ||
                !className ||
                (classroom.name === className &&
                  classroom.description === classDescription)
              }
              onClick={handleUpdateClass}
              startIcon={<Save />}
            >
              {creating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <TeacherInviteCode classroom={classroom} />
    </div>
  );
}

export default function TeacherManageClass(props: {
  classroom?: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const { windowHeight } = useWithWindow();

  if (!classroom) {
    return (
      <div className="root center-div">
        <Typography variant="h6" color="error">
          Classroom not found
        </Typography>
      </div>
    );
  }
  return (
    <Tabs
      selectedTab={Number.parseInt(searchParams.get('manage') || '0')}
      onSelectTab={(t) => setSearchParams({ tab: '2', manage: `${t}` })}
      tabsStyle={{
        marginLeft: '20px',
        marginBottom: '20px',
      }}
      tabs={[
        {
          name: 'DETAILS',
          element: (
            <div
              className="dashboard"
              style={{ minHeight: windowHeight - 300 }}
            >
              <TeacherEditClass classroom={classroom} />
            </div>
          ),
        },
        {
          name: 'STUDENTS',
          element: (
            <div
              className="dashboard"
              style={{ minHeight: windowHeight - 300 }}
            >
              <TeacherSummary classroom={classroom} />
            </div>
          ),
        },
        {
          name: 'GROUP FORMATION',
          element: (
            <div
              className="dashboard"
              style={{ minHeight: windowHeight - 300 }}
            >
              <RoomSetupView classroom={classroom} />
            </div>
          ),
        },
      ]}
    />
  );
}
