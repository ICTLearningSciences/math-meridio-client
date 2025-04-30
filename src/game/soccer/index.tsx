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
import SimulationScene from './SimulationScene';

import {
  DiscussionStage,
  isDiscussionStage,
  IStage,
  SimulationStage,
} from '../../components/discussion-stage-builder/types';
import { DiscussionStageHandler } from '../../classes/discussion-stage-handler';

import { ProblemComponent } from './problem';
import { SolutionComponent } from './solution';
import { SimulationComponent } from './simulation';
import { ResultComponent } from './results';

// test

// [Question] stage IDs for soccer?
const introductionDiscussionStage = 'de0b94b9-1fc2-4ea1-995e-21a75670c16d';
const collectVariablesDiscussionStage = '86587083-9279-4c27-8470-836f992670fc';
const explainConceptsDiscussionStage = '909a0d5a-345d-4f6e-8d9c-2e7f6cfa4714';
const keyConceptsConvoDiscussionStage = '5421ef02-3cca-4281-a832-69ce040ed848';
const selectStrategyDiscussionStage = '3095c6cd-d377-4660-aa4d-e79409592210';
const discussNewStrategyDiscussionStage =
  '9265f1ef-2a2e-4a14-b98f-5bbf6fd879d8';
const discussBestStrategyDiscussionStage =
  'e11d3273-e0e8-4b15-a5f0-3b80e5665e01';
const finishedDiscussionStage = 'bdf123b5-1fd1-4de9-bc4e-74a53623475a';

export interface CurrentStage {
  id: string;
  stage: IStage;
  action?: () => void;
  beforeStart?: () => void;
  onStageFinished: (collectedData: CollectedDiscussionData) => void;
}

export class SoccerStateHandler extends GameStateHandler {
  currentStage: CurrentStage | undefined;
  currentStageId: string | undefined;
  currentStepId: string | undefined;
  discussionStageHandler: DiscussionStageHandler;

  stageList: CurrentStage[] = [];

  constructor(args: GameStateHandlerArgs) {
    super({ ...args, defaultStageId: 'de0b94b9-1fc2-4ea1-995e-21a75670c16d' }); // [Question] stage ID for soccer?

    this.discussionStageHandler = new DiscussionStageHandler(
      args.sendMessage,
      args.setResponsePending,
      args.executePrompt,
      undefined,
      undefined,
      this.newPlayerStateData.bind(this)
    );

    this.initializeGame = this.initializeGame.bind(this);
    this.handleCurrentStage = this.handleCurrentStage.bind(this);
    this.simulationEnded = this.simulationEnded.bind(this);

    const introDiscussionStage = this.stages.find(
      (s) => s.clientId === introductionDiscussionStage
    );
    const collectVariablesStage = this.stages.find(
      (s) => s.clientId === collectVariablesDiscussionStage
    );
    const explainConceptsStage = this.stages.find(
      (s) => s.clientId === explainConceptsDiscussionStage
    );
    const keyConceptsConvoStage = this.stages.find(
      (s) => s.clientId === keyConceptsConvoDiscussionStage
    );
    const selectStrategyStage = this.stages.find(
      (s) => s.clientId === selectStrategyDiscussionStage
    );
    const discussNewStrategyStage = this.stages.find(
      (s) => s.clientId === discussNewStrategyDiscussionStage
    );
    const discussBestStrategyStage = this.stages.find(
      (s) => s.clientId === discussBestStrategyDiscussionStage
    );
    const finishedStage = this.stages.find(
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

    const stageList: CurrentStage[] = [
      {
        id: 'intro-discussion',
        stage: introDiscussionStage,
        onStageFinished: () => {
          this.currentStage = this.stageList.find(
            (s) => s.id === 'collect-variables'
          );
          this.handleCurrentStage();
        },
      },
      {
        id: 'collect-variables',
        stage: collectVariablesStage,
        onStageFinished: () => {
          this.currentStage = this.stageList.find(
            (s) => s.id === 'explain-concepts'
          );
          this.handleCurrentStage();
        },
      },
      {
        id: 'explain-concepts',
        stage: explainConceptsStage,
        onStageFinished: (data) => {
          if (data['understands_algorithm'] !== 'true') {
            this.currentStage = this.stageList.find(
              (s) => s.id === 'key-concepts-convo'
            );
            this.handleCurrentStage();
          } else {
            this.currentStage = this.stageList.find(
              (s) => s.id === 'select-strategy'
            );
            this.handleCurrentStage();
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
            return data['understands_algorithm'] === 'true';
          };
        },
        onStageFinished: (data) => {
          this.discussionStageHandler.exitEarlyCondition = undefined;
          if (data['understands_algorithm'] !== 'true') {
            this.currentStage = this.stageList.find(
              (s) => s.id === 'key-concepts-convo'
            );
            this.handleCurrentStage();
          } else {
            this.currentStage = this.stageList.find(
              (s) => s.id === 'select-strategy'
            );
            this.handleCurrentStage();
          }
        },
      },
      {
        id: 'select-strategy',
        stage: selectStrategyStage,
        onStageFinished: () => {
          this.currentStage = this.stageList.find(
            (s) => s.id === 'wait-for-simulation'
          );
          this.handleCurrentStage();
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
          this.currentStage = this.stageList.find(
            (s) => s.id === 'discuss-new-strategy'
          );
          this.handleCurrentStage();
        },
      },
      {
        id: 'discuss-new-strategy',
        stage: discussNewStrategyStage,
        onStageFinished: (data) => {
          if (data['best_strategy_found'] === 'false') {
            this.currentStage = this.stageList.find(
              (s) => s.id === 'discuss-best-strategy'
            );
            this.handleCurrentStage();
          } else {
            this.currentStage = this.stageList.find((s) => s.id === 'finished');
            this.handleCurrentStage();
          }
        },
      },
      {
        id: 'discuss-best-strategy',
        stage: discussBestStrategyStage,
        onStageFinished: (data) => {
          if (data['best_strategy_found'] === 'false') {
            this.currentStage = this.stageList.find(
              (s) => s.id === 'discuss-best-strategy'
            );
            this.handleCurrentStage();
          } else {
            this.currentStage = this.stageList.find((s) => s.id === 'finished');
            this.handleCurrentStage();
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
    this.currentStage = this.stageList[0];
  }

  handleCurrentStage() {
    if (!this.currentStage) {
      return;
    }
    if (isDiscussionStage(this.currentStage.stage)) {
      const stage = this.stageList.find(
        (s) => s.stage?.clientId === this.currentStage?.stage.clientId
      );
      if (!stage) {
        throw new Error('missing stage');
      }
      this.discussionStageHandler.setCurrentDiscussion(
        stage.stage as DiscussionStage
      );
      this.discussionStageHandler.onDiscussionFinished = stage.onStageFinished;
      if (stage.beforeStart) {
        stage.beforeStart();
      }
      this.discussionStageHandler.initializeActivity();
    } else if (this.currentStage.stage.stageType === 'simulation') {
      // wait for simulation to end
    } else {
      throw new Error(
        `unhandled stage type: ${this.currentStage.stage.stageType}`
      );
    }
  }

  initializeGame() {
    if (!this.currentStage) {
      return;
    }
    this.handleCurrentStage();
  }

  simulationEnded(): void {
    if (this.currentStage?.stage.stageType === 'simulation') {
      const stage = this.stageList.find(
        (s) => s.stage?.clientId === this.currentStage?.stage.clientId
      );
      if (!stage) {
        throw new Error('missing stage');
      }
      stage.onStageFinished({});
    }
  }

  async handleNewUserMessage(message: string) {
    const msg = message.toLowerCase();
    if (msg.includes('free kick')) {
      const value = 1; // 1 point per goal in soccer
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per free kick', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per free kick', value: value }],
          },
        ],
      });
    }
    if (msg.includes('penalty kick')) {
      const value = 1; // 1 point per goal in soccer
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per penalty kick', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per penalty kick', value: value }],
          },
        ],
      });
    }
    if (msg.includes('open play shot')) {
      const value = 1; // 1 point per goal in soccer
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per open play shot', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per open play shot', value: value }],
          },
        ],
      });
    }
  }
}

const SoccerGame: Game = {
  id: 'soccer',
  name: 'Soccer Analyst',
  problem: `Soccer is all about strategy—where and how you shoot matters! 
  Analyze shot selection and improve your decision-making to maximize scoring. 
  Geometry: What are the best angles for free kicks? How does shot placement affect accuracy?  
  Empirical Probabilities: How likely is a penalty kick to score? Learn from data-driven insights, including shot success rates, variance, and quartiles.  
  COMING SOON! 🚀`,
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
    new SoccerStateHandler(args),
};

export default SoccerGame;
