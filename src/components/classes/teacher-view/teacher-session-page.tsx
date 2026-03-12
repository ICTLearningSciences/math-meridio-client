/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { ChevronRight, Search } from '@mui/icons-material';
import { Button, Grid, TextField, Typography } from '@mui/material';

import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import ProgressBar from '../../phase-progress-bar';
import RoomCard from './teacher-room-card';
import { SkillsPracticed, TroubleSpots } from './skill-card';
import { Classroom } from '../../../store/slices/educational-data/types';
import { GamesDropdown } from '../../button';
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

export default function ActiveSessionView(props: {
  classroom: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { classes } = styles();
  const { educationalData } = useWithEducationalData();
  const [studentSearch, setStudentSearch] = React.useState<string>();
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
    const numPhases: number[] = [];
    const phasesCompleted: number[] = [];
    for (const room of gameRooms) {
      numPhases.push(
        room.gameData.phaseProgression.startingPhaseStepsOrdered.length
      );
      phasesCompleted.push(
        room.gameData.phaseProgression.phasesCompleted.length
      );
    }
    const median = calculateMedian(phasesCompleted);
    setPhase({
      curPhaseTitle: '',
      curPhaseStepId: '',
      phasesStarted: Array.from({ length: median }),
      phasesCompleted: Array.from({ length: median }),
      startingPhaseStepsOrdered: Array.from({
        length: calculateMedian(numPhases),
      }),
      learningObjectives: [],
    });
  }, [game]);

  return (
    <div className="dashboard">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" fontWeight="bold">
          ACTIVE SESSION
        </Typography>
        <GamesDropdown
          game={game}
          setGame={(id: string) => setGame(id)}
          buttonStyle={{
            color: 'white',
            borderColor: 'white',
            marginLeft: '10px',
          }}
        />
      </div>

      <div className="column spacing" style={{ marginTop: 10 }}>
        {phase && <ProgressBar phases={phase} size="large" />}
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
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Typography className={classes.header}>
                Skills Practiced
              </Typography>
              <Button
                color="inherit"
                style={{ alignSelf: 'end' }}
                endIcon={<ChevronRight />}
                onClick={() => setSearchParams({ tab: '1', report: '1' })}
              >
                View Report
              </Button>
            </div>
            <SkillsPracticed
              students={students}
              gameRooms={gameRooms}
              noHeader
            />
          </Grid>
          <Grid item xs={6}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Typography className={classes.header}>Trouble Spots</Typography>
              <Button
                color="inherit"
                style={{ alignSelf: 'end' }}
                endIcon={<ChevronRight />}
                onClick={() => setSearchParams({ tab: '1', report: '2' })}
              >
                Monitor Students
              </Button>
            </div>
            <TroubleSpots
              students={students}
              gameRooms={gameRooms}
              noHeader
              hidePlayers
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
