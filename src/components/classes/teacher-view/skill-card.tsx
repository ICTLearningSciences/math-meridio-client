/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  CheckCircle,
  ErrorOutline,
  ExpandLess,
  ExpandMore,
  Person,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { Card, CardContent, Collapse, Grid, Typography } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';

import { PlayerSprite } from '../../avatar-sprite';
import { Room } from '../../../store/slices/game/types';
import { Player } from '../../../store/slices/player/types';
import { calculateAverage, calculateSum } from '../../../helpers';
import { SkillsMet } from '../../../types';

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
    <Card
      style={{ backgroundColor: 'rgb(231, 231, 231)', borderRadius: 10 }}
      elevation={0}
    >
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
              .filter(
                (skill) =>
                  skill[1].playersMet.length === skill[1].players.length
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

  const studentsNeedHelp = students.filter((s) =>
    gameRooms.find(
      (r) => r.gameData.playersStatusRecord[s._id]?.needsHelpInRoom
    )
  );
  const studentsIncomplete = students.filter((s) =>
    gameRooms.find(
      (r) =>
        r.gameData.playersStatusRecord[s._id] &&
        Object.values(r.gameData.mathStandardsCompleted).includes(false)
    )
  );

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
      <Grid container spacing={2}>
        <Grid item xs={props.hidePlayers ? 12 : 7}>
          <Card
            style={{ backgroundColor: 'rgb(231, 231, 231)', borderRadius: 10 }}
            elevation={0}
          >
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
        {!props.hidePlayers && (
          <Grid item xs={5}>
            <Card
              style={{
                backgroundColor: 'rgb(246, 246, 246)',
                borderRadius: 10,
              }}
              elevation={0}
            >
              <CardContent className="column spacing">
                <Typography fontSize={14} fontWeight="bold">
                  Needs Help
                </Typography>
                <div className="row center-div spacing">
                  {studentsNeedHelp.map((p) => {
                    const room = gameRooms.find(
                      (r) => r.gameData.playersStatusRecord[p._id]
                    );
                    return (
                      <div key={p._id} className="column center-div">
                        <ErrorOutline
                          color="error"
                          style={{ marginBottom: 10 }}
                        />
                        <PlayerSprite player={p} />
                        {room && (
                          <Typography fontSize={12}>
                            Phase{' '}
                            {room.gameData.phaseProgression.phasesCompleted
                              .length + 1}
                          </Typography>
                        )}
                      </div>
                    );
                  })}
                  {studentsIncomplete.map((p) => {
                    const room = gameRooms.find(
                      (r) => r.gameData.playersStatusRecord[p._id]
                    );
                    return (
                      <div key={p._id} className="column center-div">
                        <WarningAmberOutlined
                          color="warning"
                          style={{ marginBottom: 10 }}
                        />
                        <PlayerSprite player={p} />
                        {room && (
                          <Typography fontSize={12}>
                            Phase{' '}
                            {room.gameData.phaseProgression.phasesCompleted
                              .length + 1}
                          </Typography>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

interface PlayerContribution {
  id: string;
  name: string;
  room: string;
  words: number;
  totalWords: number;
  contribution: number;
}
export function Contribution(props: {
  students: Player[];
  gameRooms: Room[];
  phase?: number;
}): JSX.Element {
  const { students, gameRooms, phase } = props;
  const [contribution, setContribution] = React.useState<PlayerContribution[]>(
    []
  );

  React.useEffect(() => {
    const contribution: PlayerContribution[] = [];
    for (const room of gameRooms) {
      for (const playerStatus of Object.entries(
        room.gameData.playersStatusRecord
      )) {
        const student = students.find((s) => s._id === playerStatus[0]);
        if (!student) continue;
        const phases =
          phase === undefined
            ? room.gameData.phaseProgression.phasesCompleted
            : [room.gameData.phaseProgression.phasesCompleted[phase]];
        for (const phase of phases) {
          const studentWords = !playerStatus[1].phaseMetrics
            ? 0
            : playerStatus[1].phaseMetrics[phase].numWordsSentInPhase;
          contribution.push({
            id: student._id,
            name: student.name,
            room: room.name,
            words: studentWords,
            totalWords: 0,
            contribution: 0,
          });
        }
      }
    }
    for (let i = 0; i < contribution.length; i++) {
      contribution[i].totalWords = calculateSum(
        contribution
          .filter((c) => c.room === contribution[i].room)
          .map((c) => c.words)
      );
      contribution[i].contribution =
        contribution[i].totalWords === 0
          ? 0
          : Math.round(
              100 * (contribution[i].words / contribution[i].totalWords)
            );
    }
    setContribution(contribution);
  }, [gameRooms, phase]);

  return (
    <div>
      <Typography fontSize={14} fontWeight="bold">
        {gameRooms.length === 1
          ? 'Student Contribution (%)'
          : 'Average Student Contribution (%)'}
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

interface PlayerTime {
  id: string;
  name: string;
  room: string;
  timeSpent: number;
}
export function TimeSpent(props: {
  students: Player[];
  gameRooms: Room[];
  phase?: number;
}): JSX.Element {
  const { students, gameRooms, phase } = props;
  const [contribution, setContribution] = React.useState<PlayerTime[]>([]);

  React.useEffect(() => {
    const contribution: PlayerTime[] = [];
    for (const room of gameRooms) {
      for (const playerStatus of Object.entries(
        room.gameData.playersStatusRecord
      )) {
        const student = students.find((s) => s._id === playerStatus[0]);
        if (!student) continue;
        const phases =
          phase === undefined
            ? room.gameData.phaseProgression.phasesCompleted
            : [room.gameData.phaseProgression.phasesCompleted[phase]];
        for (const phase of phases) {
          const timeSpent = !playerStatus[1].phaseMetrics
            ? 0
            : playerStatus[1].phaseMetrics[phase].timeSpentInPhase;
          contribution.push({
            id: student._id,
            name: student.name,
            room: room.name,
            timeSpent: timeSpent,
          });
        }
      }
    }
    setContribution(contribution);
  }, [gameRooms, phase]);

  return (
    <div>
      <Typography fontSize={14} fontWeight="bold">
        {gameRooms.length === 1 ? 'Time Spent in Game' : 'Average Time Spent'}
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
