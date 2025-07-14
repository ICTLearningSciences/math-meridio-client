/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from 'react';
import { Card, TextField, Typography } from '@mui/material';
import { GameStateHandler } from '../../classes/game-state-handler';
import { PlayerStateData } from '../../store/slices/game';
import { makeStyles } from 'tss-react/mui';
import { Player } from '../../store/slices/player';
import { checkGameAndPlayerStateForValue } from '../../components/discussion-stage-builder/helpers';

export const NUMBER_OF_SHOTS = 100;
export const KICK_LEFT_PERCENT = 'kick_left_percent';
export const KICK_LEFT_POINTS_VALUE = 1;
export const KICK_LEFT_SUCCESS_VALUE = 0.5;

export const KICK_RIGHT_PERCENT = 'kick_right_percent';
export const KICK_RIGHT_POINTS_VALUE = 1;
export const KICK_RIGHT_SUCCESS_VALUE = 0.4;

export const UNDERSTANDS_SUCCESS_SHOTS = 'understands_success_shots';
export const UNDERSTANDS_SHOT_POINTS = 'understands_shot_points';
export const UNDERSTANDS_MULTIPLICATION = 'understands_multiplication';
export const UNDERSTANDS_ADDITION = 'understands_addition';

import courtBg from './court.jpeg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GameStateData = Record<string, any>;

export function SolutionComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const { classes } = useStyles();
  const [gameStateData, setGameStateData] = React.useState<GameStateData>({});
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [playerStateData, setPlayerStateData] = React.useState<
    PlayerStateData[]
  >([]);
  const [myPlayerStateData, setMyPlayerStateData] =
    React.useState<GameStateData>({});
  const curPlayerStateData = playerStateData.find(
    (p) => p.player === controller.player.clientId
  );

  const [understandsPoints, setUnderstandsPoints] = React.useState(false);
  const [understandsSuccess, setUnderstandsSuccess] = React.useState(false);
  const [understandsMultiplication, setUnderstandsMultiplication] =
    React.useState(false);
  const [understandsAddition, setUnderstandsAddition] = React.useState(false);

  React.useEffect(() => {
    !understandsPoints &&
      setUnderstandsPoints(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_SHOT_POINTS,
          'true'
        )
      );
    !understandsSuccess &&
      setUnderstandsSuccess(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_SUCCESS_SHOTS,
          'true'
        )
      );
    !understandsMultiplication &&
      setUnderstandsMultiplication(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_MULTIPLICATION,
          'true'
        )
      );
    !understandsAddition &&
      setUnderstandsAddition(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_ADDITION,
          'true'
        )
      );
  }, [
    controller.globalStateData.gameStateData,
    curPlayerStateData?.gameStateData || [],
  ]);

  React.useEffect(() => {
    setPlayers(controller.players);
  }, [controller.players]);

  React.useEffect(() => {
    const data: GameStateData = {};
    controller.globalStateData.gameStateData.forEach((d) => {
      data[d.key] = d.value;
    });
    setGameStateData(data);
  }, [controller.globalStateData.gameStateData]);

  React.useEffect(() => {
    setPlayerStateData(controller.playerStateData);
  }, [controller.playerStateData]);

  React.useEffect(() => {
    const data: GameStateData = {};
    const gameState =
      playerStateData.find((p) => p.player === controller.player.clientId)
        ?.gameStateData || [];
    gameState.forEach((d) => {
      data[d.key] = d.value;
    });
    setMyPlayerStateData(data);
  }, [playerStateData, players]);

  function Variable(props: {
    dataKey: string;
    title: string;
    isEnabled: (value: any) => boolean;
    value?: string;
    forceShow?: boolean;
  }): JSX.Element {
    const { isEnabled } = props;
    const data =
      gameStateData[props.dataKey] || myPlayerStateData[props.dataKey];
    const [revealed, setRevealed] = React.useState(data && isEnabled(data));
    const value =
      props.value ||
      gameStateData[props.dataKey] ||
      myPlayerStateData[props.dataKey];

    useEffect(() => {
      if (revealed) {
        return;
      }
      if (props.forceShow || (data && isEnabled(data))) {
        setRevealed(true);
      }
    }, [data, isEnabled]);

    return (
      <Card
        className={classes.box}
        style={{
          display: props.forceShow || (data && isEnabled(data)) ? '' : 'none',
          backgroundColor: '#e3a363',
        }}
      >
        <Typography className={classes.text}>{props.title}</Typography>
        <Typography className={classes.boxText} style={{ color: 'white' }}>
          {value}
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
              (data[KICK_LEFT_PERCENT] || 0) +
                (data[KICK_RIGHT_PERCENT] || 0) <=
              NUMBER_OF_SHOTS
            ) {
              controller.newPlayerStateData(
                [
                  {
                    key: props.dataKey,
                    value: value,
                  },
                ],
                controller.player.clientId
              );
            }
          }}
        />
      </Card>
    );
  }

  function RevealingIcon(props: {
    reveal: boolean;
    icon: JSX.Element;
  }): JSX.Element {
    const { reveal, icon } = props;
    const [revealed, setRevealed] = React.useState(reveal);

    useEffect(() => {
      if (reveal) {
        setRevealed(true);
      }
    }, [reveal]);

    return (
      <Card
        className={classes.box}
        style={{
          backgroundColor: '#E3A363',
          borderColor: '#C96049',
          padding: 0,
          width: 50,
          height: 50,
          minWidth: 50,
          minHeight: 50,
          borderRadius: 50,
          display: revealed ? '' : 'none',
        }}
      >
        <Typography className={classes.boxText}>{icon}</Typography>
      </Card>
    );
  }

  return (
    <div
      className="column center-div"
      style={{
        height: window.innerHeight - 400,
        backgroundImage: `url(${courtBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '100%', // ensure full width
      }}
    >
      {/* Kick Left Row */}
      <div className="row center-div">
        <Variable
          dataKey={UNDERSTANDS_SHOT_POINTS}
          isEnabled={() => understandsPoints}
          title="Points per kick left"
          value={String(KICK_LEFT_POINTS_VALUE)}
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={
            <Typography
              className={classes.boxText}
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <EditableVariable dataKey={KICK_LEFT_PERCENT} title="# of kicks left" />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={
            <Typography
              className={classes.boxText}
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <Variable
          dataKey={UNDERSTANDS_SUCCESS_SHOTS}
          isEnabled={() => understandsSuccess}
          title="Success% of kicks left"
          value={String(KICK_LEFT_SUCCESS_VALUE)}
        />
      </div>

      <RevealingIcon
        reveal={understandsAddition}
        icon={
          <Typography className={classes.boxText} style={{ color: '#C96049' }}>
            {' '}
            +{' '}
          </Typography>
        }
      />

      {/* Kick Right Row */}
      <div className="row center-div">
        <Variable
          isEnabled={() => understandsPoints}
          dataKey={UNDERSTANDS_SHOT_POINTS}
          title="Points per kick right"
          value={String(KICK_RIGHT_POINTS_VALUE)}
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={
            <Typography
              className={classes.boxText}
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <EditableVariable
          dataKey={KICK_RIGHT_PERCENT}
          title="# of kicks right"
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={
            <Typography
              className={classes.boxText}
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <Variable
          isEnabled={() => understandsSuccess}
          dataKey={UNDERSTANDS_SUCCESS_SHOTS}
          title="Success% of kicks right"
          value={String(KICK_RIGHT_SUCCESS_VALUE)}
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
