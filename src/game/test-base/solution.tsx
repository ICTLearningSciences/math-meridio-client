/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useMemo, useRef } from 'react';
import { TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { Card, Typography } from '@mui/material';

import {
  GameData,
  GameStateData,
  PlayerStateData,
} from '../../store/slices/game/types';
import { makeStyles } from 'tss-react/mui';
import { Player } from '../../store/slices/player/types';
import { checkGameAndPlayerStateForValue } from '../../components/discussion-stage-builder/helpers';

import stageBg from './stage.jpg';
import { EditableVariable } from './editable-variable';
import {
  VIP_TICKET_PERCENT_KEY,
  VIP_TICKET_PRICE,
  VIP_TICKET_CONVERSION_RATE,
  RESERVED_TICKET_PERCENT_KEY,
  RESERVED_TICKET_PRICE,
  RESERVED_TICKET_CONVERSION_RATE,
  GENERAL_ADMISSION_TICKET_PERCENT_KEY,
  GENERAL_ADMISSION_TICKET_PRICE,
  GENERAL_ADMISSION_TICKET_CONVERSION_RATE,
  TOTAL_NUMBER_OF_TICKETS,
  UNDERSTANDS_ADDITION_KEY,
  UNDERSTANDS_MULTIPLICATION_KEY,
  UNDERSTANDS_TICKET_PRICES_KEY,
  UNDERSTANDS_CONVERSION_RATE_KEY,
} from '.';

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

  const playerGameStateDataRecord: Record<string, string> | undefined =
    useMemo(() => {
      return uiGameData.playerStateData
        .find((p) => p.player === player._id)
        ?.gameStateData.reduce((acc, cur) => {
          acc[cur.key] = cur.value;
          return acc;
        }, {} as Record<string, string>);
    }, [uiGameData.playerStateData, player._id]);
  const globalGameStateDataRecord: Record<string, string> | undefined =
    useMemo(() => {
      return uiGameData.globalStateData.gameStateData.reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {} as Record<string, string>);
    }, [uiGameData.globalStateData.gameStateData]);
  const [understandsTicketPrices, setUnderstandsTicketPrices] =
    React.useState(false);
  const [understandsSellThroughRates, setUnderstandsSellThroughRates] =
    React.useState(false);
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
    const curPlayerStateData = uiGameData.playerStateData.find(
      (p) => p.player === player._id
    );
    const globalGameStateData = uiGameData.globalStateData.gameStateData;
    !understandsTicketPrices &&
      setUnderstandsTicketPrices(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_TICKET_PRICES_KEY,
          'true'
        )
      );
    !understandsSellThroughRates &&
      setUnderstandsSellThroughRates(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_CONVERSION_RATE_KEY,
          'true'
        )
      );
    !understandsMultiplication &&
      setUnderstandsMultiplication(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_MULTIPLICATION_KEY,
          'true'
        )
      );
    !understandsAddition &&
      setUnderstandsAddition(
        checkGameAndPlayerStateForValue(
          globalGameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_ADDITION_KEY,
          'true'
        )
      );
  }, [
    uiGameData.globalStateData.gameStateData,
    playerGameStateDataRecord?.gameStateData || [],
  ]);

  React.useEffect(() => {
    if (width < 500 || height < 500) {
      zoomOut(1);
    } else {
      zoomIn(1);
    }
  }, [width, height]);

  function Variable(props: {
    dataKey: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isEnabled: (value: any) => boolean;
    value?: string;
    forceShow?: boolean;
    prefix?: string;
    backgroundColor?: string;
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
          backgroundColor: props.backgroundColor || '#301934',
        }}
      >
        <Typography className={classes.text}>{props.title}</Typography>
        <Typography className={classes.boxText} style={{ color: 'white' }}>
          {props.prefix || ''}
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
          backgroundColor: '#301934',
          borderColor: '#fff',
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
        backgroundImage: `url(${stageBg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <TransformComponent>
        <div className="column center-div">
          <Variable
            title="Total # of tickets to sell"
            dataKey=""
            isEnabled={() => true}
            value={String(TOTAL_NUMBER_OF_TICKETS)}
            forceShow={true}
          />
          <div className="row center-div">
            <Variable
              dataKey={UNDERSTANDS_TICKET_PRICES_KEY}
              isEnabled={() => understandsTicketPrices}
              title="Price per VIP ticket"
              prefix="$"
              value={String(VIP_TICKET_PRICE)}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: '#fff' }}
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
                      key: VIP_TICKET_PERCENT_KEY,
                      value: newValue,
                    },
                  ],
                  player._id
                );
              }}
              dataKey={VIP_TICKET_PERCENT_KEY}
              title="# of VIP tickets"
              myPlayerStateData={playerGameStateDataRecord || {}}
              shouldDisable={
                Boolean(editingVariable) &&
                editingVariable !== VIP_TICKET_PERCENT_KEY
              }
              setEditingVariable={setEditingVariable}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: '#fff' }}
                >
                  {' '}
                  x{' '}
                </Typography>
              }
            />
            <Variable
              dataKey={UNDERSTANDS_CONVERSION_RATE_KEY}
              isEnabled={() => understandsSellThroughRates}
              title="Conversion Rate"
              value={String(VIP_TICKET_CONVERSION_RATE)}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography className={classes.boxText} style={{ color: '#fff' }}>
                {' '}
                +{' '}
              </Typography>
            }
          />
          <div className="row center-div">
            <Variable
              isEnabled={() => understandsTicketPrices}
              dataKey={UNDERSTANDS_TICKET_PRICES_KEY}
              title="Price per reserved ticket"
              prefix="$"
              value={String(RESERVED_TICKET_PRICE)}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: '#fff' }}
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
                      key: RESERVED_TICKET_PERCENT_KEY,
                      value: newValue,
                    },
                  ],
                  player._id
                );
              }}
              dataKey={RESERVED_TICKET_PERCENT_KEY}
              title="# of Reserved tickets"
              myPlayerStateData={playerGameStateDataRecord || {}}
              shouldDisable={
                Boolean(editingVariable) &&
                editingVariable !== RESERVED_TICKET_PERCENT_KEY
              }
              setEditingVariable={setEditingVariable}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: '#fff' }}
                >
                  {' '}
                  x{' '}
                </Typography>
              }
            />
            <Variable
              isEnabled={() => understandsSellThroughRates}
              dataKey={UNDERSTANDS_CONVERSION_RATE_KEY}
              title="Conversion Rate"
              value={String(RESERVED_TICKET_CONVERSION_RATE)}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography className={classes.boxText} style={{ color: '#fff' }}>
                {' '}
                +{' '}
              </Typography>
            }
          />
          <div className="row center-div">
            <Variable
              dataKey={UNDERSTANDS_TICKET_PRICES_KEY}
              isEnabled={() => understandsTicketPrices}
              title="Price per GA ticket"
              prefix="$"
              value={String(GENERAL_ADMISSION_TICKET_PRICE)}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: '#fff' }}
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
                      key: GENERAL_ADMISSION_TICKET_PERCENT_KEY,
                      value: newValue,
                    },
                  ],
                  player._id
                );
              }}
              dataKey={GENERAL_ADMISSION_TICKET_PERCENT_KEY}
              title="# of GA tickets"
              myPlayerStateData={playerGameStateDataRecord || {}}
              shouldDisable={
                Boolean(editingVariable) &&
                editingVariable !== GENERAL_ADMISSION_TICKET_PERCENT_KEY
              }
              setEditingVariable={setEditingVariable}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: '#fff' }}
                >
                  {' '}
                  x{' '}
                </Typography>
              }
            />
            <Variable
              dataKey={UNDERSTANDS_CONVERSION_RATE_KEY}
              isEnabled={() => understandsSellThroughRates}
              title="Conversion Rate"
              value={String(GENERAL_ADMISSION_TICKET_CONVERSION_RATE)}
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
