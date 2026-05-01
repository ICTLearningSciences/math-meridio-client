/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Grid,
  Typography,
} from '@mui/material';

import { Classroom } from '../../../store/slices/educational-data/types';
import PhaseProgressBar, { PhaseSelector } from '../../phase-progress-bar';
import {
  ChatLog,
  Contribution,
  KeyWords,
  PlayerPhaseMetrics,
  SkillsPracticed,
  TimeSpent,
  TroubleSpots,
} from './skill-card';
import { Room } from '../../../store/slices/game/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { GAMES } from '../../../game/types';
import { GamesDropdown } from '../../button';
import { PlayerSprite } from '../../avatar-sprite';
import {
  AccessTime,
  ErrorOutline,
  ExtensionOutlined,
  PauseCircleOutline,
  PeopleSharp,
  Person,
} from '@mui/icons-material';
import { SkillsMet } from '../../../types';
import { calculateAverage } from '../../../helpers';

export function SummaryReportCard(props: {
  classroom: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();
  const [game, setGame] = React.useState<string>();

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id && (!game || r.gameData.gameId === game)
  );
  const students = educationalData.students.filter((s) =>
    gameRooms.find((r) => r.gameData.players.find((p) => p._id === s._id))
  );

  return (
    <Card>
      <CardContent
        className="column spacing"
        style={{ position: 'relative', padding: 20 }}
      >
        <GamesDropdown
          game={game}
          setGame={(id: string) => setGame(id)}
          buttonStyle={{ borderColor: 'black' }}
        />
        <PhaseProgressBar size="large" gameRooms={gameRooms} />
        <Grid container spacing={2} style={{ marginTop: 10 }}>
          <Grid item xs={4}>
            <Contribution students={students} gameRooms={gameRooms} />
          </Grid>
          <Grid item xs={3}>
            <TimeSpent gameRooms={gameRooms} />
          </Grid>
          <Grid item xs={5}>
            <KeyWords gameRooms={gameRooms} />
          </Grid>
        </Grid>
        <SkillsPracticed students={students} gameRooms={gameRooms} />
        <TroubleSpots students={students} gameRooms={gameRooms} />
      </CardContent>
    </Card>
  );
}

export function PhaseReportCard(props: { classroom: Classroom }): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();
  const [game, setGame] = React.useState<string>();
  const [phase, setPhase] = React.useState<number>();
  const [skillsMet, setSkillsMet] = React.useState<number>(0);
  const [timeSpent, setTimeSpent] = React.useState<number>(0);

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id && (!game || r.gameData.gameId === game)
  );
  const students = educationalData.students.filter((s) =>
    gameRooms.find((r) => r.gameData.players.find((p) => p._id === s._id))
  );
  const pausedStudents = students.filter((s) =>
    gameRooms.find(
      (room) => room.gameData.playersStatusRecord[s._id]?.pausedByAdmin
    )
  );
  const needsHelp = students.filter(() =>
    gameRooms.find((room) =>
      room.gameData.players.filter(
        (p) => room.gameData.playersStatusRecord[p._id]?.needsHelpInRoom
      )
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
    const skillsMet = Object.entries(skills)
      .sort((a, b) => {
        return b[1].playersMet.length - a[1].playersMet.length;
      })
      .filter(
        (skill) => skill[1].playersMet.length === skill[1].players.length
      );
    setSkillsMet(skillsMet.length);
  }, [educationalData]);

  React.useEffect(() => {
    const metrics: PlayerPhaseMetrics[] = [];
    for (const room of gameRooms) {
      for (const student of room.gameData.players) {
        const playerStatus = room.gameData.playersStatusRecord[student._id];
        if (!playerStatus) continue;
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
    setTimeSpent(Math.round(calculateAverage(metrics.map((c) => c.timeSpent))));
  }, [educationalData]);

  function RoomCompletion() {
    if (phase === undefined) return <div />;
    const avgRoomCompletion =
      100 *
      (gameRooms.filter(
        (r) => r.gameData.phaseProgression.phasesCompleted.length > phase
      ).length /
        gameRooms.length);
    const completion = Number.isNaN(avgRoomCompletion) ? 0 : avgRoomCompletion;
    return (
      <Grid item xs={3}>
        <Typography fontSize={14} fontWeight="bold">
          Avg Room Completion
        </Typography>
        <div
          className="row center-div"
          style={{
            border: '1px solid black',
            borderRadius: 10,
            marginTop: 10,
            height: 200,
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              thickness={6}
              style={{ width: 150, height: 150 }}
              sx={{
                position: 'absolute',
                color: '#e0e0e0', // Light gray color for uncompleted (remaining) portion
              }}
            />
            <CircularProgress
              variant="determinate"
              value={completion}
              thickness={6}
              style={{ width: 150, height: 150 }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography fontWeight="bold" fontSize={16}>
                {`${Math.round(completion)}%`}
              </Typography>
            </Box>
          </Box>
        </div>
      </Grid>
    );
  }

  return (
    <Card>
      <CardContent
        className="column spacing"
        style={{ position: 'relative', padding: 20 }}
      >
        <GamesDropdown
          game={game}
          setGame={(id: string) => setGame(id)}
          buttonStyle={{ borderColor: 'black' }}
        />

        <Grid
          container
          style={{
            marginTop: 10,
            marginBottom: 10,
            padding: 20,
            border: 'solid 1px black',
            borderRadius: 20,
          }}
        >
          <Grid item xs={2}>
            <div
              className="column center-div"
              style={{ borderRight: '1px solid black' }}
            >
              <div className="row spacing center-div">
                <Person />
                <Typography variant="h4" fontWeight="bold">
                  {students.length}
                </Typography>
              </div>
              <Typography fontSize={12} fontWeight="light">
                TOTAL STUDENTS
              </Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div
              className="column center-div"
              style={{ borderRight: '1px solid black' }}
            >
              <div className="row spacing center-div">
                <PeopleSharp />
                <Typography variant="h4" fontWeight="bold">
                  {gameRooms.length}
                </Typography>
              </div>
              <Typography fontSize={12} fontWeight="light">
                TOTAL ROOMS
              </Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div
              className="column center-div"
              style={{ borderRight: '1px solid black' }}
            >
              <div className="row spacing center-div">
                <PauseCircleOutline />
                <Typography variant="h4" fontWeight="bold">
                  {pausedStudents.length}
                </Typography>
              </div>
              <Typography fontSize={12} fontWeight="light">
                PAUSED STUDENTS
              </Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div
              className="column center-div"
              style={{ borderRight: '1px solid black' }}
            >
              <div className="row spacing center-div">
                <ErrorOutline color="error" />
                <Typography variant="h4" fontWeight="bold" color="error">
                  {needsHelp.length}
                </Typography>
              </div>
              <Typography fontSize={12} fontWeight="light" color="error">
                STUDENTS NEED HELP
              </Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div
              className="column center-div"
              style={{ borderRight: '1px solid black' }}
            >
              <div className="row spacing center-div">
                <ExtensionOutlined color="warning" />
                <Typography variant="h4" fontWeight="bold" color="orange">
                  {skillsMet}
                </Typography>
              </div>
              <Typography fontSize={12} fontWeight="light" color="orange">
                SKILLS IN PRACTICE
              </Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div className="column center-div">
              <div className="row spacing center-div">
                <AccessTime color="success" />
                <Typography variant="h4" fontWeight="bold" color="green">
                  {timeSpent} min.
                </Typography>
              </div>
              <Typography fontSize={12} fontWeight="light" color="green">
                AVERAGE ACTIVITY
              </Typography>
            </div>
          </Grid>
        </Grid>

        <PhaseSelector
          gameRooms={gameRooms}
          phase={phase}
          setPhase={setPhase}
        />

        <Grid container spacing={2} style={{ marginTop: 10 }}>
          {phase !== undefined && <RoomCompletion />}
          <Grid item xs={phase === undefined ? 4 : 3}>
            <TimeSpent phase={phase} gameRooms={gameRooms} />
          </Grid>
          <Grid item xs={phase === undefined ? 4 : 3}>
            <KeyWords phase={phase} gameRooms={gameRooms} />
          </Grid>
          <Grid item xs={phase === undefined ? 4 : 3}>
            <Contribution
              phase={phase}
              students={students}
              gameRooms={gameRooms}
            />
          </Grid>
        </Grid>

        <SkillsPracticed students={students} gameRooms={gameRooms} />
        <TroubleSpots students={students} gameRooms={gameRooms} />
      </CardContent>
    </Card>
  );
}

export function IndividualReportCard(props: {
  classroom: Classroom;
  room: Room;
}): JSX.Element {
  const { room } = props;
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const [phase, setPhase] = React.useState<number>();
  const { educationalData } = useWithEducationalData();

  const game = GAMES.find((g) => g.id === room?.gameData.gameId);
  const phaseReflections = educationalData.phaseReflections.filter(
    (p) => p.roomId === room._id && p.roundNumber === phase
  );

  return (
    <Card>
      <CardContent
        className="column spacing"
        style={{ position: 'relative', padding: 20 }}
      >
        <Typography
          fontSize={20}
          fontWeight="bold"
          onClick={() => setExpanded(!expanded)}
        >
          {room.name} - {game?.name}
        </Typography>
        <PhaseSelector gameRooms={[room]} phase={phase} setPhase={setPhase} />
        <Collapse in={expanded}>
          <Grid container spacing={2} style={{ marginTop: 10 }}>
            <Grid item xs={6}>
              <Contribution
                phase={phase}
                students={room.gameData.players}
                gameRooms={[room]}
              />
            </Grid>
            <Grid item xs={6}>
              <TimeSpent phase={phase} gameRooms={[room]} />
            </Grid>
            {phaseReflections.length > 0 && (
              <Grid item xs={6}>
                <Typography
                  fontSize={14}
                  fontWeight="bold"
                  flexGrow={1}
                  style={{ marginBottom: 10 }}
                >
                  Class Reflections
                </Typography>
                <div className="column spacing">
                  {phaseReflections.map((pr, idx) => {
                    return (
                      <Card
                        key={`reflection-${idx}`}
                        style={{ backgroundColor: 'rgb(231, 231, 231)' }}
                        elevation={0}
                      >
                        <CardContent className="column spacing">
                          <Typography fontSize={14} fontWeight="bold">
                            {pr.question}
                          </Typography>
                          {Object.entries(pr.reflections).map((r) => {
                            const player = room.gameData.players.find(
                              (p) => p._id === r[0]
                            );
                            if (!player) return <div key={r[0]} />;
                            return (
                              <div key={r[0]} className="row spacing">
                                <div style={{ width: 150 }}>
                                  <PlayerSprite player={player} />
                                </div>
                                <Card
                                  style={{ borderRadius: 10, flexGrow: 1 }}
                                  elevation={0}
                                >
                                  <CardContent className="column spacing">
                                    <Typography>&quot;{r[1]}&quot;</Typography>
                                  </CardContent>
                                </Card>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </Grid>
            )}
            <Grid item xs={phaseReflections.length > 0 ? 6 : 12}>
              <ChatLog phase={phase} gameRoom={room} />
            </Grid>
            <Grid item xs={12}>
              <SkillsPracticed
                students={room.gameData.players}
                gameRooms={[room]}
              />
            </Grid>
            <Grid item xs={12}>
              <TroubleSpots
                students={room.gameData.players}
                gameRooms={[room]}
              />
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
}
