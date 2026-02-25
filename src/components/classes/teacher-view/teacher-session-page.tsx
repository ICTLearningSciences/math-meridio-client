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
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import ProgressBar from '../../progress-bar';
import RoomCard from './teacher-room-card';
import SkillCard from './skill-card';
import { Classroom } from '../../../store/slices/educational-data/types';
import { GAMES } from '../../../game/types';

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
  numMet: number;
  numTotal: number;
}

export default function ActiveSessionView(props: {
  classroom: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { classes } = styles();
  const { educationalData } = useWithEducationalData();
  const [studentSearch, setStudentSearch] = React.useState<string>();
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});
  const [skillProgress, setSkillProgress] = React.useState<number>(0);
  const [game, setGame] = React.useState<string>();

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id && (!game || r.gameData.gameId === game)
  );

  React.useEffect(() => {
    const skills: Record<string, SkillsMet> = {};
    for (const room of gameRooms) {
      for (const standard of Object.entries(
        room.gameData.mathStandardsCompleted
      )) {
        if (!(standard[0] in skills)) {
          skills[standard[0]] = { numMet: 0, numTotal: 0 };
        }
        if (standard[1]) {
          skills[standard[0]].numMet++;
        }
        skills[standard[0]].numTotal++;
      }
    }
    let numMet = 0;
    let numTotal = 0;
    for (const skill of Object.values(skills)) {
      numMet += skill.numMet;
      numTotal += skill.numTotal;
    }
    setSkills(skills);
    setSkillProgress(numTotal === 0 ? 0 : (numMet / numTotal) * 100);
  }, [gameRooms]);

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
            <TextField
              select
              label="Select Game"
              variant="standard"
              style={{ width: 300, marginLeft: 10 }}
              onChange={(e) => setGame(e.target.value)}
            >
              <MenuItem value={undefined}>Show All</MenuItem>
              {GAMES.map((game) => (
                <MenuItem key={game.id} value={game.id}>
                  {game.name}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <Button color="inherit" endIcon={<ChevronRight />}>
            Class Report
          </Button>
        </div>
        <Card className={classes.card}>
          <CardContent style={{ padding: 30 }}>
            <ProgressBar value={skillProgress} size="large" />
          </CardContent>
        </Card>
      </div>

      <div className="column spacing" style={{ marginTop: 10 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Typography className={classes.header}>Skills Practiced</Typography>
          <Button
            color="inherit"
            style={{ alignSelf: 'end' }}
            endIcon={<ChevronRight />}
          >
            View Report
          </Button>
        </div>
        <Card
          className={classes.card}
          style={{ backgroundColor: 'rgb(231, 231, 231)' }}
        >
          <CardContent className="column spacing">
            {Object.entries(skills).map((skill) => {
              return (
                <SkillCard
                  key={skill[0]}
                  name={skill[0]}
                  numMet={skill[1].numMet}
                  numTotal={skill[1].numTotal}
                />
              );
            })}
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
            style={{ marginLeft: 10, marginBottom: 10 }}
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
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Typography className={classes.header}>Trouble Spots</Typography>
          <Button
            color="inherit"
            style={{ alignSelf: 'end' }}
            endIcon={<ChevronRight />}
          >
            View Report
          </Button>
        </div>

        <Grid container spacing={2}>
          <Grid item xs={7}>
            <Card
              className={classes.card}
              style={{ backgroundColor: 'rgb(231, 231, 231)' }}
            >
              <CardContent className="column spacing">
                <Typography className={classes.headerText}>
                  Challenge Section
                </Typography>
                {Object.entries(skills)
                  .filter((skill) => skill[1].numMet / skill[1].numTotal < 0.5)
                  .map((skill) => {
                    return (
                      <SkillCard
                        key={skill[0]}
                        name={skill[0]}
                        numMet={skill[1].numMet}
                        numTotal={skill[1].numTotal}
                      />
                    );
                  })}
              </CardContent>
            </Card>
            <div
              className="row"
              style={{ width: '100%', justifyContent: 'flex-end' }}
            >
              <Button color="inherit" endIcon={<ChevronRight />}>
                Monitor Students
              </Button>
            </div>
          </Grid>
          <Grid item xs={5}>
            <Card
              className={classes.card}
              style={{ backgroundColor: 'rgb(231, 231, 231)' }}
            >
              <CardContent>
                <Typography className={classes.headerText}>
                  Need Help
                </Typography>
                <Typography variant="h2" fontWeight="bold" textAlign="center">
                  0
                </Typography>
              </CardContent>
            </Card>
            <div
              className="row"
              style={{ width: '100%', justifyContent: 'flex-end' }}
            >
              <Button color="inherit" endIcon={<ChevronRight />}>
                Monitor Rooms
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
