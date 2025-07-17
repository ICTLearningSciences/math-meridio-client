/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from 'react';
import { Card, Typography } from '@mui/material';
import { GameStateHandler } from '../../classes/game-state-handler';
import { PlayerStateData } from '../../store/slices/game';
import { makeStyles } from 'tss-react/mui';
import { Player } from '../../store/slices/player';
import { checkGameAndPlayerStateForValue } from '../../components/discussion-stage-builder/helpers';

import courtBg from './court.png';
import { EditableVariable } from '../../components/editable-variable';
import {
  VIP_TICKET_PERCENT_KEY,
  VIP_TICKET_PRICE,
  VIP_TICKET_SELL_THROUGH_RATE,
  RESERVED_TICKET_PERCENT_KEY,
  RESERVED_TICKET_PRICE,
  RESERVED_TICKET_SELL_THROUGH_RATE,
  GENERAL_ADMISSION_TICKET_PERCENT_KEY,
  GENERAL_ADMISSION_TICKET_PRICE,
  GENERAL_ADMISSION_TICKET_SELL_THROUGH_RATE,
  TOTAL_NUMBER_OF_TICKETS,
  UNDERSTANDS_ADDITION_KEY,
  UNDERSTANDS_MULTIPLICATION_KEY,
  UNDERSTANDS_TICKET_PRICES_KEY,
  UNDERSTANDS_SELL_THROUGH_RATES_KEY,
} from '.';

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

  const [understandsTicketPrices, setUnderstandsTicketPrices] =
    React.useState(false);
  const [understandsSellThroughRates, setUnderstandsSellThroughRates] =
    React.useState(false);
  const [understandsMultiplication, setUnderstandsMultiplication] =
    React.useState(false);
  const [understandsAddition, setUnderstandsAddition] = React.useState(false);
  const [editingVariable, setEditingVariable] = React.useState('');
  React.useEffect(() => {
    !understandsTicketPrices &&
      setUnderstandsTicketPrices(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_TICKET_PRICES_KEY,
          'true'
        )
      );
    !understandsSellThroughRates &&
      setUnderstandsSellThroughRates(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_SELL_THROUGH_RATES_KEY,
          'true'
        )
      );
    !understandsMultiplication &&
      setUnderstandsMultiplication(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_MULTIPLICATION_KEY,
          'true'
        )
      );
    !understandsAddition &&
      setUnderstandsAddition(
        checkGameAndPlayerStateForValue(
          controller.globalStateData.gameStateData,
          curPlayerStateData?.gameStateData || [],
          UNDERSTANDS_ADDITION_KEY,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isEnabled: (value: any) => boolean;
    value?: string;
    forceShow?: boolean;
    prefix?: string;
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
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
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
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <EditableVariable
          updatePlayerStateData={(newValue: number) => {
            controller.newPlayerStateData(
              [
                {
                  key: VIP_TICKET_PERCENT_KEY,
                  value: newValue,
                },
              ],
              controller.player.clientId
            );
          }}
          dataKey={VIP_TICKET_PERCENT_KEY}
          title="# of VIP tickets"
          myPlayerStateData={myPlayerStateData}
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
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <Variable
          dataKey={UNDERSTANDS_SELL_THROUGH_RATES_KEY}
          isEnabled={() => understandsSellThroughRates}
          title="% chance of selling tickets"
          value={String(VIP_TICKET_SELL_THROUGH_RATE)}
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
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <EditableVariable
          updatePlayerStateData={(newValue: number) => {
            controller.newPlayerStateData(
              [
                {
                  key: RESERVED_TICKET_PERCENT_KEY,
                  value: newValue,
                },
              ],
              controller.player.clientId
            );
          }}
          dataKey={RESERVED_TICKET_PERCENT_KEY}
          title="# of Reserved tickets"
          myPlayerStateData={myPlayerStateData}
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
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <Variable
          isEnabled={() => understandsSellThroughRates}
          dataKey={UNDERSTANDS_SELL_THROUGH_RATES_KEY}
          title="% chance of selling tickets"
          value={String(RESERVED_TICKET_SELL_THROUGH_RATE)}
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
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <EditableVariable
          updatePlayerStateData={(newValue: number) => {
            controller.newPlayerStateData(
              [
                {
                  key: GENERAL_ADMISSION_TICKET_PERCENT_KEY,
                  value: newValue,
                },
              ],
              controller.player.clientId
            );
          }}
          dataKey={GENERAL_ADMISSION_TICKET_PERCENT_KEY}
          title="# of GA tickets"
          myPlayerStateData={myPlayerStateData}
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
              style={{ color: '#C96049' }}
            >
              {' '}
              x{' '}
            </Typography>
          }
        />
        <Variable
          dataKey={UNDERSTANDS_SELL_THROUGH_RATES_KEY}
          isEnabled={() => understandsSellThroughRates}
          title="% chance of selling tickets"
          value={String(GENERAL_ADMISSION_TICKET_SELL_THROUGH_RATE)}
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
