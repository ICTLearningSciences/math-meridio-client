/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Card, CardActionArea, TextField, Typography } from '@mui/material';
import { QuestionMark } from '@mui/icons-material';

import { GameStateHandler } from '../../classes/game-state-handler';
import { GameStateData, PlayerStateData } from '../../store/slices/game';
import { makeStyles } from 'tss-react/mui';
import EventSystem from '../event-system';

export function SolutionComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const { classes } = useStyles();

  const players = controller.players;
  const gameStateData = controller.globalStateData.gameStateData;
  const playerStateData = controller.playerStateData;
  const myPlayerStateData =
    playerStateData.find((p) => p.player === controller.player.clientId)
      ?.gameStateData || [];

  function GivenVariable(props: {
    title: string;
    value: number | string | boolean;
  }): JSX.Element {
    return (
      <div className={classes.grouping}>
        <Typography className={classes.text}>{props.title}</Typography>
        <Card className={classes.box} style={{ backgroundColor: '#ff00ff' }}>
          <Typography className={classes.boxText}>{props.value}</Typography>
        </Card>
      </div>
    );
  }

  function Variable(props: {
    dataKey: string;
    title: string;
    data: GameStateData[];
  }): JSX.Element {
    const data = props.data.find((d) => d.key === props.dataKey);
    return (
      <div
        className={classes.grouping}
        // style={{ display: data ? '' : 'none' }}
      >
        <Typography className={classes.text}>{props.title}</Typography>
        <Card className={classes.box} style={{ backgroundColor: '#888' }}>
          {data?.value ? (
            <Typography className={classes.boxText}>{data.value}</Typography>
          ) : (
            <QuestionMark className={classes.boxText} />
          )}
        </Card>
      </div>
    );
  }

  function EditableVariable(props: {
    dataKey: string;
    title: string;
    data: GameStateData[];
  }): JSX.Element {
    const data = props.data.find((d) => d.key === props.dataKey);
    return (
      <div
        className={classes.grouping}
        // style={{ display: data ? '' : 'none' }}
      >
        <Typography fontSize={14}>{props.title}</Typography>
        <Card
          className={classes.box}
          style={{
            backgroundColor: '#03517c',
          }}
        >
          <TextField
            value={data?.value || 0}
            variant="standard"
            type="number"
            sx={{
              input: { color: 'white', textAlign: 'center' },
              '& .MuiInput-underline:before': { borderBottomColor: 'white' },
              '& .MuiInput-underline:after': { borderBottomColor: 'white' },
            }}
            InputProps={{ inputProps: { min: 0, max: 10 } }}
            onChange={(e) =>
              controller.updatePlayerStateVariable({
                key: props.dataKey,
                value: parseInt(e.target.value),
              })
            }
          />
        </Card>
      </div>
    );
  }

  function Connection(props: {
    dataKey: string;
    data: GameStateData[];
  }): JSX.Element {
    const data = props.data.find(
      (d) =>
        `${d.key}`.toLowerCase().replace(' ', '') ===
        `${props.dataKey}`.toLowerCase().replace(' ', '')
    );
    return (
      <Card
        className={classes.box}
        style={{
          backgroundColor: '#b8e1a9',
          marginTop: 10,
          width: 1,
          height: 1,
          // display: data ? '' : 'none',
        }}
      >
        {data?.value ? <Typography>{data.value}</Typography> : <QuestionMark />}
      </Card>
    );
  }

  function PlayerStrategy(props: { data: PlayerStateData }): JSX.Element {
    const psd = props.data;
    const player = players.find((p) => p.clientId === psd.player);
    const insideShots = psd.gameStateData.find(
      (d) => d.key === 'inside_shot_percent'
    );
    const midShots = psd.gameStateData.find(
      (d) => d.key === 'mid_shot_percent'
    );
    const outsideShots = psd.gameStateData.find(
      (d) => d.key === 'outside_shot_percent'
    );
    const canSimulate = Boolean(insideShots && midShots && outsideShots);

    return (
      <Card elevation={canSimulate ? 5 : 0}>
        <CardActionArea
          className={classes.box}
          style={{
            flexDirection: 'column',
            backgroundColor: '#cfd8dc',
            width: 'auto',
            margin: 0,
          }}
          disabled={!canSimulate}
          onClick={() =>
            EventSystem.emit('simulate', {
              player: psd.player,
              outsideShots: outsideShots?.value,
              midShots: midShots?.value,
              insideShots: insideShots?.value,
              outsidePercent: 0.25,
              midPercent: 0.5,
              insidePercent: 0.75,
            })
          }
        >
          <Typography className={classes.text} style={{ fontWeight: 'bold' }}>
            {player?.name}&apos;s strategy:
          </Typography>
          <Typography
            className={classes.text}
            style={{ display: insideShots ? '' : 'none' }}
          >
            # of inside shots: {insideShots?.value || 0}
          </Typography>
          <Typography
            className={classes.text}
            style={{ display: midShots ? '' : 'none' }}
          >
            # of mid shots: {midShots?.value || 0}
          </Typography>
          <Typography
            className={classes.text}
            style={{ display: outsideShots ? '' : 'none' }}
          >
            # of mid shots: {outsideShots?.value || 0}
          </Typography>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <div className="column center-div" style={{ height: '95%' }}>
      <GivenVariable title="Number of shots" value={100} />
      <div style={{ flexGrow: 1 }} />
      <div className="row center-div">
        <Variable
          dataKey="inside_shot_points"
          title="Points per inside shot"
          data={gameStateData}
        />
        <Connection dataKey="multiplication" data={myPlayerStateData} />
        <EditableVariable
          dataKey="inside_shot_percent"
          title="# of inside shots"
          data={myPlayerStateData}
        />
        <Connection dataKey="multiplication" data={myPlayerStateData} />
        <Variable
          dataKey="inside_shot_success"
          title="Success% of inside shots"
          data={myPlayerStateData}
        />
      </div>
      <Connection dataKey="addition" data={myPlayerStateData} />
      <div className="row center-div">
        <Variable
          dataKey="mid_shot_points"
          title="Points per mid shot"
          data={gameStateData}
        />
        <Connection dataKey="multiplication" data={myPlayerStateData} />
        <EditableVariable
          dataKey="mid_shot_percent"
          title="# of mid shots"
          data={myPlayerStateData}
        />
        <Connection dataKey="multiplication" data={myPlayerStateData} />
        <Variable
          dataKey="mid_shot_success"
          title="Success% of mid shots"
          data={myPlayerStateData}
        />
      </div>
      <Connection dataKey="addition" data={myPlayerStateData} />
      <div className="row center-div">
        <Variable
          dataKey="outside_shot_points"
          title="Points per outside shot"
          data={gameStateData}
        />
        <Connection dataKey="multiplication" data={myPlayerStateData} />
        <EditableVariable
          dataKey="outside_shot_percent"
          title="# of outside shots"
          data={myPlayerStateData}
        />
        <Connection dataKey="multiplication" data={myPlayerStateData} />
        <Variable
          dataKey="outside_shot_success"
          title="Success% of outside shots"
          data={myPlayerStateData}
        />
      </div>
      <div style={{ flexGrow: 1 }} />
      <div
        className="row center-div"
        style={{ width: '100%', justifyContent: 'space-evenly' }}
      >
        {playerStateData.map((psd) => (
          <PlayerStrategy key={psd.player} data={psd} />
        ))}
      </div>
    </div>
  );
}

const useStyles = makeStyles()(() => ({
  grouping: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    marginRight: 5,
    height: 'auto',
    width: 100,
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
  },
  boxText: {
    color: 'white',
  },
}));
