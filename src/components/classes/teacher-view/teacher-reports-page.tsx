/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Classroom } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { RoomSetupView } from './teacher-room-setup';
import { Tabs } from '../../tab';
import ProgressBar from '../../progress-bar';
import AvatarSprite from '../../avatar-sprite';
import SkillCard from './skill-card';
import { Room } from '../../../store/slices/game/types';

function SummaryReports(props: { classroom: Classroom }): JSX.Element {
  return (
    <div className="dashboard">
      <Typography variant="h5" fontWeight="bold">
        SUMMARY
      </Typography>
    </div>
  );
}

function IndividualReports(props: { classroom: Classroom }): JSX.Element {
  return (
    <div className="dashboard">
      <Typography variant="h5" fontWeight="bold">
        INDIVIDUAL REPORT
      </Typography>
    </div>
  );
}

function RoomsReports(props: { classroom: Classroom }): JSX.Element {
  const { classroom } = props;
  const navigate = useNavigate();
  const { educationalData } = useWithEducationalData();
  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id
  );

  const enterRoom = (room: Room) => {
    navigate(`/classes/${classroom._id}/room/${room._id}`);
  };

  return (
    <div className="dashboard">
      <Typography variant="h5" fontWeight="bold">
        ROOMS REPORT
      </Typography>
      <div className="column spacing" style={{ marginTop: 40 }}>
        {gameRooms.map((room, rIdx) => {
          return (
            <Card key={`room-${rIdx}`}>
              <CardContent
                className="column spacing"
                style={{ position: 'relative', padding: 20 }}
              >
                <Typography
                  fontSize={20}
                  fontWeight="bold"
                  style={{ marginBottom: 20 }}
                >
                  {room.name}
                </Typography>
                <ProgressBar value={25} size="large" />
                <div className="column spacing" style={{ marginTop: 20 }}>
                  <Typography>Student Contributions</Typography>
                  <div
                    className="row center-div"
                    style={{
                      borderStyle: 'solid',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: 'black',
                      justifyContent: 'space-evenly',
                      overflowX: 'scroll',
                      scrollbarWidth: 'none',
                      padding: 10,
                    }}
                  >
                    {room.gameData.players.map((player, pIdx) => {
                      return (
                        <div
                          key={`player-${pIdx}`}
                          className="column center-div"
                        >
                          <AvatarSprite
                            player={player}
                            bgColor="rgb(218, 183, 250)"
                          />
                          <Typography
                            variant="body2"
                            align="center"
                            style={{ marginTop: 5 }}
                          >
                            {player.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            style={{ marginTop: 5 }}
                          >
                            20%
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="column spacing" style={{ marginTop: 20 }}>
                  <Typography>Trouble Spots</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={7}>
                      <Card style={{ backgroundColor: 'rgb(231, 231, 231)' }}>
                        <CardContent className="column spacing">
                          <Typography>Challenge Section</Typography>
                          <SkillCard />
                          <SkillCard />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={5}></Grid>
                  </Grid>
                </div>
                <div
                  className="row"
                  style={{ width: '100%', justifyContent: 'flex-end' }}
                >
                  <Button
                    color="inherit"
                    endIcon={<ArrowForward />}
                    onClick={() => enterRoom(room)}
                  >
                    Enter Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function TeacherReports(props: {
  classroom?: Classroom;
}): JSX.Element {
  const { classroom } = props;

  if (!classroom) {
    return (
      <div className="root center-div">
        <Typography variant="h6" color="error">
          Classroom not found
        </Typography>
      </div>
    );
  }

  if (!classroom.startedAt) {
    return <RoomSetupView classId={classroom._id} />;
  }
  return (
    <Tabs
      tabsStyle={{
        position: 'absolute',
        top: '200px',
        right: '20px',
      }}
      tabs={[
        {
          name: 'SUMMARY',
          element: <SummaryReports classroom={classroom} />,
        },
        {
          name: 'ROOM REPORTS',
          element: <RoomsReports classroom={classroom} />,
        },
        {
          name: 'INDIVIDUAL REPORTS',
          element: <IndividualReports classroom={classroom} />,
        },
      ]}
    />
  );
}
