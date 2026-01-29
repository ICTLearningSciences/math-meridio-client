/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  CollectedDiscussionData,
  GameStateHandler,
  GameStateHandlerArgs,
} from '../../classes/game-state-handler';
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
import { PlayerStateData } from '../../store/slices/game';
import { SIMULTAION_VIEWED_KEY } from '../../helpers';

const introductionDiscussionStage = '64de5488-c851-41b3-8347-18ffa340c753';
const collectStrategyDiscussionStage = 'e20e0247-03a2-485f-b0be-b12ceb2af8b9';
const understandingEquationDiscussionStage =
  '0d8f3055-373f-4726-9392-b3fd1dac8385';
const selectStrategyDiscussionStage = 'f289f022-3fa7-42a1-9d3d-0642c3015867';
const determineBestStrategyDiscussionStage =
  '80419d6d-1eca-491e-a648-8db3db951c02';
const finishedDiscussionStage = 'd1323982-4f52-491e-b5e0-dbc70250e52b';

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

export interface CurrentStage<T extends IStage> {
  id: string;
  stage: T;
  action?: () => void;
  beforeStart?: () => void;
  onStageFinished: (collectedData: CollectedDiscussionData) => void;
}

export type DiscussionCurrentStage = CurrentStage<DiscussionStage>;

export class BasketballStateHandler extends GameStateHandler {
  currentStage: CurrentStage<IStage> | undefined;
  discussionStageHandler: DiscussionStageHandler;

  constructor(args: GameStateHandlerArgs) {
    super({ ...args, defaultStageId: 'de0b94b9-1fc2-4ea1-995e-21a75670c16d' });
    this.discussionStageHandler = new DiscussionStageHandler(
      this.player._id,
      this.globalStateData,
      args.sendMessage,
      args.setResponsePending,
      args.executePrompt,
      this.updateRoomStageStepId.bind(this),
      args.targetAiServiceModel,
      undefined,
      this.newPlayerStateData.bind(this),
      undefined
    );

    this.initializeGame = this.initializeGame.bind(this);
    this.simulationEnded = this.simulationEnded.bind(this);

    const introDiscussionStage = this.dbDiscussionStages.find(
      (s) => s.clientId === introductionDiscussionStage
    );
    const collectStrategyStage = this.dbDiscussionStages.find(
      (s) => s.clientId === collectStrategyDiscussionStage
    );
    const understandingEquationStage = this.dbDiscussionStages.find(
      (s) => s.clientId === understandingEquationDiscussionStage
    );
    const selectStrategyStage = this.dbDiscussionStages.find(
      (s) => s.clientId === selectStrategyDiscussionStage
    );
    const determineBestStrategyStage = this.dbDiscussionStages.find(
      (s) => s.clientId === determineBestStrategyDiscussionStage
    );
    const finishedStage = this.dbDiscussionStages.find(
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

    const stageList: CurrentStage<IStage>[] = [
      {
        id: 'intro-discussion',
        stage: introDiscussionStage,
        onStageFinished: () => {
          this.updateStageByStageListId('collect-strategy');
        },
      },
      {
        id: 'collect-strategy',
        stage: collectStrategyStage,
        onStageFinished: () => {
          this.updateStageByStageListId('understanding-equation');
        },
      },
      {
        id: 'understanding-equation',
        stage: understandingEquationStage,
        onStageFinished: () => {
          this.updateStageByStageListId('select-strategy');
        },
      },
      {
        id: 'select-strategy',
        stage: selectStrategyStage,
        onStageFinished: () => {
          this.updateStageByStageListId('wait-for-simulation');
        },
      },
      {
        id: 'wait-for-simulation',
        stage: {
          _id: 'wait-for-simulation',
          clientId: 'wait-for-simulation',
          stageType: 'simulation',
        } as SimulationStage,
        onStageFinished: () => {
          this.updateStageByStageListId('determine-best-strategy');
        },
      },
      {
        id: 'determine-best-strategy',
        stage: determineBestStrategyStage,
        onStageFinished: () => {
          this.updateStageByStageListId('finished');
        },
      },
      {
        id: 'finished',
        stage: finishedStage,
        onStageFinished: () => {
          // nothing
        },
      },
    ];
    this.stageList = stageList;
  }

  playerStateUpdated(newGameState: PlayerStateData[]): void {
    super.playerStateUpdated(newGameState);
    const curStage = this.getCurrentStage();
    const anyPlayerViewedSimulation = newGameState.find((p) =>
      p.gameStateData.find((g) => g.key === SIMULTAION_VIEWED_KEY)
    );
    if (
      curStage?.stage.stageType === 'simulation' &&
      anyPlayerViewedSimulation
    ) {
      this.simulationEnded();
    }
  }

  simulationEnded(): void {
    super.simulationEnded();
    const curStage = this.getCurrentStage();
    if (curStage?.stage.stageType === 'simulation') {
      const stage = this.stageList.find(
        (s) => s.stage?.clientId === curStage?.stage.clientId
      );
      if (!stage) {
        throw new Error('missing stage');
      }
      stage.onStageFinished({});
    }
  }
}

const BasketballGame: Game = {
  id: 'concert-ticket-sales',
  name: 'Concert Ticket Management',
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
  showProblem: (controller: GameStateHandler) => {
    return <ProblemComponent controller={controller} />;
  },
  showSolution: (controller: GameStateHandler) => {
    return <SolutionComponent controller={controller} />;
  },
  showSimulation: (controller: GameStateHandler) => {
    return <SimulationComponent controller={controller} />;
  },
  showPlayerStrategy: (data: PlayerStateData, controller: GameStateHandler) => {
    return <PlayerStrategy data={data} controller={controller} />;
  },
  showResult: (controller: GameStateHandler) => {
    return <ResultComponent controller={controller} />;
  },
  createController: (args: GameStateHandlerArgs) =>
    new BasketballStateHandler(args),
};

export default BasketballGame;
