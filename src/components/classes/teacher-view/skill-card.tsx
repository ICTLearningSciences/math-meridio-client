/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Word, WordCloud } from '@isoterik/react-word-cloud';
import {
  CheckCircle,
  ErrorOutline,
  ExpandLess,
  ExpandMore,
  Person,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Grid,
  Typography,
} from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';

import { PlayerSprite } from '../../avatar-sprite';
import { Room, SenderType } from '../../../store/slices/game/types';
import { Player } from '../../../store/slices/player/types';
import { calculateAverage, calculateSum } from '../../../helpers';
import {
  GenericLlmRequest,
  PromptOutputTypes,
  PromptRoles,
  SkillsMet,
} from '../../../types';
import { jsonLlmRequest } from '../../../classes/api-helpers';
import { useWithConfig } from '../../../store/slices/config/use-with-config';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';

interface PlayerPhaseMetrics {
  player: Player;
  room: Room;
  timeSpent: number;
  numWordsSent: number;
  totalWordsSent: number;
  contribution: number;
}

export function Contribution(props: {
  students: Player[];
  gameRooms: Room[];
  phase?: number;
}): JSX.Element {
  const { gameRooms, phase } = props;
  const [metrics, setMetrics] = React.useState<PlayerPhaseMetrics[]>([]);

  React.useEffect(() => {
    const metrics: PlayerPhaseMetrics[] = [];
    for (const room of gameRooms) {
      for (const student of room.gameData.players) {
        const playerStatus = room.gameData.playersStatusRecord[student._id];
        const playerMetrics: PlayerPhaseMetrics = {
          player: student,
          room: room,
          timeSpent: 0,
          numWordsSent: 0,
          totalWordsSent: 0,
          contribution: 0,
        };
        const phases =
          phase === undefined
            ? room.gameData.phaseProgression.phasesCompleted
            : [room.gameData.phaseProgression.phasesCompleted[phase]];
        for (const p of phases) {
          if (!playerStatus.phaseMetrics || !playerStatus.phaseMetrics[p]) {
            continue;
          }
          playerMetrics.timeSpent +=
            playerStatus.phaseMetrics[p]?.timeSpentInPhase || 0;
          playerMetrics.numWordsSent +=
            playerStatus.phaseMetrics[p]?.numWordsSentInPhase || 0;
        }
        playerMetrics.timeSpent = Math.round(playerMetrics.timeSpent / 60);
        metrics.push(playerMetrics);
      }
    }
    for (const metric of metrics) {
      metric.totalWordsSent = calculateSum(
        metrics
          .filter((m) => m.room._id === metric.room._id)
          .map((m) => m.numWordsSent)
      );
      if (metric.totalWordsSent > 0) {
        metric.contribution = Math.round(
          100 * (metric.numWordsSent / metric.totalWordsSent)
        );
      }
    }
    setMetrics(metrics);
  }, [gameRooms, phase]);

  return (
    <div>
      <Typography fontSize={14} fontWeight="bold">
        {gameRooms.length === 1
          ? 'Student Contribution'
          : 'Average Student Contribution'}
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
          height={200}
          yAxis={[{ label: 'Frequency' }]}
          series={metrics.map((c) => ({
            data: [c.numWordsSent],
            label: c.player.name,
            stack: c.room._id,
            valueFormatter: (v) => `${v} words`,
          }))}
          slotProps={{ legend: { hidden: true } }}
        />
      </div>
    </div>
  );
}

export function TimeSpent(props: {
  gameRooms: Room[];
  phase?: number;
}): JSX.Element {
  const { gameRooms, phase } = props;
  const [metrics, setMetrics] = React.useState<PlayerPhaseMetrics[]>([]);

  React.useEffect(() => {
    const metrics: PlayerPhaseMetrics[] = [];
    for (const room of gameRooms) {
      for (const student of room.gameData.players) {
        const playerStatus = room.gameData.playersStatusRecord[student._id];
        const playerMetrics: PlayerPhaseMetrics = {
          player: student,
          room: room,
          timeSpent: 0,
          numWordsSent: 0,
          totalWordsSent: 0,
          contribution: 0,
        };
        const phases =
          phase === undefined
            ? room.gameData.phaseProgression.phasesCompleted
            : [room.gameData.phaseProgression.phasesCompleted[phase]];
        for (const p of phases) {
          if (!playerStatus.phaseMetrics || !playerStatus.phaseMetrics[p]) {
            continue;
          }
          playerMetrics.timeSpent +=
            playerStatus.phaseMetrics[p]?.timeSpentInPhase || 0;
          playerMetrics.numWordsSent +=
            playerStatus.phaseMetrics[p]?.numWordsSentInPhase || 0;
        }
        playerMetrics.timeSpent = Math.round(playerMetrics.timeSpent / 60);
        metrics.push(playerMetrics);
      }
    }
    setMetrics(metrics);
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
              ? calculateSum(metrics.map((c) => c.timeSpent))
              : Math.round(calculateAverage(metrics.map((c) => c.timeSpent)))}
          </Typography>
          <Typography>Minutes</Typography>
        </div>
        <div style={{ width: 110 }}>
          <PieChart
            series={[
              {
                data: metrics.map((p) => ({
                  id: p.player._id,
                  value: p.timeSpent,
                  label: p.player.name,
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

export function KeyWords(props: {
  gameRooms: Room[];
  useReflections?: boolean;
  phase?: number;
  category?: string;
}): JSX.Element {
  const { gameRooms, phase } = props;
  const [keywords, setKeywords] = React.useState<Word[]>();
  const { firstAvailableAzureServiceModel } = useWithConfig();
  const { educationalData } = useWithEducationalData();

  React.useEffect(() => {
    setKeywords(undefined);
    const roomIds = gameRooms.map((r) => r._id);
    const words: string[] = [];
    const messages: string[] = [];
    if (props.useReflections) {
      const phaseReflections = educationalData.phaseReflections.filter(
        (p) =>
          roomIds.includes(p.roomId) &&
          (phase === undefined || p.roundNumber === phase)
      );
      for (const pr of phaseReflections) {
        for (const r of Object.values(pr.reflections)) {
          messages.push(r);
          words.push(...r.split(' '));
        }
      }
    } else {
      for (const room of gameRooms) {
        for (const chat of room.gameData.chat.filter(
          (c) => c.sender === SenderType.PLAYER
        )) {
          messages.push(chat.message);
          words.push(...chat.message.split(' '));
        }
      }
    }
    if (messages.length === 0) {
      setKeywords([]);
      return;
    }
    requestKeyWords(messages, props.category || 'Math Good').then((data) => {
      const keywords: Word[] = [];
      for (const word of data) {
        const frequency = words.filter(
          (w) => w.toLowerCase() === word.toLowerCase()
        ).length;
        if (frequency > 0) {
          keywords.push({
            text: word,
            value: frequency * 200,
          });
        }
      }
      setKeywords(keywords);
    });
  }, [gameRooms, phase]);

  async function requestKeyWords(
    reflections: string[],
    category: string
  ): Promise<string[]> {
    try {
      const request: GenericLlmRequest = {
        prompts: [
          {
            promptText: JSON.stringify(reflections),
            promptRole: PromptRoles.USER,
          },
          {
            promptText: `Based on the following category, pick frequently used words to add from the sentences above. The items you pick should be relevant to the category.`,
            promptRole: PromptRoles.USER,
          },
          {
            promptText: category,
            promptRole: PromptRoles.USER,
          },
        ],
        targetAiServiceModel: firstAvailableAzureServiceModel(),
        outputDataType: PromptOutputTypes.JSON,
        responseFormat: `
              Please only respond in an array of strings in JSON.
              Validate that your response is in valid JSON.
              Respond in this format:
                [
                    "string"
                ]
            `,
      };
      const res = await jsonLlmRequest<string[]>(request, {
        type: 'array',
        items: {
          type: 'string',
        },
        required: [],
      });
      return res;
    } catch (err) {
      return [];
    }
  }

  return (
    <div>
      <Typography fontSize={14} fontWeight="bold">
        Key Words
      </Typography>
      <div
        className="row center-div"
        style={{
          height: 180,
          border: '1px solid black',
          borderRadius: 10,
          padding: 10,
          marginTop: 10,
        }}
      >
        {keywords ? (
          <WordCloud
            words={keywords}
            width={300}
            height={100}
            rotate={() => 0}
          />
        ) : (
          <CircularProgress />
        )}
      </div>
    </div>
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

export function SkillsPracticed(props: {
  students: Player[];
  gameRooms: Room[];
  noHeader?: boolean;
}): JSX.Element {
  const { students, gameRooms } = props;
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});
  const [expanded, setExpanded] = React.useState<boolean>(true);

  const skillsMet = Object.entries(skills)
    .sort((a, b) => {
      return b[1].playersMet.length - a[1].playersMet.length;
    })
    .filter((skill) => skill[1].playersMet.length === skill[1].players.length);

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
        {skillsMet.length === 0 && (
          <Typography textAlign="center">
            No skills have been mastered yet.
          </Typography>
        )}
        <Collapse in={expanded}>
          <div className="column spacing">
            {skillsMet.map((skill) => {
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
