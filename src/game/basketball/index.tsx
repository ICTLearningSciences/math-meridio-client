/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
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
import { getStepFromFlowList } from '../../components/discussion-stage-builder/helpers';
import { DiscussionStageHandler } from '../../classes/discussion-stage-handler';

import { ProblemComponent } from './problem';
import { SolutionComponent } from './solution';
import { SimulationComponent } from './simulation';
import { ResultComponent } from './results';

const introductionDiscussionStage = 'de0b94b9-1fc2-4ea1-995e-21a75670c16d';
const collectVariablesDiscussionStage = '86587083-9279-4c27-8470-836f992670fc';

export class BasketballStateHandler extends GameStateHandler {
  // note: was previously a DiscussionStage
  currentStage: IStage | undefined;
  currentStep: StageBuilderStep | undefined; // Note: this only applies to the discussion builder
  discussionStageHandler: DiscussionStageHandler;

  // todo
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
    this.stages;
    const currentStepId = args.gameData.globalStateData.curStepId;
    this.currentStep =
      this.currentStage && isDiscussionStage(this.currentStage)
        ? getStepFromFlowList(currentStepId, this.currentStage.flowsList)
        : undefined;

    this.discussionStageHandler = new DiscussionStageHandler(
      args.sendMessage,
      args.setResponsePending,
      args.executePrompt
    );
  }

  initializeGame() {
    if (!this.currentStage) {
      return;
    }
    if (isDiscussionStage(this.currentStage)) {
      this.discussionStageHandler.setCurrentDiscussion(this.currentStage);
      this.discussionStageHandler.onDiscussionFinished = (collectedData) => {
        const collectVariablesStage = this.stages.find(
          (s) => s.clientId === collectVariablesDiscussionStage
        );
        if (collectVariablesStage) {
          console.log('going to collect variables stage');
          this.discussionStageHandler.setCurrentDiscussion(
            collectVariablesStage
          );
          this.discussionStageHandler.stateData = collectedData;
          this.discussionStageHandler.onDiscussionFinished = () => {
            console.log('done with collect variables stage');
          };
          this.discussionStageHandler.initializeActivity();
        } else {
          throw new Error('collect variables stage not found');
        }
      };
      this.discussionStageHandler.initializeActivity();
    } else {
      throw new Error(`unhandled stage type: ${this.currentStage.stageType}`);
    }
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
