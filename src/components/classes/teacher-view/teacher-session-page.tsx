/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { CheckCircleOutline, ChevronRight, Person } from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { Room } from '../../../store/slices/game/types';
import { GAMES } from '../../../game/types';
import AvatarSprite from '../../avatar-sprite';

const styles = makeStyles()(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 200,
    bottom: 0,
    color: 'white',
    backgroundColor: 'rgb(114, 20, 201)',
    padding: 40,
    paddingTop: 40,
    marginTop: 40,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    overflow: 'auto',
    scrollbarWidth: 'none',
  },
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
  skillItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
}));

function ProgressBar(props: { value: number; size?: number }): JSX.Element {
  return (
    <LinearProgress
      variant="determinate"
      value={props.value}
      style={{ height: props.size || 15, borderRadius: 40 }}
      sx={{
        backgroundColor: 'rgb(217, 217, 217)',
        '& .MuiLinearProgress-bar': {
          backgroundColor: 'orange',
          borderTopRightRadius: 40,
          borderBottomRightRadius: 40,
        },
      }}
    />
  );
}

function SkillCard(): JSX.Element {
  const { classes } = styles();
  return (
    <div className={classes.skillItem}>
      <Typography>Common core standard / subskill</Typography>
      <div className="row center-div">
        <Person fontSize="small" />
        <Typography>16</Typography>
      </div>
    </div>
  );
}

function RoomCard(props: { room: Room }): JSX.Element {
  const { room } = props;
  const { classes } = styles();
  const game = GAMES.find((g) => g.id === room?.gameData.gameId);

  return (
    <div>
      <Card className={classes.card}>
        <CardContent className="column spacing">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <Typography
              style={{
                whiteSpace: 'nowrap',
                overflowX: 'scroll',
                scrollbarWidth: 'none',
              }}
              className={classes.headerText}
            >
              {room.name}
            </Typography>
            <CheckCircleOutline color="success" />
          </div>
          <div
            className="row center-div"
            style={{
              justifyContent: 'space-evenly',
              overflowX: 'scroll',
              scrollbarWidth: 'none',
            }}
          >
            {room.gameData.players.map((player) => {
              const curDate = new Date().getTime();
              const loginAt = new Date(player.lastLoginAt).getTime();
              const hoursSince = Math.floor(
                Math.abs(curDate - loginAt) / (1000 * 60 * 60)
              );
              return (
                <div key={player._id} className="column center-div">
                  <AvatarSprite player={player} bgColor="rgb(218, 183, 250)" />
                  <Typography
                    variant="body2"
                    fontSize={12}
                    fontWeight="bold"
                    align="center"
                    style={{ marginTop: 5 }}
                  >
                    {player.name}
                  </Typography>
                  <Typography fontSize={10} fontWeight="lighter">
                    {hoursSince === 0 ? 'ACTIVE' : `${hoursSince} HOURS AGO`}
                  </Typography>
                </div>
              );
            })}
          </div>
          <ProgressBar value={25} />
          <Typography variant="body2" textAlign="end">
            {game?.name || room?.gameData.gameId}
          </Typography>
        </CardContent>
      </Card>
      <div
        className="row"
        style={{ width: '100%', justifyContent: 'flex-end' }}
      >
        <Button color="inherit" endIcon={<ChevronRight />}>
          Room Report
        </Button>
      </div>
    </div>
  );
}

export default function ActiveSessionView(props: {
  classId: string;
}): JSX.Element {
  const { classId } = props;
  const { classes } = styles();
  const { educationalData } = useWithEducationalData();
  const gameRooms = educationalData.rooms.filter((r) => r.classId === classId);

  return (
    <div className={classes.root}>
      <Typography variant="h5" fontWeight="bold">
        ACTIVE SESSION
      </Typography>

      <div className="column spacing" style={{ marginTop: 10 }}>
        <Typography className={classes.header}>Overall Progress</Typography>
        <Card className={classes.card}>
          <CardContent style={{ padding: 30 }}>
            <ProgressBar value={50} size={30} />
            <div
              className="row"
              style={{ justifyContent: 'space-between', marginTop: 10 }}
            >
              <Typography style={{ color: 'gray' }}>PHASE 1</Typography>
              <Typography style={{ color: 'gray' }}>PHASE 2</Typography>
              <Typography style={{ color: 'gray' }}>PHASE 3</Typography>
              <Typography style={{ color: 'gray' }}>PHASE 4</Typography>
              <Typography style={{ color: 'gray' }}>PHASE 5</Typography>
              <Typography style={{ color: 'gray' }}>PHASE 6</Typography>
            </div>
          </CardContent>
        </Card>
        <Button
          color="inherit"
          style={{ alignSelf: 'end' }}
          endIcon={<ChevronRight />}
        >
          Class Report
        </Button>
      </div>

      <div className="column spacing" style={{ marginTop: 10 }}>
        <Typography className={classes.header}>Open Rooms</Typography>
        {gameRooms.length === 0 && (
          <Typography variant="body2" align="center">
            There are no open rooms yet
          </Typography>
        )}
        <Grid container spacing={2}>
          {gameRooms.map((room, idx) => {
            return (
              <Grid item xs={4} key={`room-${idx}`}>
                <RoomCard room={room} />
              </Grid>
            );
          })}
        </Grid>
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
            <SkillCard />
            <SkillCard />
            <SkillCard />
          </CardContent>
        </Card>
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
                  Difficult Questions
                </Typography>
                <SkillCard />
                <SkillCard />
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
                  8
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
