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
import { SolutionSpace } from './SolutionSpace';
import { SimulationScene } from './SimulationScene';

import shotChart from './shot-chart.png';
import { OverlayBox } from '../../components/overlay-box';
import { QuestionMark } from '@mui/icons-material';
import { GameStateData } from '../../store/slices/game';
import {
  DiscussionStage,
  DiscussionStageStep,
  isDiscussionStage,
  IStage,
  StageBuilderStep,
} from '../../components/discussion-stage-builder/types';
import {
  convertCollectedDataToGSData,
  getStepFromFlowList,
} from '../../components/discussion-stage-builder/helpers';
import { DiscussionStageHandler } from '../../classes/discussion-stage-handler';

import { ProblemComponent } from './problem';
import { SolutionComponent } from './solution';
import { SimulationComponent } from './simulation';
import { ResultComponent } from './results';

const introductionDiscussionStage = 'de0b94b9-1fc2-4ea1-995e-21a75670c16d';
const collectVariablesDiscussionStage = '86587083-9279-4c27-8470-836f992670fc';
const explainConceptsDiscussionStage = '909a0d5a-345d-4f6e-8d9c-2e7f6cfa4714';
const keyConceptsConvoDiscussionStage = '5421ef02-3cca-4281-a832-69ce040ed848';
const selectStrategyDiscussionStage = '3095c6cd-d377-4660-aa4d-e79409592210';
const discussNewStrategyDiscussionStage =
  '9265f1ef-2a2e-4a14-b98f-5bbf6fd879d8';

interface CurrentStage {
  id: string;
  stage?: DiscussionStage;
  action?: () => void;
  active: (stateData: GameStateData[]) => boolean;
  onDiscussionFinished: (collectedData: CollectedDiscussionData) => void;
}

export class BasketballStateHandler extends GameStateHandler {
  currentStage: IStage | undefined;
  currentStageId: string | undefined;
  currentStepId: string | undefined;
  discussionStageHandler: DiscussionStageHandler;

  discussionStages: CurrentStage[] = [];

  constructor(args: GameStateHandlerArgs) {
    super({ ...args, defaultStageId: 'de0b94b9-1fc2-4ea1-995e-21a75670c16d' });
    this.currentStage =
      args.stages?.find((s) => s.clientId === args.defaultStageId) ||
      args.stages?.find((s) => s.clientId === introductionDiscussionStage);
    const currentStageId =
      args.gameData.globalStateData.curStageId ||
      args.defaultStageId ||
      introductionDiscussionStage;
    this.currentStage = args.stages?.find((s) => s.clientId === currentStageId);
    this.currentStepId = args.gameData.globalStateData.curStepId;
    this.currentStageId = 'intro-discussion';

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
    if (
      !introDiscussionStage ||
      !collectVariablesStage ||
      !explainConceptsStage ||
      !keyConceptsConvoStage ||
      !selectStrategyStage ||
      !discussNewStrategyStage
    ) {
      throw new Error('missing stage');
    }

    const stageList: CurrentStage[] = [
      {
        id: 'intro-discussion',
        stage: introDiscussionStage,
        active: () => true,
        onDiscussionFinished: () => {
          this.currentStage = collectVariablesStage;
          this.handleCurrentStage();
        },
      },
      {
        id: 'collect-variables',
        stage: collectVariablesStage,
        active: () => true,
        onDiscussionFinished: () => {
          this.currentStage = explainConceptsStage;
          this.handleCurrentStage();
        },
      },
      {
        id: 'explain-concepts',
        stage: explainConceptsStage,
        active: () => true,
        onDiscussionFinished: (data) => {
          if (data['understands_algorithm'] !== 'true') {
            this.currentStage = keyConceptsConvoStage;
            this.handleCurrentStage();
          } else {
            this.currentStage = selectStrategyStage;
            this.handleCurrentStage();
          }
        },
      },
      {
        id: 'key-concepts-convo',
        stage: keyConceptsConvoStage,
        active: () => true,
        onDiscussionFinished: (data) => {
          if (data['understands_algorithm'] !== 'true') {
            this.currentStage = keyConceptsConvoStage;
            this.handleCurrentStage();
          } else {
            this.currentStage = selectStrategyStage;
            this.handleCurrentStage();
          }
        },
      },
      {
        id: 'select-strategy',
        stage: selectStrategyStage,
        active: () => true,
        onDiscussionFinished: () => {
          console.log(
            'TODO: go to action stage that checks if the user has viewed a simulation yet'
          );
        },
      },
      {
        id: 'discuss-new-strategy',
        stage: discussNewStrategyStage,
        active: () => true,
        onDiscussionFinished: () => {
          console.log('done');
        },
      },
    ];
    this.discussionStages = stageList;
  }

  handleCurrentStage() {
    if (!this.currentStage) {
      return;
    }
    if (isDiscussionStage(this.currentStage)) {
      const stage = this.discussionStages.find(
        (s) => s.stage?.clientId === this.currentStage?.clientId
      );
      if (!stage) {
        throw new Error('missing stage');
      }
      this.discussionStageHandler.setCurrentDiscussion(stage.stage);
      this.discussionStageHandler.onDiscussionFinished =
        stage.onDiscussionFinished;
      this.discussionStageHandler.initializeActivity();
    } else {
      throw new Error(`unhandled stage type: ${this.currentStage.stageType}`);
    }
  }

  initializeGame() {
    if (!this.currentStage) {
      return;
    }
    this.handleCurrentStage();
  }

  async handleNewUserMessage(message: string) {
    // super.handleNewUserMessage(message);
    // todo (not hard-coded)
    const msg = message.toLowerCase();
    if (msg.includes('outside shot')) {
      const value = msg.includes('3') || msg.includes('three') ? 3 : undefined;
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per outside shot', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per outside shot', value: value }],
          },
        ],
      });
    }
    if (msg.includes('inside shot')) {
      const value = msg.includes('2') || msg.includes('two') ? 2 : undefined;
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per inside shot', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per inside shot', value: value }],
          },
        ],
      });
    }
    if (msg.includes('mid shot')) {
      const value = msg.includes('2') || msg.includes('two') ? 2 : undefined;
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per mid shot', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per mid shot', value: value }],
          },
        ],
      });
    }
  }
}

const BasketballGame: Game = {
  id: 'basketball',
  name: 'NBA Analyst',
  problem: `We need you and the analyst team to figure out why we're losing and what we need to change in our strategy to be winners! From what you're seeing right now, what do you think we're doing wrong?`,
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
