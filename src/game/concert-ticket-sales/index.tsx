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
import { SimulationComponent } from './simulation';
import { ResultComponent } from './results';
import { PlayerStateData } from '../../store/slices/game';
import { SIMULTAION_VIEWED_KEY } from '../../helpers';

const introductionDiscussionStage = '64de5488-c851-41b3-8347-18ffa340c753';
const collectVariablesDiscussionStage = 'e20e0247-03a2-485f-b0be-b12ceb2af8b9';
const explainConceptsDiscussionStage = '0d8f3055-373f-4726-9392-b3fd1dac8385';
const keyConceptsConvoDiscussionStage = '821ea615-c727-4d3d-bd35-30f0ba3866a9';
const selectStrategyDiscussionStage = 'f289f022-3fa7-42a1-9d3d-0642c3015867';
const discussNewStrategyDiscussionStage =
  '80419d6d-1eca-491e-a648-8db3db951c02';
const discussBestStrategyDiscussionStage =
  '6edb8b9f-8752-49a7-9327-acb2c80eebb9';
const finishedDiscussionStage = 'd1323982-4f52-491e-b5e0-dbc70250e52b';

export const UNDERSTANDS_ALGORITHM_KEY = 'understands_algorithm';
export const UNDERSTANDS_MULTIPLICATION_KEY = 'understands_multiplication';
export const UNDERSTANDS_ADDITION_KEY = 'understands_addition';
export const UNDERSTANDS_SELL_THROUGH_RATES_KEY =
  'understands_sell_through_rates';
export const UNDERSTANDS_TICKET_PRICES_KEY = 'understands_ticket_prices';
export const BEST_STRATEGY_FOUND_KEY = 'best_strategy_found';

export const VIP_TICKET_PERCENT_KEY = 'vip_ticket_percent';
export const VIP_TICKET_PRICE = 2;
export const VIP_TICKET_SELL_THROUGH_RATE = 0.5;

export const RESERVED_TICKET_PERCENT_KEY = 'reserved_ticket_percent';
export const RESERVED_TICKET_PRICE = 2;
export const RESERVED_TICKET_SELL_THROUGH_RATE = 0.4;

export const GENERAL_ADMISSION_TICKET_PERCENT_KEY =
  'general_admission_ticket_percent';
export const GENERAL_ADMISSION_TICKET_PRICE = 3;
export const GENERAL_ADMISSION_TICKET_SELL_THROUGH_RATE = 0.36;

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
      this.player.clientId,
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
    const collectVariablesStage = this.dbDiscussionStages.find(
      (s) => s.clientId === collectVariablesDiscussionStage
    );
    const explainConceptsStage = this.dbDiscussionStages.find(
      (s) => s.clientId === explainConceptsDiscussionStage
    );
    const keyConceptsConvoStage = this.dbDiscussionStages.find(
      (s) => s.clientId === keyConceptsConvoDiscussionStage
    );
    const selectStrategyStage = this.dbDiscussionStages.find(
      (s) => s.clientId === selectStrategyDiscussionStage
    );
    const discussNewStrategyStage = this.dbDiscussionStages.find(
      (s) => s.clientId === discussNewStrategyDiscussionStage
    );
    const discussBestStrategyStage = this.dbDiscussionStages.find(
      (s) => s.clientId === discussBestStrategyDiscussionStage
    );
    const finishedStage = this.dbDiscussionStages.find(
      (s) => s.clientId === finishedDiscussionStage
    );

    if (
      !introDiscussionStage ||
      !collectVariablesStage ||
      !explainConceptsStage ||
      !keyConceptsConvoStage ||
      !selectStrategyStage ||
      !discussNewStrategyStage ||
      !discussBestStrategyStage ||
      !finishedStage
    ) {
      throw new Error('missing stage');
    }

    const stageList: CurrentStage<IStage>[] = [
      {
        id: 'intro-discussion',
        stage: introDiscussionStage,
        onStageFinished: () => {
          this.updateStageByStageListId('collect-variables');
        },
      },
      {
        id: 'collect-variables',
        stage: collectVariablesStage,
        onStageFinished: () => {
          this.updateStageByStageListId('explain-concepts');
        },
      },
      {
        id: 'explain-concepts',
        stage: explainConceptsStage,
        onStageFinished: (data) => {
          if (data[UNDERSTANDS_ALGORITHM_KEY] !== 'true') {
            this.updateStageByStageListId('key-concepts-convo');
          } else {
            this.updateStageByStageListId('select-strategy');
          }
        },
      },
      {
        id: 'key-concepts-convo',
        stage: keyConceptsConvoStage,
        beforeStart: () => {
          this.discussionStageHandler.exitEarlyCondition = (
            data: CollectedDiscussionData
          ) => {
            return data[UNDERSTANDS_ALGORITHM_KEY] === 'true';
          };
        },
        onStageFinished: (data) => {
          this.discussionStageHandler.exitEarlyCondition = undefined;
          if (data[UNDERSTANDS_ALGORITHM_KEY] !== 'true') {
            this.updateStageByStageListId('key-concepts-convo');
          } else {
            this.updateStageByStageListId('select-strategy');
          }
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
          this.updateStageByStageListId('discuss-new-strategy');
        },
      },
      {
        id: 'discuss-new-strategy',
        stage: discussNewStrategyStage,
        onStageFinished: (data) => {
          if (data[BEST_STRATEGY_FOUND_KEY] === 'false') {
            this.updateStageByStageListId('discuss-best-strategy');
          } else {
            this.updateStageByStageListId('finished');
          }
        },
      },
      {
        id: 'discuss-best-strategy',
        stage: discussBestStrategyStage,
        onStageFinished: (data) => {
          if (data[BEST_STRATEGY_FOUND_KEY] === 'false') {
            this.updateStageByStageListId('discuss-best-strategy');
          } else {
            this.updateStageByStageListId('finished');
          }
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
  problem: `We need you and the analyst team to figure out why we're not hitting our profit goals and what we need to change in our ticket sales strategy to become a top-selling venue! From what you're seeing right now, what do you think we're doing wrong? Out of 100 tickets, how many should be VIP, Reserved, or General Admission? VIP tickets bring in more money per sale but are harder to sell, while Reserved and General Admission have different price points and chances of selling.`,
  persistTruthGlobalStateData: [
    UNDERSTANDS_ALGORITHM_KEY,
    UNDERSTANDS_MULTIPLICATION_KEY,
    UNDERSTANDS_ADDITION_KEY,
    UNDERSTANDS_SELL_THROUGH_RATES_KEY,
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
  showResult: (controller: GameStateHandler) => {
    return <ResultComponent controller={controller} />;
  },
  createController: (args: GameStateHandlerArgs) =>
    new BasketballStateHandler(args),
};

export default BasketballGame;
