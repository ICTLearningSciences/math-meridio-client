/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';

import { GameStateHandler } from '../../classes/game-state-handler';
import { useWithPhaserGame } from '../../hooks/use-with-phaser-game';
import { PlayerStateData } from '../../store/slices/game';
import EventSystem from '../event-system';
import { Button, Typography } from '@mui/material';
import { ConcertTicketSalesSimulationData } from './SimulationScene';
import {
  VIP_TICKET_PERCENT_KEY,
  RESERVED_TICKET_PERCENT_KEY,
  GENERAL_ADMISSION_TICKET_PERCENT_KEY,
  TOTAL_NUMBER_OF_TICKETS,
  GENERAL_ADMISSION_TICKET_SELL_THROUGH_RATE,
  VIP_TICKET_SELL_THROUGH_RATE,
  RESERVED_TICKET_SELL_THROUGH_RATE,
  GENERAL_ADMISSION_TICKET_PRICE,
  VIP_TICKET_PRICE,
  RESERVED_TICKET_PRICE,
} from '.';

export function SimulationComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);
  const [simulation, setSimulation] = React.useState<PlayerStateData>();

  React.useEffect(() => {
    EventSystem.on('simulate', (sim: PlayerStateData) => setSimulation(sim));
  }, []);

  React.useEffect(() => {
    startPhaserGame(props.controller.game, props.controller, 'Simulation');
  }, [props.controller]);

  function PlayerStrategy(props: { data: PlayerStateData }): JSX.Element {
    const psd = props.data;
    const player = controller.players.find((p) => p.clientId === psd.player);
    const vipTicketsUpForSale =
      psd.gameStateData.find((d) => d.key === VIP_TICKET_PERCENT_KEY)?.value ||
      0;
    const reservedTicketsUpForSale =
      psd.gameStateData.find((d) => d.key === RESERVED_TICKET_PERCENT_KEY)
        ?.value || 0;
    const generalAdmissionTicketsUpForSale =
      psd.gameStateData.find(
        (d) => d.key === GENERAL_ADMISSION_TICKET_PERCENT_KEY
      )?.value || 0;

    const canSimulate = Boolean(
      parseInt(vipTicketsUpForSale) +
        parseInt(reservedTicketsUpForSale) +
        parseInt(generalAdmissionTicketsUpForSale) ===
        TOTAL_NUMBER_OF_TICKETS
    );

    function simulate(): void {
      const simData: ConcertTicketSalesSimulationData = {
        player: psd.player,
        generalAdmissionTicketsUpForSale: generalAdmissionTicketsUpForSale,
        generalAdmissionTicketsSold: Math.round(
          generalAdmissionTicketsUpForSale *
            GENERAL_ADMISSION_TICKET_SELL_THROUGH_RATE
        ),
        reservedTicketsUpForSale: reservedTicketsUpForSale,
        reservedTicketsSold: Math.round(
          reservedTicketsUpForSale * RESERVED_TICKET_SELL_THROUGH_RATE
        ),
        vipTicketsUpForSale: vipTicketsUpForSale,
        vipTicketsSold: Math.round(
          vipTicketsUpForSale * VIP_TICKET_SELL_THROUGH_RATE
        ),
        totalProfit: 0,
      };
      simData.totalProfit =
        simData.generalAdmissionTicketsSold * GENERAL_ADMISSION_TICKET_PRICE +
        simData.vipTicketsSold * VIP_TICKET_PRICE +
        simData.reservedTicketsSold * RESERVED_TICKET_PRICE;
      EventSystem.emit('simulate', simData);
    }

    return (
      <Button
        variant="contained"
        color={psd.player === simulation?.player ? 'secondary' : 'primary'}
        style={{
          textTransform: 'none',
          flexDirection: 'column',
        }}
        disabled={!canSimulate}
        onClick={simulate}
      >
        <Typography style={{ fontWeight: 'bold' }}>
          {player?.name}&apos;s strategy:
        </Typography>
        <Typography
        // style={{ display: insideShots ? '' : 'none' }}
        >
          {vipTicketsUpForSale} vip, {reservedTicketsUpForSale} reserved,{' '}
          {generalAdmissionTicketsUpForSale} general admission
        </Typography>
      </Button>
    );
  }

  return (
    <>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{ height: window.innerHeight / 2 - 150 }}
      />
      <div
        className="row center-div"
        style={{ width: '100%', justifyContent: 'space-evenly', marginTop: 5 }}
      >
        {controller.playerStateData.map((psd) => (
          <PlayerStrategy key={psd.player} data={psd} />
        ))}
      </div>
    </>
  );
}
