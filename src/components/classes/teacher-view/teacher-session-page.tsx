/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { ChevronRight, Search } from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import ProgressBar from '../../progress-bar';
import RoomCard from './teacher-room-card';
import SkillCard from './skill-card';
import { Classroom } from '../../../store/slices/educational-data/types';
import { GAMES } from '../../../game/types';
import { Player } from '../../../store/slices/player/types';
import { DropdownButton } from '../../button';
import { useSearchParams } from 'react-router-dom';
import { PhaseProgression } from '../../../store/slices/game/types';
import { calculateMedian } from '../../../helpers';

const styles = makeStyles()(() => ({
  card: {
    borderRadius: 10,
  },
  header: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerText: {
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 10,
  },
}));

interface SkillsMet {
  playersMet: Player[];
  players: Player[];
}

export default function ActiveSessionView(props: {
  classroom: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { classes } = styles();
  const { educationalData } = useWithEducationalData();
  const [studentSearch, setStudentSearch] = React.useState<string>();
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});
  const [phase, setPhase] = React.useState<PhaseProgression>();
  const [game, setGame] = React.useState<string>();
  const [_searchParams, setSearchParams] = useSearchParams();

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id && (!game || r.gameData.gameId === game)
  );
  const students = educationalData.students.filter((s) =>
    gameRooms.find((r) => r.gameData.players.find((p) => p._id === s._id))
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
  }, []);

  React.useEffect(() => {
    if (game) {
      let totalPhases = 0;
      const phasesCompleted: number[] = [];
      for (const room of gameRooms) {
        totalPhases = room.gameData.phaseProgression.totalPhases;
        phasesCompleted.push(
          room.gameData.phaseProgression.phasesCompleted.length
        );
      }
      const median = calculateMedian(phasesCompleted);
      setPhase({
        curPhaseTitle: "",
        phasesStarted: Array.from({ length: median }),
        phasesCompleted: Array.from({ length: median }),
        totalPhases,
      });
    } else {
      setPhase(undefined);
    }
  }, [game]);

  return (
    <div className="dashboard">
      <Typography variant="h5" fontWeight="bold">
        ACTIVE SESSION
      </Typography>

      <div className="column spacing" style={{ marginTop: 10 }}>
        <div
          className="row center-div"
          style={{ justifyContent: 'space-between' }}
        >
          <div className="row center-div">
            <Typography className={classes.header}>
              Overall Progress:
            </Typography>
            <DropdownButton
              label={GAMES.find((g) => g.id === game)?.name || 'All Games'}
              value={game}
              items={['', ...GAMES.map((g) => g.id)]}
              onSelect={(id: string) => setGame(id)}
              renderItem={(id) => {
                return (
                  <Typography>
                    {GAMES.find((g) => g.id === id)?.name || 'Show All'}
                  </Typography>
                );
              }}
              buttonStyle={{
                color: 'white',
                borderColor: 'white',
                marginLeft: '10px',
              }}
            />
          </div>
          <Button
            color="inherit"
            endIcon={<ChevronRight />}
            onClick={() => setSearchParams({ tab: '1' })}
          >
            Class Report
          </Button>
        </div>
        <Card className={classes.card}>
          <CardContent style={{ padding: 30 }}>
            {phase ? (
              <ProgressBar phases={phase} size="large" />
            ) : (
              <Typography variant="body2" color="error">
                Please select a game first to view progress
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="column spacing" style={{ marginTop: 10 }}>
        <Typography className={classes.header}>Open Rooms</Typography>
        <div
          className="row center-div"
          style={{
            backgroundColor: 'rgb(217, 217, 217)',
            borderRadius: 60,
            height: 40,
            paddingLeft: 15,
          }}
        >
          <Search style={{ color: 'rgb(137, 137, 137)' }} />
          <TextField
            variant="standard"
            label="Student Search"
            fullWidth
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{ marginLeft: 10, marginBottom: 15 }}
          />
        </div>
        {gameRooms.length === 0 && (
          <Typography variant="body2" align="center">
            There are no open rooms yet
          </Typography>
        )}
        <Grid container spacing={2}>
          {gameRooms
            .filter((room) => {
              if (!studentSearch) return true;
              return room.gameData.players.find((p) =>
                p.name.toLowerCase().includes(studentSearch.toLowerCase())
              );
            })
            .map((room, idx) => {
              return (
                <Grid item xs={6} md={4} lg={3} key={`room-${idx}`}>
                  <RoomCard
                    room={room}
                    classroom={classroom}
                    classes={classes}
                  />
                </Grid>
              );
            })}
        </Grid>
      </div>

      <div className="column spacing" style={{ marginTop: 10 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography className={classes.header}>Skills Practiced</Typography>
            <Card
              className={classes.card}
              style={{ backgroundColor: 'rgb(231, 231, 231)' }}
            >
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
          </Grid>
          <Grid item xs={6}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Typography className={classes.header}>Trouble Spots</Typography>
              <Button
                color="inherit"
                style={{ alignSelf: 'end' }}
                endIcon={<ChevronRight />}
                onClick={() => setSearchParams({ tab: '1' })}
              >
                Monitor Students
              </Button>
            </div>
            <Card
              className={classes.card}
              style={{ backgroundColor: 'rgb(231, 231, 231)' }}
            >
              <CardContent className="column spacing">
                <Typography className={classes.headerText}>
                  Challenge Section
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
