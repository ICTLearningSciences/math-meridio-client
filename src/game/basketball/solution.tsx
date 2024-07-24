/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from 'react';
import { Card, CardActionArea, TextField, Typography } from '@mui/material';
import { QuestionMark } from '@mui/icons-material';

import { GameStateHandler } from '../../classes/game-state-handler';
import { GameStateData, PlayerStateData } from '../../store/slices/game';
import { makeStyles } from 'tss-react/mui';
import EventSystem from '../event-system';
import { BasketballSimulationData } from './SimulationScene';
import { Player } from '../../store/slices/player';
import { checkGameAndPlayerStateForValue } from '../../components/discussion-stage-builder/helpers';

export const NUMBER_OF_SHOTS = 100;
// export const INSIDE_SHOT_POINTS = 'inside_shot_points';
// export const INSIDE_SHOT_SUCCESS = 'inside_shot_success';
export const INSIDE_SHOT_PERCENT = 'inside_shot_percent';
export const INSIDE_SHOT_POINTS_VALUE = 2;
export const INSIDE_SHOT_SUCCESS_VALUE = 0.5;

// export const MID_SHOT_POINTS = 'mid_shot_points';
// export const MID_SHOT_SUCCESS = 'mid_shot_success';
export const MID_SHOT_PERCENT = 'middle_shot_percent';
export const MID_SHOT_POINTS_VALUE = 2;
export const MID_SHOT_SUCCESS_VALUE = 0.4;

// export const OUTSIDE_SHOT_POINTS = 'outside_shot_points';
// export const OUTSIDE_SHOT_SUCCESS = 'outside_shot_success';
export const OUTSIDE_SHOT_PERCENT = 'outside_shot_percent';
export const OUTSIDE_SHOT_POINTS_VALUE = 3;
export const OUTSIDE_SHOT_SUCCESS_VALUE = 0.36;

export const UNDERSTANDS_SUCCESS_SHOTS = 'understands_success_shots';
export const UNDERSTANDS_SHOT_POINTS = 'understands_shot_points';
export const UNDERSTANDS_MULTIPLICATION = 'understands_multiplication';
export const UNDERSTANDS_ADDITION = 'understands_addition';

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
  const [curSimulation, setCurSimulation] = React.useState<string>();
  const curPlayerStateData = playerStateData.find(
    (p) => p.player === controller.player.clientId
  );

  const [understandsPoints, setUnderstandsPoints] = React.useState(false);
  const [understandsSuccess, setUnderstandsSuccess] = React.useState(false);
  const [understandsMultiplication, setUnderstandsMultiplication] =
    React.useState(false);
  const [understandsAddition, setUnderstandsAddition] = React.useState(false);

  React.useEffect(() => {
    EventSystem.on('simulate', (data: BasketballSimulationData) =>
      setCurSimulation(data.player)
    );
  }, []);

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

  function GivenVariable(props: {
    title: string;
    value: number | string | boolean;
  }): JSX.Element {
    return (
      <div className={classes.grouping}>
        <Typography className={classes.text}>{props.title}</Typography>
        <Card
          elevation={20}
          className={classes.box}
          style={{ backgroundColor: '#ff00ff' }}
        >
          <Typography className={classes.boxText} style={{ color: 'black' }}>
            {props.value}
          </Typography>
        </Card>
      </div>
    );
  }

  function Variable(props: {
    dataKey: string;
    title: string;
    isEnabled: (value: any) => boolean;
    value?: string;
  }): JSX.Element {
    const { isEnabled } = props;
    const data =
      gameStateData[props.dataKey] ||
      playerStateData
        .find((p) => p.player === controller.player.clientId)
        ?.gameStateData.find((d) => d.key === props.dataKey);
    const [revealed, setRevealed] = React.useState(
      data && isEnabled(data.value)
    );

    useEffect(() => {
      if (revealed) {
        return;
      }
      if (data && isEnabled(data.value)) {
        setRevealed(true);
      }
    }, [data, isEnabled]);

    return (
      <div
        className={classes.grouping}
        style={{ display: revealed ? '' : 'none' }}
      >
        <Typography className={classes.text}>{props.title}</Typography>
        <Card className={classes.box} style={{ backgroundColor: '#888' }}>
          {revealed ? (
            <Typography className={classes.boxText}>
              {props.value || data.value}
            </Typography>
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
  }): JSX.Element {
    const data = myPlayerStateData[props.dataKey];

    return (
      <div className={classes.grouping} style={{ display: data ? '' : 'none' }}>
        <Typography fontSize={14}>{props.title}</Typography>
        <Card
          className={classes.box}
          style={{
            backgroundColor: '#03517c',
          }}
        >
          <TextField
            value={data || 0}
            variant="standard"
            type="number"
            sx={{
              input: { color: 'white', textAlign: 'center' },
              '& .MuiInput-underline:before': { borderBottomColor: 'white' },
              '& .MuiInput-underline:after': { borderBottomColor: 'white' },
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
      </div>
    );
  }

  /**
   * A component that will reveal the icon when reveal is true, and never hide it again.
   */
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
          backgroundColor: '#b8e1a9',
          marginTop: 10,
          width: 1,
          height: 1,
          display: reveal ? '' : 'none',
        }}
      >
        {revealed ? <Typography>{icon}</Typography> : <QuestionMark />}
      </Card>
    );
  }

  function PlayerStrategy(props: { data: PlayerStateData }): JSX.Element {
    const psd = props.data;
    const player = players.find((p) => p.clientId === psd.player);
    const insideShots = psd.gameStateData.find(
      (d) => d.key === INSIDE_SHOT_PERCENT
    );
    const midShots = psd.gameStateData.find((d) => d.key === MID_SHOT_PERCENT);
    const outsideShots = psd.gameStateData.find(
      (d) => d.key === OUTSIDE_SHOT_PERCENT
    );

    const canSimulate = Boolean(
      insideShots &&
        midShots &&
        outsideShots &&
        parseInt(insideShots.value) +
          parseInt(midShots.value) +
          parseInt(outsideShots.value) ===
          NUMBER_OF_SHOTS
    );

    function simulate(): void {
      if (!outsideShots || !midShots || !insideShots) return;
      const simData: BasketballSimulationData = {
        player: psd.player,
        outsideShots: outsideShots.value,
        midShots: midShots.value,
        insideShots: insideShots.value,
        outsideShotsMade: Math.round(
          outsideShots.value * OUTSIDE_SHOT_SUCCESS_VALUE
        ),
        insideShotsMade: Math.round(
          insideShots.value * INSIDE_SHOT_SUCCESS_VALUE
        ),
        midShotsMade: Math.round(midShots.value * MID_SHOT_SUCCESS_VALUE),
        totalPoints: 0,
      };
      simData.totalPoints =
        simData.outsideShotsMade * OUTSIDE_SHOT_POINTS_VALUE +
        simData.insideShotsMade * INSIDE_SHOT_POINTS_VALUE +
        simData.midShotsMade * MID_SHOT_POINTS_VALUE;
      EventSystem.emit('simulate', simData);
    }

    return (
      <Card elevation={canSimulate ? 5 : 0}>
        <CardActionArea
          className={classes.box}
          style={{
            flexDirection: 'column',
            backgroundColor:
              psd.player === curSimulation ? '#6bffff' : '#cfd8dc',
            width: 'auto',
            margin: 0,
          }}
          disabled={!canSimulate}
          onClick={simulate}
        >
          <Typography className={classes.text} style={{ fontWeight: 'bold' }}>
            {player?.clientId === controller.player.clientId && '(MINE) '}
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
      <GivenVariable title="Number of shots" value={NUMBER_OF_SHOTS} />
      <div style={{ flexGrow: 1 }} />
      <div className="row center-div">
        <Variable
          dataKey={UNDERSTANDS_SHOT_POINTS}
          isEnabled={() => understandsPoints}
          title="Points per inside shot"
          value={String(INSIDE_SHOT_POINTS_VALUE)}
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={<Typography> * </Typography>}
        />
        <EditableVariable
          dataKey={INSIDE_SHOT_PERCENT}
          title="# of inside shots"
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={<Typography> * </Typography>}
        />
        <Variable
          dataKey={UNDERSTANDS_SUCCESS_SHOTS}
          isEnabled={() => understandsSuccess}
          title="Success% of inside shots"
          value={String(INSIDE_SHOT_SUCCESS_VALUE)}
        />
      </div>
      <RevealingIcon
        reveal={understandsAddition}
        icon={<Typography> + </Typography>}
      />
      <div className="row center-div">
        <Variable
          isEnabled={() => understandsPoints}
          dataKey={UNDERSTANDS_SHOT_POINTS}
          title="Points per mid shot"
          value={String(MID_SHOT_POINTS_VALUE)}
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={<Typography> * </Typography>}
        />
        <EditableVariable dataKey={MID_SHOT_PERCENT} title="# of mid shots" />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={<Typography> * </Typography>}
        />
        <Variable
          isEnabled={() => understandsSuccess}
          dataKey={UNDERSTANDS_SUCCESS_SHOTS}
          title="Success% of mid shots"
          value={String(MID_SHOT_SUCCESS_VALUE)}
        />
      </div>
      <RevealingIcon
        reveal={understandsAddition}
        icon={<Typography> + </Typography>}
      />
      <div className="row center-div">
        <Variable
          dataKey={UNDERSTANDS_SHOT_POINTS}
          isEnabled={() => understandsPoints}
          title="Points per outside shot"
          value={String(OUTSIDE_SHOT_POINTS_VALUE)}
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={<Typography> * </Typography>}
        />
        <EditableVariable
          dataKey={OUTSIDE_SHOT_PERCENT}
          title="# of outside shots"
        />
        <RevealingIcon
          reveal={understandsMultiplication}
          icon={<Typography> * </Typography>}
        />
        <Variable
          dataKey={UNDERSTANDS_SUCCESS_SHOTS}
          isEnabled={() => understandsSuccess}
          title="Success% of outside shots"
          value={String(OUTSIDE_SHOT_SUCCESS_VALUE)}
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
