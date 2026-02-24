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
import { PlayerSprite } from '../../avatar-sprite';
import SkillCard from './skill-card';
import { Room, SenderType } from '../../../store/slices/game/types';
import { getPercentString } from '../../../helpers';

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
          const totalWords = room.gameData.chat
            .filter((c) => c.sender === SenderType.PLAYER)
            .reduce((pre: number, cur) => {
              return pre + cur.message.split(' ').length;
            }, 0);
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
                      border: '1px solid black',
                      borderRadius: 10,
                      justifyContent: 'space-evenly',
                      overflowX: 'scroll',
                      scrollbarWidth: 'none',
                      padding: 10,
                    }}
                  >
                    {room.gameData.players.map((player, pIdx) => {
                      const studentWords = room.gameData.chat
                        .filter((c) => c.senderId === player._id)
                        .reduce((pre: number, cur) => {
                          return pre + cur.message.split(' ').length;
                        }, 0);
                      return (
                        <PlayerSprite key={`player-${pIdx}`} player={player}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            style={{ marginTop: 5 }}
                          >
                            {getPercentString(studentWords / totalWords)}
                          </Typography>
                        </PlayerSprite>
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
        // {
        //   name: 'SUMMARY',
        //   element: <SummaryReports classroom={classroom} />,
        // },
        {
          name: 'ROOM REPORTS',
          element: <RoomsReports classroom={classroom} />,
        },
        // {
        //   name: 'INDIVIDUAL REPORTS',
        //   element: <IndividualReports classroom={classroom} />,
        // },
      ]}
    />
  );
}
