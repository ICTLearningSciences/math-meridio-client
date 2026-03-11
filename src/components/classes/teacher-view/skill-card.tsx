/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  CheckCircle,
  ExpandLess,
  ExpandMore,
  Person,
} from '@mui/icons-material';
import { Card, CardContent, Collapse, Grid, Typography } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import { Player } from '../../../store/slices/player/types';
import { PlayerSprite } from '../../avatar-sprite';
import { SkillsMet } from '../../../types';
import { Room, SenderType } from '../../../store/slices/game/types';
import { calculateAverage, calculateSum } from '../../../helpers';

interface PlayerContribution {
  id: string;
  name: string;
  room: string;
  words: number;
  totalWords: number;
  contribution: number;
}
interface PlayerTime {
  id: string;
  name: string;
  room: string;
  timeSpent: number;
}

export function SkillsPracticed(props: {
  students: Player[];
  gameRooms: Room[];
  noHeader?: boolean;
}): JSX.Element {
  const { students, gameRooms } = props;
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});
  const [expanded, setExpanded] = React.useState<boolean>(true);

  React.useEffect(() => {
    const skills: Record<string, SkillsMet> = {};
    for (const student of students) {
      const room = gameRooms.find((r) =>
        r.gameData.players.find((p) => p._id === student._id)
      );
      if (room) {
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
    }
    setSkills(skills);
  }, [students, gameRooms]);

  return (
    <Card style={{ backgroundColor: 'rgb(231, 231, 231)' }}>
      <CardContent className="column spacing">
        {!props.noHeader && (
          <div className="row center-div spacing">
            {expanded ? <ExpandLess /> : <ExpandMore />}
            <Typography
              fontSize={14}
              fontWeight="bold"
              flexGrow={1}
              onClick={() => setExpanded(!expanded)}
            >
              Skills Practiced
            </Typography>
          </div>
        )}
        <Collapse in={expanded}>
          <div className="column spacing">
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
          </div>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export function TroubleSpots(props: {
  students: Player[];
  gameRooms: Room[];
  noHeader?: boolean;
  hidePlayers?: boolean;
}): JSX.Element {
  const { students, gameRooms } = props;
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});

  React.useEffect(() => {
    const skills: Record<string, SkillsMet> = {};
    for (const student of students) {
      const room = gameRooms.find((r) =>
        r.gameData.players.find((p) => p._id === student._id)
      );
      if (room) {
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
    }
    setSkills(skills);
  }, [students, gameRooms]);

  return (
    <div>
      {!props.noHeader && (
        <Typography fontSize={14} fontWeight="bold">
          Trouble Spots
        </Typography>
      )}
      <div
        className="row center-div"
        style={{
          border: '1px solid black',
          borderRadius: 10,
          marginTop: 10,
          padding: 20,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card style={{ backgroundColor: 'rgb(231, 231, 231)' }}>
              <CardContent className="column spacing">
                <div className="row center-div spacing">
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                  <Typography
                    fontSize={14}
                    fontWeight="bold"
                    flexGrow={1}
                    onClick={() => setExpanded(!expanded)}
                  >
                    Challenge Sections
                  </Typography>
                </div>
                <Collapse in={expanded}>
                  <div className="column spacing">
                    {Object.entries(skills)
                      .sort((a, b) => {
                        return b[1].playersMet.length - a[1].playersMet.length;
                      })
                      .filter(
                        (skill) =>
                          skill[1].playersMet.length < skill[1].players.length
                      )
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
                  </div>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export function Contribution(props: {
  title?: string;
  students: Player[];
  gameRooms: Room[];
}): JSX.Element {
  const { students, gameRooms } = props;
  const [contribution, setContribution] = React.useState<PlayerContribution[]>(
    []
  );

  React.useEffect(() => {
    const contribution: PlayerContribution[] = [];
    for (const student of students) {
      const room = gameRooms.find((r) =>
        r.gameData.players.find((p) => p._id === student._id)
      );
      if (room) {
        const totalWords = room.gameData.chat
          .filter((c) => c.sender === SenderType.PLAYER)
          .reduce((pre: number, cur) => {
            return pre + cur.message.split(' ').length;
          }, 0);
        const studentWords = room.gameData.chat
          .filter((c) => c.senderId === student._id)
          .reduce((pre: number, cur) => {
            return pre + cur.message.split(' ').length;
          }, 0);
        contribution.push({
          id: student._id,
          name: student.name,
          room: room.name,
          words: studentWords,
          totalWords: totalWords,
          contribution:
            totalWords === 0
              ? 0
              : Math.round((studentWords / totalWords) * 100),
        });
      }
    }
    setContribution(contribution);
  }, [gameRooms]);

  return (
    <div>
      <Typography fontSize={14} fontWeight="bold">
        {props.title ||
          (gameRooms.length === 1
            ? 'Student Contribution (%)'
            : 'Average Student Contribution (%)')}
      </Typography>
      <div
        className="row center-div"
        style={{
          border: '1px solid black',
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <BarChart
          yAxis={[{ label: 'Frequency' }]}
          series={contribution.map((c) => ({
            data: [c.contribution],
            label: c.name,
            stack: c.room,
            valueFormatter: (v) => `${v}%`,
          }))}
          height={200}
        />
      </div>
    </div>
  );
}

export function TimeSpent(props: {
  title?: string;
  students: Player[];
  gameRooms: Room[];
}): JSX.Element {
  const { students, gameRooms } = props;
  const [contribution, setContribution] = React.useState<PlayerTime[]>([]);

  React.useEffect(() => {
    const contribution: PlayerTime[] = [];
    for (const student of students) {
      const room = gameRooms.find((r) =>
        r.gameData.players.find((p) => p._id === student._id)
      );
      if (room) {
        contribution.push({
          id: student._id,
          name: student.name,
          room: room.name,
          timeSpent: Math.round(Math.random() * 24),
        });
      }
    }
    setContribution(contribution);
  }, [gameRooms]);

  return (
    <div>
      <Typography fontSize={14} fontWeight="bold">
        {props.title ||
          (gameRooms.length === 1
            ? 'Time Spent in Game'
            : 'Average Time Spent')}
      </Typography>
      <div
        className="row center-div spacing"
        style={{
          border: '1px solid black',
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <div className="column center-div">
          <Typography fontSize={12} fontWeight="light">
            {gameRooms.length === 1 ? 'Total' : 'Avg'} Time
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            {gameRooms.length === 1
              ? calculateSum(contribution.map((c) => c.timeSpent))
              : Math.round(
                  calculateAverage(contribution.map((c) => c.timeSpent))
                )}
          </Typography>
          <Typography>Minutes</Typography>
        </div>
        <div style={{ width: 110 }}>
          <PieChart
            series={[
              {
                data: contribution.map((p) => ({
                  id: p.id,
                  value: p.timeSpent,
                  label: p.name,
                })),
              },
            ]}
            width={200}
            height={200}
            slotProps={{
              legend: { hidden: true },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SkillCard(props: {
  name: string;
  players: Player[];
  playersMet: Player[];
}): JSX.Element {
  const { players, playersMet } = props;
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const percentMet = playersMet.length / players.length;

  return (
    <div
      style={{
        borderRadius: 10,
        backgroundColor: 'white',
      }}
    >
      <div className="row card spacing" onClick={() => setExpanded(!expanded)}>
        <Typography style={{ flexGrow: 1 }}>{props.name}</Typography>
        <Person
          fontSize="small"
          color={percentMet === 1 ? 'success' : 'inherit'}
        />
        <Typography color={percentMet === 1 ? 'green' : ''}>
          {playersMet.length} / {players.length}
        </Typography>
      </div>
      <Collapse in={expanded}>
        <div className="row spacing" style={{ marginLeft: 20 }}>
          {players.map((p) => {
            const isMet = playersMet.find((s) => s._id === p._id);
            return (
              <PlayerSprite key={p._id} player={p}>
                {isMet && (
                  <CheckCircle
                    color="success"
                    fontSize="small"
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      right: 0,
                    }}
                  />
                )}
              </PlayerSprite>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}
