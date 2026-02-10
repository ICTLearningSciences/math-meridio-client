/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { AbstractGameData } from '../../classes/abstract-game-data';
import { Game } from '../types';
import { SimulationScene } from './SimulationScene';

import {
  DiscussionStage,
  IStage,
  SimulationStage,
} from '../../components/discussion-stage-builder/types';
import { DiscussionStageHandler } from '../../classes/discussion-stage-handler';

import { ProblemComponent } from './problem';
import { SolutionComponent } from './solution';
import { PlayerStrategy, SimulationComponent } from './simulation';
import { ResultComponent } from './results';
import {
  GameData,
  GameStateData,
  PlayerStateData,
} from '../../store/slices/game';
import { SIMULTAION_VIEWED_KEY } from '../../helpers';
import { CurrentStage } from '../../types';
import { Player } from '../../store/slices/player/types';

const introductionDiscussionStage = '2f9c8097-74b1-40ff-9199-36431b6095b9';
const collectStrategyDiscussionStage = 'b5bf0160-a586-49e5-86e4-eb00a375000b';
const understandingEquationDiscussionStage =
  'b32ba455-11c3-4ec8-8821-61f435abd923';
const selectStrategyDiscussionStage = '7bf234eb-d864-40ed-8d24-3b5ff84a3991';
const determineBestStrategyDiscussionStage =
  '2db20f92-8e48-4f2a-a23c-af94c9e7ee22';
const finishedDiscussionStage = '4269f917-e942-4138-8245-3f13f243c07f';

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

export class TestBaseHandler extends AbstractGameData {
  stageList: CurrentStage<IStage>[] = [];
  constructor(discussionStages: DiscussionStage[]) {
    super();
    const introDiscussionStage = discussionStages.find(
      (s) => s.clientId === introductionDiscussionStage
    );
    const collectStrategyStage = discussionStages.find(
      (s) => s.clientId === collectStrategyDiscussionStage
    );
    const understandingEquationStage = discussionStages.find(
      (s) => s.clientId === understandingEquationDiscussionStage
    );
    const selectStrategyStage = discussionStages.find(
      (s) => s.clientId === selectStrategyDiscussionStage
    );
    const determineBestStrategyStage = discussionStages.find(
      (s) => s.clientId === determineBestStrategyDiscussionStage
    );
    const finishedStage = discussionStages.find(
      (s) => s.clientId === finishedDiscussionStage
    );

    if (
      !introDiscussionStage ||
      !collectStrategyStage ||
      !understandingEquationStage ||
      !selectStrategyStage ||
      !determineBestStrategyStage ||
      !finishedStage
    ) {
      throw new Error('missing stage');
    }

    const simulationStage = {
      _id: 'wait-for-simulation',
      clientId: 'wait-for-simulation',
      stageType: 'simulation',
    } as SimulationStage;

    const stageList: CurrentStage<IStage>[] = [
      {
        id: 'intro-discussion',
        stage: introDiscussionStage,
        getNextStage: () => {
          return collectStrategyStage;
        },
      },
      {
        id: 'collect-strategy',
        stage: collectStrategyStage,
        getNextStage: () => {
          return understandingEquationStage;
        },
      },
      {
        id: 'understanding-equation',
        stage: understandingEquationStage,
        getNextStage: () => {
          return selectStrategyStage;
        },
      },
      {
        id: 'select-strategy',
        stage: selectStrategyStage,
        getNextStage: () => {
          return simulationStage;
        },
      },
      {
        id: 'wait-for-simulation',
        stage: {
          _id: 'wait-for-simulation',
          clientId: 'wait-for-simulation',
          stageType: 'simulation',
        } as SimulationStage,
        getNextStage: () => {
          return determineBestStrategyStage;
        },
      },
      {
        id: 'determine-best-strategy',
        stage: determineBestStrategyStage,
        getNextStage: () => {
          return finishedStage;
        },
      },
      {
        id: 'finished',
        stage: finishedStage,
        getNextStage: () => {
          return finishedStage;
        },
      },
    ];
    this.stageList = stageList;
  }
}

const BaseTestGame: Game = {
  id: 'test-base',
  name: 'Test Base: Concert Ticket Management',
  problem: `Our concert venue isn't meeting its profit goals, and we need your help to fix it. You and the sales team must figure out what's wrong with our current ticket strategy and how to adjust it to maximize revenue. For each show, we can sell 100 tickets. VIP tickets earn the most but are hardest to sell, while Reserved and General Admission earn less but sell more easily.`,
  persistTruthGlobalStateData: [
    UNDERSTANDS_ALGORITHM_KEY,
    UNDERSTANDS_MULTIPLICATION_KEY,
    UNDERSTANDS_ADDITION_KEY,
    UNDERSTANDS_CONVERSION_RATE_KEY,
    UNDERSTANDS_TICKET_PRICES_KEY,
    BEST_STRATEGY_FOUND_KEY,
  ],
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
  showPlayerStrategy: (player: Player, playerStateData: PlayerStateData) => {
    return <PlayerStrategy player={player} playerStateData={playerStateData} />;
  },
  showSimulation: (game: Game) => {
    return <SimulationComponent game={game} />;
  },
  showResult: (uiGameData: GameData) => {
    return <ResultComponent uiGameData={uiGameData} />;
  },
  createController: (discussionStages: DiscussionStage[]) => {
    return new TestBaseHandler(discussionStages);
  },
};

export default BaseTestGame;
