/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Card, TextField, Typography } from '@mui/material';
import { GameStateHandler } from '../../classes/game-state-handler';
import EventSystem from '../event-system';
import { PlayerStateData } from '../../store/slices/game';
import { Player } from '../../store/slices/player';
import { BasketballSimulationData } from './SimulationScene';

export const NUMBER_OF_SHOTS = 100;
export const INSIDE_SHOT_POINTS = 'inside_shot_points';
export const INSIDE_SHOT_PERCENT = 'inside_shot_percent';
export const INSIDE_SHOT_SUCCESS = 'inside_shot_success';
export const INSIDE_SHOT_POINTS_VALUE = 2;
export const INSIDE_SHOT_SUCCESS_VALUE = 0.75;

export const MID_SHOT_POINTS = 'mid_shot_points';
export const MID_SHOT_PERCENT = 'mid_shot_percent';
export const MID_SHOT_SUCCESS = 'mid_shot_success';
export const MID_SHOT_POINTS_VALUE = 2;
export const MID_SHOT_SUCCESS_VALUE = 0.5;

export const OUTSIDE_SHOT_POINTS = 'outside_shot_points';
export const OUTSIDE_SHOT_PERCENT = 'outside_shot_percent';
export const OUTSIDE_SHOT_SUCCESS = 'outside_shot_success';
export const OUTSIDE_SHOT_POINTS_VALUE = 3;
export const OUTSIDE_SHOT_SUCCESS_VALUE = 0.25;

export const UNDERSTANDS_MULTIPLICATION = 'understands_multiplication';
export const UNDERSTANDS_ADDITION = 'understands_addition';

import courtBg from './court.png';

export function SolutionComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const { classes } = useStyles();
  const [gameStateData, setGameStateData] = React.useState<Record<string, any>>(
    {}
  );
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [playerStateData, setPlayerStateData] = React.useState<
    PlayerStateData[]
  >([]);
  const [myPlayerStateData, setMyPlayerStateData] = React.useState<
    Record<string, any>
  >({});

  React.useEffect(() => {
    setPlayers(controller.players);
  }, [controller.players]);

  React.useEffect(() => {
    const data: Record<string, any> = {};
    controller.globalStateData.gameStateData.forEach((d) => {
      data[d.key] = d.value;
    });
    setGameStateData(data);
  }, [controller.globalStateData.gameStateData]);

  React.useEffect(() => {
    setPlayerStateData(controller.playerStateData);
  }, [controller.playerStateData]);

  React.useEffect(() => {
    const data: Record<string, any> = {};
    const gameState =
      playerStateData.find((p) => p.player === controller.player.clientId)
        ?.gameStateData || [];
    gameState.forEach((d) => {
      data[d.key] = d.value;
    });
    setMyPlayerStateData(data);
  }, [playerStateData, players]);

  function Variable(props: {
    title: string;
    dataKey: string;
    value?: number | string | boolean;
  }): JSX.Element {
    const value =
      gameStateData[props.dataKey] ||
      myPlayerStateData[props.dataKey] ||
      props.value;
    return (
      <Card
        className={classes.box}
        style={{
          display: value === undefined ? 'none' : '',
          backgroundColor: value === undefined ? '#205961' : '#e3a363',
        }}
      >
        <Typography className={classes.text}>{props.title}</Typography>
        <Typography
          className={classes.boxText}
          style={{ color: value === undefined ? 'yellow' : 'white' }}
        >
          {value === undefined ? '?' : value}
        </Typography>
      </Card>
    );
  }

  function EditableVariable(props: {
    dataKey: string;
    title: string;
  }): JSX.Element {
    const data = myPlayerStateData[props.dataKey];

    return (
      <Card
        className={classes.box}
        style={{
          backgroundColor: '#fff8db',
          borderColor: 'red',
          display: data ? '' : 'none',
        }}
      >
        <Typography className={classes.text} style={{ color: '#c96049' }}>
          {props.title}
        </Typography>
        <TextField
          value={data || 0}
          variant="standard"
          type="number"
          sx={{
            input: {
              color: '#c96049',
              fontSize: 40,
              fontFamily: 'SigmarOne',
              textAlign: 'center',
              margin: 0,
              padding: 0,
            },
            '& .MuiInput-underline:before': { borderBottomColor: '#c96049' },
            '& .MuiInput-underline:after': { borderBottomColor: '#c96049' },
          }}
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            const data = { ...myPlayerStateData };
            data[props.dataKey] = value;
            if (
              (data[INSIDE_SHOT_PERCENT] || 0) +
              (data[MID_SHOT_PERCENT] || 0) +
              (data[OUTSIDE_SHOT_PERCENT] || 0) <=
              NUMBER_OF_SHOTS
            ) {
              controller.newPlayerStateData([
                {
                  key: props.dataKey,
                  value: value,
                },
              ]);
            }
          }}
        />
      </Card>
    );
  }

  function Connection(props: {
    dataKey: string;
    isEnabled: (data: any) => boolean;
    displayValue?: string;
  }): JSX.Element {
    const { isEnabled, displayValue } = props;
    const value =
      gameStateData[props.dataKey] || myPlayerStateData[props.dataKey];
    return (
      <Card
        className={classes.box}
        style={{
          backgroundColor: value && isEnabled(value) ? '#e3a363' : '#205961',
          borderColor: value && isEnabled(value) ? '#c96049' : '',
          padding: 0,
          width: 50,
          height: 50,
          minWidth: 50,
          minHeight: 50,
          borderRadius: 50,
          display: value && isEnabled(value) ? '' : 'none',
        }}
      >
        <Typography
          className={classes.boxText}
          style={{ color: value && isEnabled(value) ? '#c96049' : 'yellow' }}
        >
          {value && isEnabled(value) ? displayValue || value : '?'}
        </Typography>
      </Card>
    );
  }

  return (
    <div
      className="column center-div"
      style={{
        backgroundImage: `url(${courtBg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Variable title="# of shots" dataKey="" value={NUMBER_OF_SHOTS} />
      <div className="row center-div">
        <Variable dataKey={INSIDE_SHOT_POINTS} title="Points per inside shot" />
        <Connection
          dataKey={UNDERSTANDS_MULTIPLICATION}
          isEnabled={(value) => value === 'true'}
          displayValue="*"
        />
        <EditableVariable
          dataKey={INSIDE_SHOT_PERCENT}
          title="# of inside shots"
        />
        <Connection
          dataKey={UNDERSTANDS_MULTIPLICATION}
          isEnabled={(value) => value === 'true'}
          displayValue="*"
        />
        <Variable
          dataKey={INSIDE_SHOT_SUCCESS}
          title="Success% of inside shots"
        />
      </div>
      <Connection
        dataKey={UNDERSTANDS_ADDITION}
        isEnabled={() => true}
        displayValue="+"
      />
      <div className="row center-div">
        <Variable dataKey={MID_SHOT_POINTS} title="Points per mid shot" />
        <Connection
          dataKey={UNDERSTANDS_MULTIPLICATION}
          isEnabled={(value) => value === 'true'}
          displayValue="*"
        />
        <EditableVariable dataKey={MID_SHOT_PERCENT} title="# of mid shots" />
        <Connection
          dataKey={UNDERSTANDS_MULTIPLICATION}
          isEnabled={(value) => value === 'true'}
          displayValue="*"
        />
        <Variable dataKey={MID_SHOT_SUCCESS} title="Success% of mid shots" />
      </div>
      <Connection
        dataKey={UNDERSTANDS_ADDITION}
        isEnabled={(value) => value === 'true'}
        displayValue="+"
      />
      <div className="row center-div">
        <Variable
          dataKey={OUTSIDE_SHOT_POINTS}
          title="Points per outside shot"
        />
        <Connection
          dataKey={UNDERSTANDS_MULTIPLICATION}
          isEnabled={(value) => value === 'true'}
          displayValue="*"
        />
        <EditableVariable
          dataKey={OUTSIDE_SHOT_PERCENT}
          title="# of 3 pointers"
        />
        <Connection
          dataKey={UNDERSTANDS_MULTIPLICATION}
          isEnabled={(value) => value === 'true'}
          displayValue="*"
        />
        <Variable
          dataKey={OUTSIDE_SHOT_SUCCESS}
          title="Success% of outside shots"
        />
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 10,
    height: 'auto',
    width: 'auto',
    minWidth: 100,
    border: '1px solid lightgrey',
    boxShadow: '-5px 5px 10px 0px rgba(0,0,0,0.75)',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
  },
  boxText: {
    color: 'white',
    fontSize: 40,
    fontFamily: 'SigmarOne',
  },
}));
