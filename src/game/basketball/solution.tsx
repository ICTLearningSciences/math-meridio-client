/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef } from 'react';
import { TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { Card, Typography } from '@mui/material';
import { GameData, GameStateData } from '../../store/slices/game/types';
import { makeStyles } from 'tss-react/mui';
import { Player } from '../../store/slices/player/types';
import { checkGameAndPlayerStateForValue } from '../../components/discussion-stage-builder/helpers';

export const NUMBER_OF_SHOTS = 100;
export const INSIDE_SHOT_PERCENT = 'inside_shot_percent';
export const INSIDE_SHOT_POINTS_VALUE = 2;
export const INSIDE_SHOT_SUCCESS_VALUE = 0.5;

export const MID_SHOT_PERCENT = 'middle_shot_percent';
export const MID_SHOT_POINTS_VALUE = 2;
export const MID_SHOT_SUCCESS_VALUE = 0.4;

export const OUTSIDE_SHOT_PERCENT = 'outside_shot_percent';
export const OUTSIDE_SHOT_POINTS_VALUE = 3;
export const OUTSIDE_SHOT_SUCCESS_VALUE = 0.36;

export const UNDERSTANDS_SUCCESS_SHOTS = 'understands_success_shots';
export const UNDERSTANDS_SHOT_POINTS = 'understands_shot_points';
export const UNDERSTANDS_MULTIPLICATION = 'understands_multiplication';
export const UNDERSTANDS_ADDITION = 'understands_addition';

import courtBg from './court.png';
import { EditableVariable } from '../../components/editable-variable';
export function SolutionComponent(props: {
  uiGameData: GameData;
  player: Player;
  updatePlayerStateData: (
    newPlayerStateData: GameStateData[],
    playerId: string
  ) => void;
}): JSX.Element {
  const { uiGameData, player, updatePlayerStateData } = props;
  const { classes } = useStyles();
  const { zoomIn, zoomOut } = useControls();

  const playerGameStateDataRecord: GameStateData =
    uiGameData.playerStateData[player._id];
  const globalGameStateDataRecord: GameStateData =
    uiGameData.globalStateData.gameStateData;
  const [understandsPoints, setUnderstandsPoints] = React.useState(false);
  const [understandsSuccess, setUnderstandsSuccess] = React.useState(false);
  const [understandsMultiplication, setUnderstandsMultiplication] =
    React.useState(false);
  const [understandsAddition, setUnderstandsAddition] = React.useState(false);
  const [editingVariable, setEditingVariable] = React.useState('');

  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (ref?.current) {
      new ResizeObserver(() => {
        setWidth(ref?.current?.clientWidth || 0);
        setHeight(ref?.current?.clientHeight || 0);
      }).observe(ref?.current);
    }
  }, []);

  React.useEffect(() => {
    if (width < 500 || height < 500) {
      zoomOut(1);
    } else {
      zoomIn(1);
    }
  }, [width, height]);

  React.useEffect(() => {
    const curPlayerStateData = uiGameData.playerStateData[player._id];
    const globalGameStateData = uiGameData.globalStateData.gameStateData;
    !understandsPoints &&
      setUnderstandsPoints(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_SHOT_POINTS,
          'true'
        )
      );
    !understandsSuccess &&
      setUnderstandsSuccess(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_SUCCESS_SHOTS,
          'true'
        )
      );
    !understandsMultiplication &&
      setUnderstandsMultiplication(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_MULTIPLICATION,
          'true'
        )
      );
    !understandsAddition &&
      setUnderstandsAddition(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_ADDITION,
          'true'
        )
      );
  }, [uiGameData.globalStateData.gameStateData, uiGameData.playerStateData]);

  function Variable(props: {
    dataKey: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isEnabled: (value: any) => boolean;
    value?: string;
    forceShow?: boolean;
  }): JSX.Element {
    const { isEnabled } = props;
    const data =
      globalGameStateDataRecord?.[props.dataKey] ||
      playerGameStateDataRecord?.[props.dataKey];
    const [revealed, setRevealed] = React.useState(data && isEnabled(data));
    const value =
      props.value ||
      globalGameStateDataRecord?.[props.dataKey] ||
      playerGameStateDataRecord?.[props.dataKey];

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
      ref={ref}
      className="column center-div"
      style={{
        height: '100%',
        width: '100%',
        backgroundImage: `url(${courtBg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <TransformComponent>
        <div className="column center-div">
          <Variable
            title="# of shots"
            dataKey=""
            isEnabled={() => true}
            value={String(NUMBER_OF_SHOTS)}
            forceShow={true}
          />
          <div className="row center-div">
            <Variable
              dataKey={UNDERSTANDS_SHOT_POINTS}
              isEnabled={() => understandsPoints}
              title="Points per inside shot"
              value={String(INSIDE_SHOT_POINTS_VALUE)}
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
              updatePlayerStateData={(newValue: number) => {
                updatePlayerStateData(
                  [
                    {
                      key: INSIDE_SHOT_PERCENT,
                      value: newValue,
                    },
                  ],
                  player._id
                );
              }}
              dataKey={INSIDE_SHOT_PERCENT}
              title="# of inside shots"
              myPlayerStateData={playerGameStateDataRecord || {}}
              shouldDisable={
                Boolean(editingVariable) &&
                editingVariable !== INSIDE_SHOT_PERCENT
              }
              setEditingVariable={setEditingVariable}
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
              dataKey={UNDERSTANDS_SUCCESS_SHOTS}
              isEnabled={() => understandsSuccess}
              title="Success% of inside shots"
              value={String(INSIDE_SHOT_SUCCESS_VALUE)}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography
                className={classes.boxText}
                style={{ color: '#C96049' }}
              >
                {' '}
                +{' '}
              </Typography>
            }
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
              updatePlayerStateData={(newValue: number) => {
                updatePlayerStateData(
                  [
                    {
                      key: MID_SHOT_PERCENT,
                      value: newValue,
                    },
                  ],
                  player._id
                );
              }}
              dataKey={MID_SHOT_PERCENT}
              title="# of mid shots"
              myPlayerStateData={playerGameStateDataRecord || {}}
              shouldDisable={
                Boolean(editingVariable) && editingVariable !== MID_SHOT_PERCENT
              }
              setEditingVariable={setEditingVariable}
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
              title="Success% of mid shots"
              value={String(MID_SHOT_SUCCESS_VALUE)}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography
                className={classes.boxText}
                style={{ color: '#C96049' }}
              >
                {' '}
                +{' '}
              </Typography>
            }
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
              updatePlayerStateData={(newValue: number) => {
                updatePlayerStateData(
                  [
                    {
                      key: OUTSIDE_SHOT_PERCENT,
                      value: newValue,
                    },
                  ],
                  player._id
                );
              }}
              dataKey={OUTSIDE_SHOT_PERCENT}
              title="# of 3 pointers"
              myPlayerStateData={playerGameStateDataRecord || {}}
              shouldDisable={
                Boolean(editingVariable) &&
                editingVariable !== OUTSIDE_SHOT_PERCENT
              }
              setEditingVariable={setEditingVariable}
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
              dataKey={UNDERSTANDS_SUCCESS_SHOTS}
              isEnabled={() => understandsSuccess}
              title="Success% of outside shots"
              value={String(OUTSIDE_SHOT_SUCCESS_VALUE)}
            />
          </div>
        </div>
      </TransformComponent>
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
