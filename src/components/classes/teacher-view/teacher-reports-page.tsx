/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import { Classroom } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { RoomSetupView } from './teacher-room-setup';
import { GamesDropdown } from '../../button';
import { IndividualReportCard, PhaseReportCard } from './report-card';
import { Tabs } from '../../tab';
import { useWithWindow } from '../../../hooks/use-with-window';

export default function TeacherReports(props: {
  classroom?: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();
  const { windowHeight } = useWithWindow();
  const rooms = educationalData.rooms.filter(
    (r) => r.classId === classroom?._id
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [game, setGame] = React.useState<string>();

  if (!classroom) {
    return (
      <div className="root center-div">
        <Typography variant="h6" color="error">
          Classroom not found
        </Typography>
      </div>
    );
  }

  if (rooms.length === 0) {
    return <RoomSetupView classroom={classroom} />;
  }

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id
  );
  return (
    <Tabs
      selectedTab={Number.parseInt(searchParams.get('report') || '0')}
      onSelectTab={(t) => setSearchParams({ tab: '1', report: `${t}` })}
      tabsStyle={{
        marginLeft: '20px',
        marginBottom: '20px',
      }}
      tabs={[
        {
          name: 'SUMMARY',
          element: (
            <div
              className="dashboard"
              style={{ minHeight: windowHeight - 300 }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                style={{ marginBottom: 20 }}
              >
                SUMMARY REPORT
              </Typography>
              <PhaseReportCard classroom={classroom} />
            </div>
          ),
        },
        {
          name: 'ROOM REPORTS',
          element: (
            <div
              className="dashboard"
              style={{ minHeight: windowHeight - 300 }}
            >
              <div
                className="row center-div"
                style={{ justifyContent: 'space-between' }}
              >
                <Typography variant="h5" fontWeight="bold">
                  ROOM REPORTS
                </Typography>
                <GamesDropdown
                  game={game}
                  setGame={(id: string) => setGame(id)}
                  buttonStyle={{
                    color: 'white',
                    borderColor: 'white',
                    marginLeft: '10px',
                  }}
                />
              </div>
              <div className="column spacing" style={{ marginTop: 40 }}>
                {gameRooms
                  .filter((room) => !game || room.gameData.gameId === game)
                  .map((room, rIdx) => {
                    return (
                      <IndividualReportCard
                        key={`room-${rIdx}`}
                        room={room}
                        classroom={classroom}
                      />
                    );
                  })}
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
