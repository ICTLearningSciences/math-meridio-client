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
import { PhaseSelector } from '../../phase-progress-bar';
import {
  Contribution,
  SkillsPracticed,
  TimeSpent,
  TroubleSpots,
} from './skill-card';
import { Room } from '../../../store/slices/game/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { GAMES } from '../../../game/types';
import { GamesDropdown } from '../../button';
import { PlayerSprite } from '../../avatar-sprite';

export function SummaryReportCard(props: {
  classroom: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();
  const [game, setGame] = React.useState<string>();
  const [phase, setPhase] = React.useState<number>();

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
        <PhaseSelector
          gameRooms={gameRooms}
          phase={phase}
          setPhase={setPhase}
        />
        <Grid container spacing={2} style={{ marginTop: 10 }}>
          <Grid item xs={4}>
            <Contribution students={students} gameRooms={gameRooms} />
          </Grid>
          <Grid item xs={3}>
            <TimeSpent students={students} gameRooms={gameRooms} />
          </Grid>
          <Grid item xs={4}>
            <Typography fontSize={14} fontWeight="bold">
              Key Words
            </Typography>
            <div
              className="row center-div"
              style={{
                border: '1px solid black',
                borderRadius: 10,
                padding: 10,
                marginTop: 10,
              }}
            >
              <Typography fontSize={14} fontWeight="bold">
                Recently Used
              </Typography>
            </div>
          </Grid>
        </Grid>
        <TroubleSpots students={students} gameRooms={gameRooms} />
      </CardContent>
    </Card>
  );
}

export function PhaseReportCard(props: { classroom: Classroom }): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();
  const [game, setGame] = React.useState<string>();
  const [phase, setPhase] = React.useState<number>(0);

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id && (!game || r.gameData.gameId === game)
  );
  const students = educationalData.students.filter((s) =>
    gameRooms.find((r) => r.gameData.players.find((p) => p._id === s._id))
  );
  const avgRoomCompletion =
    100 *
    (gameRooms.filter(
      (r) => r.gameData.phaseProgression.phasesCompleted.length > phase
    ).length /
      gameRooms.length);

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
        <PhaseSelector
          gameRooms={gameRooms}
          phase={phase}
          setPhase={setPhase}
        />
        <Grid container spacing={2} style={{ marginTop: 10 }}>
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
                  value={avgRoomCompletion}
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
                    {`${Math.round(avgRoomCompletion)}%`}
                  </Typography>
                </Box>
              </Box>
            </div>
          </Grid>
          <Grid item xs={3}>
            <TimeSpent students={students} gameRooms={gameRooms} />
          </Grid>
          <Grid item xs={3}>
            <Typography fontSize={14} fontWeight="bold">
              Key Words
            </Typography>
            <div
              className="row center-div"
              style={{
                border: '1px solid black',
                borderRadius: 10,
                padding: 10,
                marginTop: 10,
              }}
            >
              <Typography fontSize={14} fontWeight="bold">
                Recently Used
              </Typography>
            </div>
          </Grid>
          <Grid item xs={3}>
            <Contribution students={students} gameRooms={gameRooms} />
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
  const [phase, setPhase] = React.useState<number>(0);
  const { educationalData } = useWithEducationalData();
  const game = GAMES.find((g) => g.id === room?.gameData.gameId);

  const phaseReflections = educationalData.phaseReflections.filter(
    (p) => p.roomId === room._id
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
            <Grid item xs={4}>
              <Contribution
                students={room.gameData.players}
                gameRooms={[room]}
              />
            </Grid>
            <Grid item xs={3}>
              <TimeSpent students={room.gameData.players} gameRooms={[room]} />
            </Grid>
            <Grid item xs={4}>
              <Typography fontSize={14} fontWeight="bold">
                Key Words
              </Typography>
              <div
                className="row center-div"
                style={{
                  border: '1px solid black',
                  borderRadius: 10,
                  padding: 10,
                  marginTop: 10,
                }}
              >
                <Typography fontSize={14} fontWeight="bold">
                  Recently Used
                </Typography>
              </div>
            </Grid>

            <Grid item xs={12}>
              <Typography fontSize={14} fontWeight="bold" flexGrow={1}>
                Class Reflections
              </Typography>
              {phaseReflections
                .filter((pr) => pr.roundNumber === phase + 1)
                .map((pr, idx) => {
                  return (
                    <Card
                      key={`reflection-${idx}`}
                      style={{ backgroundColor: 'rgb(231, 231, 231)' }}
                      elevation={0}
                    >
                      <CardContent className="column spacing">
                        <Typography fontSize={14} fontWeight="bold">
                          {pr.roundNumber}. {pr.question}
                        </Typography>
                        {Object.entries(pr.reflections).map((r) => {
                          const player = room.gameData.players.find(
                            (p) => p._id === r[0]
                          );
                          if (!player) return <div key={r[0]} />;
                          return (
                            <div key={r[0]} className="row spacing">
                              <PlayerSprite player={player} />
                              <Card
                                style={{ borderRadius: 10, width: '100%' }}
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
            </Grid>
            <Grid item xs={12}>
              <TroubleSpots
                students={room.gameData.players}
                gameRooms={[room]}
              />
            </Grid>
            <Grid item xs={12}>
              <SkillsPracticed
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
