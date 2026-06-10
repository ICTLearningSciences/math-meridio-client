/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Typography } from '@mui/material';
import { Archive, ContentCopy, Mail, Unarchive } from '@mui/icons-material';

import { useAppSelector } from '../../../store/hooks';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { ClassDropdown, OutlinedButton } from '../../button';
import { LoadStatus } from '../../../types';
import { Tabs } from '../../tab';
import TeacherLoading from './teacher-loading-page';
import TeacherHome from './teacher-home-page';
import TeacherReports from './teacher-reports-page';
import TeacherManageClass from './teacher-manage-class';
import TeacherEvents from './teacher-events-page';
import { Classroom } from '../../../store/slices/educational-data/types';

export default function TeacherLandingPage(): JSX.Element {
  const {
    educationalData,
    adjustClassroomArchiveStatus,
    copyAndArchiveClassroom,
  } = useWithEducationalData();
  const { player } = useAppSelector((state) => state.playerData);
  const [classId, setClassId] = React.useState<string>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loaded, setLoaded] = React.useState<boolean>(false);

  const tab = Number.parseInt(searchParams.get('tab') || '0');
  const myClasses =
    educationalData?.classes
      ?.filter((c) => c.teacherId === player?._id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) || [];
  const myClass = myClasses.find((c) => c._id === classId);
  const myRooms =
    educationalData?.rooms?.filter((r) => r.classId === myClass?._id) || [];
  const myNotifs =
    educationalData?.notifications?.filter((e) => !e.dismissedAt) || [];

  React.useEffect(() => {
    return () => {
      setLoaded(false);
    };
  }, []);

  React.useEffect(() => {
    if (loaded) return;
    if (educationalData.hydrationLoadStatus.status === LoadStatus.DONE) {
      setLoaded(true);
    }
  }, [educationalData.hydrationLoadStatus.status]);

  React.useEffect(() => {
    if (!classId && myClasses.length > 0) {
      setClassId(myClasses.find((c) => !c.archivedAt)?._id);
    }
  }, [myClasses]);

  function onArchive(c: Classroom): void {
    adjustClassroomArchiveStatus(c._id, !c.archivedAt);
  }

  async function onCopyAndArchive(c: Classroom): Promise<void> {
    const newClass = await copyAndArchiveClassroom(c._id);
    setClassId(newClass.updatedClassroom._id);
  }

  if (!loaded || myClasses.length === 0) {
    return <TeacherLoading />;
  }

  return (
    <div
      className="column"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <div className="row spacing center-div" style={{ padding: 20 }}>
        <Typography fontSize={18} fontWeight="bold">
          {tab === 0
            ? 'Teacher Home'
            : tab === 1
            ? 'Reports'
            : tab === 2
            ? 'Manage Class'
            : 'Notifications'}
        </Typography>
        <ClassDropdown
          myClass={myClass}
          classId={classId}
          setClassId={setClassId}
        />
        <div style={{ flexGrow: 1 }} />
        {myClass && (
          <OutlinedButton
            color="secondary"
            onClick={() => onArchive(myClass)}
            icon={myClass.archivedAt ? <Unarchive /> : <Archive />}
          >
            {myClass.archivedAt ? 'Unarchive Class' : 'Archive Class'}
          </OutlinedButton>
        )}
        {myClass && (
          <OutlinedButton
            color="secondary"
            onClick={() => onCopyAndArchive(myClass)}
            icon={<ContentCopy />}
          >
            Copy & Archive Class
          </OutlinedButton>
        )}
      </div>
      <Tabs
        selectedTab={tab}
        onSelectTab={(t) => setSearchParams({ ...searchParams, tab: `${t}` })}
        tabsStyle={{
          position: 'absolute',
          top: '20px',
          left: '150px',
        }}
        tabs={[
          {
            name: 'HOME',
            element: <TeacherHome classroom={myClass} />,
          },
          {
            name: 'REPORTS',
            element: <TeacherReports classroom={myClass} />,
            disabled: myRooms.length === 0,
          },
          {
            name: 'MANAGE CLASS',
            element: <TeacherManageClass classroom={myClass} />,
          },
          {
            name: 'NOTIFICATIONS',
            tabIcon:
              myNotifs.length > 0 ? (
                <Badge badgeContent={myNotifs.length} color="success">
                  <Mail color="action" />
                </Badge>
              ) : undefined,
            element: <TeacherEvents />,
          },
        ]}
      />
    </div>
  );
}
