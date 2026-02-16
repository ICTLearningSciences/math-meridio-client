/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Button, Typography } from '@mui/material';

import { useAppSelector } from '../../store/hooks';
import { useWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import { ClassMembershipStatus } from '../../store/slices/educational-data/types';
import { DropdownButton } from '../button';
import { LoadStatus } from '../../types';
import { Tabs } from '../tab';
import TeacherHome from './teacher-view/teacher-home-page';
import TeacherManageClass from './teacher-view/teacher-manage-class';
import TeacherLoading from './teacher-view/teacher-loading-page';

export default function TeacherLandingPage(): JSX.Element {
  const { educationalData, createClassroom } = useWithEducationalData();
  const { player } = useAppSelector((state) => state.playerData);

  const [classId, setClassId] = React.useState<string>();
  const [creating, setCreating] = React.useState(false);

  const myClasses = educationalData.classes.filter(
    (c) => c.teacherId === player?._id
  );
  const myClass = myClasses.find((c) => c._id === classId);

  React.useEffect(() => {
    if (!classId && myClasses.length > 0) {
      setClassId(myClasses[0]._id);
    }
  }, [myClasses]);

  const handleCreateClass = async () => {
    setCreating(true);
    try {
      const newClass = await createClassroom();
      setClassId(newClass._id);
    } catch (err) {
      console.error('Failed to create classroom', err);
    } finally {
      setCreating(false);
    }
  };

  if (
    educationalData.hydrationLoadStatus.status === LoadStatus.IN_PROGRESS ||
    myClasses.length === 0
  ) {
    return <TeacherLoading />;
  }

  return (
    <div
      className="column"
      style={{
        width: '100%',
        height: '100%',
        padding: 20,
      }}
    >
      <div style={{ padding: 20 }}>
        {myClasses.length === 0 ? (
          <Typography variant="body1" color="error" align="center">
            You haven&apos;t created any classes yet. Click the button below to
            create your first class.
          </Typography>
        ) : (
          <div className="column spacing">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <DropdownButton
                label={myClass?.name || 'My Class'}
                value={classId}
                items={myClasses.map((c) => c._id)}
                onSelect={(id: string) => setClassId(id)}
                renderItem={(id) => {
                  const classroom = myClasses.find((c) => c._id === id);
                  if (!classroom) return <></>;
                  const studentCount = educationalData.classMemberships.filter(
                    (cm) =>
                      cm.classId === classroom?._id &&
                      cm.status === ClassMembershipStatus.MEMBER
                  ).length;
                  return (
                    <div
                      className="row"
                      style={{
                        width: '100%',
                        padding: 5,
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
                  );
                }}
              >
                <div className="row center-div">
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={creating}
                    onClick={handleCreateClass}
                  >
                    {creating ? 'Creating...' : 'Create New Class'}
                  </Button>
                </div>
              </DropdownButton>
            </div>
            <Tabs
              tabs={[
                {
                  name: 'HOME',
                  element: <TeacherHome classroom={myClass} />,
                },
                {
                  name: 'ANALYTICS / REPORTS',
                  element: '',
                },
                {
                  name: 'MANAGE CLASS',
                  element: <TeacherManageClass classroom={myClass} />,
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
