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
import { DiscussionStageHandler } from '../../classes/discussion-stage-handler';
import {
  DiscussionStage,
  isDiscussionStage,
  IStage,
} from '../../components/discussion-stage-builder/types';
import { ProblemComponent } from './problem';
import SimulationScene from './SimulationScene';

export interface CurrentStage {
  id: string;
  stage: IStage;
  action?: () => void;
  beforeStart?: () => void;
  onStageFinished: (collectedData: CollectedDiscussionData) => void;
}

const introductionDiscussionStage = '1543bf48-01c4-4b1c-93cf-db1e4dcf56b7';
const selectStrategyDiscussionStage = '33a9f65d-92e6-441f-b512-1d4f2a53876b';
const respondToFeedbackDiscussionStage = '4440db13-f5d4-4e48-be7f-bb869f68a055';

export class SoccerStateHandler extends GameStateHandler {
  currentStage: CurrentStage | undefined;
  currentStepId: string | undefined = undefined;
  discussionStageHandler: DiscussionStageHandler;
  stageList: CurrentStage[] = [];

  constructor(args: GameStateHandlerArgs) {
    super({ ...args, defaultStageId: introductionDiscussionStage });

    this.discussionStageHandler = new DiscussionStageHandler(
      args.sendMessage,
      args.setResponsePending,
      args.executePrompt,
      undefined,
      undefined,
      this.newPlayerStateData.bind(this)
    );

    this.handleCurrentStage = this.handleCurrentStage.bind(this);
    this.initializeGame = this.initializeGame.bind(this);
    this.simulationEnded = this.simulationEnded.bind(this);

    const introDiscussionStage = this.stages.find(
      (s) => s.clientId === introductionDiscussionStage
    );
    const strategyStage = this.stages.find(
      (s) => s.clientId === selectStrategyDiscussionStage
    );

    if (!introDiscussionStage || !strategyStage) {
      throw new Error('missing stage');
    }

    const feedbackResponseStage = this.stages.find(
      (s) => s.clientId === respondToFeedbackDiscussionStage
    );

    if (!feedbackResponseStage) {
      throw new Error('missing feedback response stage');
    }

    this.stageList = [
      {
        id: 'intro-discussion',
        stage: introDiscussionStage,
        onStageFinished: () => {
          this.currentStage = this.stageList.find(
            (s) => s.id === 'select-strategy'
          );
          this.handleCurrentStage();
        },
      },
      {
        id: 'select-strategy',
        stage: strategyStage,
        onStageFinished: (data) => {
          const input = data['user_kicking_seq'];
          if (input) {
            this.updateRoomGameData({
              globalStateData: {
                ...this.globalStateData,
                gameStateData: [{ key: 'User Strategy Input', value: input }],
              },
              playerStateData: [
                {
                  player: this.player.clientId,
                  animation: '',
                  gameStateData: [{ key: 'User Strategy Input', value: input }],
                },
              ],
            });
          }
          this.currentStage = this.stageList.find(
            (s) => s.id === 'respond-feedback'
          );
          this.handleCurrentStage();
        },
      },
      {
        id: 'respond-feedback',
        stage: feedbackResponseStage,
        onStageFinished: (data) => {
          // Loop back to Stage 2
          this.currentStage = this.stageList.find(
            (s) => s.id === 'select-strategy'
          );
          // this.initializeGame();
          this.updateRoomGameData({
            globalStateData: {
              ...this.globalStateData,
              gameStateData: [{ key: 'User Strategy Input', value: '' }],
            },
            playerStateData: [
              {
                player: this.player.clientId,
                animation: '',
                gameStateData: [{ key: 'User Strategy Input', value: '' }],
              },
            ],
          });
          this.handleCurrentStage();
        },
      },
    ];

    this.currentStage = this.stageList[0];
  }

  handleCurrentStage() {
    if (!this.currentStage) return;

    if (isDiscussionStage(this.currentStage.stage)) {
      this.discussionStageHandler.setCurrentDiscussion(
        this.currentStage.stage as DiscussionStage
      );
      this.discussionStageHandler.onDiscussionFinished =
        this.currentStage.onStageFinished;
      if (this.currentStage.beforeStart) {
        this.currentStage.beforeStart();
      }
      this.discussionStageHandler.initializeActivity();
    } else {
      throw new Error(
        `Unhandled stage type: ${this.currentStage.stage.stageType}`
      );
    }
  }

  initializeGame() {
    // Step 1: Clear old strategy input before starting
    this.updateRoomGameData({
      globalStateData: {
        ...this.globalStateData,
        gameStateData: [{ key: 'User Strategy Input', value: '' }],
      },
      playerStateData: [
        {
          player: this.player.clientId,
          animation: '',
          gameStateData: [{ key: 'User Strategy Input', value: '' }],
        },
      ],
    });

    // Step 2: Begin the first discussion stage
    if (!this.currentStage) return;
    this.handleCurrentStage();
  }

  simulationEnded(): void {
    // ✅ Implement abstract method (even if unused)
  }

  async handleNewUserMessage(message: string) {
    // Optionally handle user messages here
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
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [SimulationScene],
  },
  showProblem: (controller: GameStateHandler) => {
    return <ProblemComponent controller={controller} />;
  },
  showSolution: () => <></>, // Avoid `null` in JSX returns
  showSimulation: () => <></>,
  showResult: () => <></>,
  createController: (args: GameStateHandlerArgs) =>
    new SoccerStateHandler(args),
};

export default SoccerGame;
