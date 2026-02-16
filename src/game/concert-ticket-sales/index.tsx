/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Game } from '../types';
import { SimulationScene } from './SimulationScene';

import { ProblemComponent } from './problem';
import { SolutionComponent } from './solution';
import { PlayerStrategy, SimulationComponent } from './simulation';
import { ResultComponent } from './results';
import {
  GameData,
  GameStateData,
  PlayerStateData,
} from '../../store/slices/game/types';
import { Player } from '../../store/slices/player/types';

export const UNDERSTANDS_ALGORITHM_KEY = 'understands_algorithm';
export const UNDERSTANDS_MULTIPLICATION_KEY = 'understands_multiplication';
export const UNDERSTANDS_ADDITION_KEY = 'understands_addition';
export const UNDERSTANDS_CONVERSION_RATE_KEY = 'understands_conversion_rate';
export const UNDERSTANDS_TICKET_PRICES_KEY = 'understands_ticket_prices';
export const BEST_STRATEGY_FOUND_KEY = 'best_strategy_found';

export const VIP_TICKET_PERCENT_KEY = 'vip_ticket_percent';
export const VIP_TICKET_PRICE = 75;
export const VIP_TICKET_CONVERSION_RATE = 0.36;

export const RESERVED_TICKET_PERCENT_KEY = 'reserved_ticket_percent';
export const RESERVED_TICKET_PRICE = 50;
export const RESERVED_TICKET_CONVERSION_RATE = 0.4;

export const GENERAL_ADMISSION_TICKET_PERCENT_KEY =
  'general_admission_ticket_percent';
export const GENERAL_ADMISSION_TICKET_PRICE = 45;
export const GENERAL_ADMISSION_TICKET_CONVERSION_RATE = 0.6;

export const TOTAL_NUMBER_OF_TICKETS = 100;

const ConcertTicketSalesGame: Game = {
  id: 'concert-ticket-sales',
  name: 'Concert Ticket Management',
  problem: `Our concert venue isn't meeting its profit goals, and we need your help to fix it. You and the sales team must figure out what's wrong with our current ticket strategy and how to adjust it to maximize revenue. For each show, we can sell 100 tickets. VIP tickets earn the most but are hardest to sell, while Reserved and General Admission earn less but sell more easily.`,
  config: {
    type: Phaser.CANVAS,
    backgroundColor: '#282c34',
    width: 1280,
    height: 720,
    scale: {
      // Fit to window
      mode: Phaser.Scale.FIT,
      // Center vertically and horizontally
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [SimulationScene],
  },
  showProblem: () => {
    return <ProblemComponent />;
  },
  showSolution: (
    uiGameData: GameData,
    player: Player,
    updatePlayerStateData: (
      newPlayerStateData: GameStateData[],
      playerId: string
    ) => void
  ) => {
    return (
      <SolutionComponent
        uiGameData={uiGameData}
        player={player}
        updatePlayerStateData={updatePlayerStateData}
      />
    );
  },
  showSimulation: (game: Game) => {
    return <SimulationComponent game={game} />;
  },
  showPlayerStrategy: (player: Player, playerStateData: PlayerStateData) => {
    return <PlayerStrategy player={player} playerStateData={playerStateData} />;
  },
  showResult: (uiGameData: GameData) => {
    return <ResultComponent uiGameData={uiGameData} />;
  },
};

export default ConcertTicketSalesGame;
