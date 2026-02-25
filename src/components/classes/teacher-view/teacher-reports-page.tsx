/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Collapse, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Classroom } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { RoomSetupView } from './teacher-room-setup';
import ProgressBar from '../../progress-bar';
import { PlayerSprite } from '../../avatar-sprite';
import SkillCard from './skill-card';
import { Room, SenderType } from '../../../store/slices/game/types';
import { getPercentString } from '../../../helpers';
import { GAMES } from '../../../game/types';
import { Player } from '../../../store/slices/player/types';

interface SkillsMet {
  playersMet: Player[];
  players: Player[];
}

function RoomReportCard(props: {
  classroom: Classroom;
  room: Room;
}): JSX.Element {
  const { classroom, room } = props;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});

  React.useEffect(() => {
    const skills: Record<string, SkillsMet> = {};
    for (const student of room.gameData.players) {
      for (const standard of Object.entries(
        room.gameData.mathStandardsCompleted
      )) {
        if (!(standard[0] in skills)) {
          skills[standard[0]] = { playersMet: [], players: [] };
        }
        if (standard[1]) {
          skills[standard[0]].playersMet.push(student);
        }
        skills[standard[0]].players.push(student);
      }
    }
    setSkills(skills);
  }, [room]);

  const game = GAMES.find((g) => g.id === room?.gameData.gameId);
  const totalWords = room.gameData.chat
    .filter((c) => c.sender === SenderType.PLAYER)
    .reduce((pre: number, cur) => {
      return pre + cur.message.split(' ').length;
    }, 0);

  const enterRoom = (room: Room) => {
    navigate(`/classes/${classroom._id}/room/${room._id}`);
  };

  return (
    <Card>
      <CardContent
        className="column spacing"
        style={{ position: 'relative', padding: 20 }}
      >
        <div onClick={() => setCollapsed(!collapsed)}>
          <Typography
            fontSize={20}
            fontWeight="bold"
            style={{ marginBottom: 20 }}
          >
            {`${room.name}: ${game?.name}`}
          </Typography>
        </div>
        <Collapse className="column spacing" in={!collapsed}>
          <ProgressBar phases={room.gameData.phaseProgression} size="large" />
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
            <Typography>Skills Practiced</Typography>
            <Card style={{ backgroundColor: 'rgb(231, 231, 231)' }}>
              <CardContent className="column spacing">
                {Object.entries(skills)
                  .sort((a, b) => {
                    return b[1].playersMet.length - a[1].playersMet.length;
                  })
                  .map((skill) => {
                    return (
                      <SkillCard
                        key={skill[0]}
                        name={skill[0]}
                        players={skill[1].players}
                        playersMet={skill[1].playersMet}
                      />
                    );
                  })}
              </CardContent>
            </Card>
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
        </Collapse>
      </CardContent>
    </Card>
  );
}

function RoomsReports(props: { classroom: Classroom }): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id
  );

  return (
    <div className="dashboard">
      <Typography variant="h5" fontWeight="bold">
        ROOMS REPORT
      </Typography>
      <div className="column spacing" style={{ marginTop: 40 }}>
        {gameRooms.map((room, rIdx) => {
          return (
            <RoomReportCard
              key={`room-${rIdx}`}
              room={room}
              classroom={classroom}
            />
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
  const { educationalData } = useWithEducationalData();
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

  if (rooms.length === 0) {
    return <RoomSetupView classId={classroom._id} />;
  }

  return <RoomsReports classroom={classroom} />;
}
