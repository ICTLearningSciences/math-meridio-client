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
  CardContent,
  Collapse,
  Grid,
  Typography,
} from '@mui/material';
import { ArrowForward, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Classroom } from '../../../store/slices/educational-data/types';
import ProgressBar from '../../progress-bar';
import { PlayerActivitySprite, PlayerSprite } from '../../avatar-sprite';
import SkillCard from './skill-card';
import { Room, SenderType } from '../../../store/slices/game/types';
import { getPercentString } from '../../../helpers';
import { GAMES } from '../../../game/types';
import { SkillsMetStatus } from '../../../types';

export default function RoomReportCard(props: {
  classroom: Classroom;
  room: Room;
}): JSX.Element {
  const { classroom, room } = props;
  const navigate = useNavigate();
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [skills, setSkills] = React.useState<Record<string, SkillsMetStatus>>(
    {}
  );

  React.useEffect(() => {
    const skills: Record<string, SkillsMetStatus> = {};
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
        <div
          className="row center-div spacing"
          style={{ marginBottom: 20 }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
          <Typography fontSize={20} fontWeight="bold" style={{ flexGrow: 1 }}>
            {room.name}
          </Typography>
        </div>

        <Collapse in={!expanded}>
          <div className="row center-div spacing">
            {room.gameData.players.map((player, pIdx) => {
              return (
                <PlayerActivitySprite
                  key={`player-${pIdx}`}
                  player={player}
                  room={room}
                />
              );
            })}
          </div>
        </Collapse>
        <Typography> {game?.name}</Typography>
        <ProgressBar phases={room.gameData.phaseProgression} size="large" />

        <Collapse className="column spacing" in={expanded}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <div className="column spacing">
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
            </Grid>

            <Grid item xs={4}>
              <div className="column spacing">
                <Typography>Time Spent</Typography>
                <div
                  className="row center-div"
                  style={{
                    border: '1px solid black',
                    borderRadius: 10,
                    overflowX: 'scroll',
                    scrollbarWidth: 'none',
                    padding: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}
                >
                  <div className="column center-div">
                    <Typography fontSize={14} fontWeight="light">
                      Total Time
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      24
                    </Typography>
                    <Typography>Minutes</Typography>
                  </div>
                  <div
                    className="row center-div spacing"
                    style={{ flexGrow: 1 }}
                  >
                    {room.gameData.players.map((player, pIdx) => {
                      return (
                        <PlayerActivitySprite
                          key={`player-${pIdx}`}
                          player={player}
                          room={room}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={4}>
              <div className="column spacing">
                <Typography>Key Words</Typography>
              </div>
            </Grid>
          </Grid>

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
