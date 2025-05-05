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
import { PlayerStateData } from '../../store/slices/game';
import { SIMULTAION_VIEWED_KEY } from '../../helpers';

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
  discussionStageHandler: DiscussionStageHandler;

  constructor(args: GameStateHandlerArgs) {
    super({ ...args, defaultStageId: introductionDiscussionStage });

    this.discussionStageHandler = new DiscussionStageHandler(
      this.player.clientId,
      this.globalStateData,
      args.sendMessage,
      args.setResponsePending,
      args.executePrompt,
      this.updateRoomStageStepId.bind(this),
      undefined,
      this.newPlayerStateData.bind(this),
      undefined
    );
    
    this.initializeGame = this.initializeGame.bind(this);
    this.simulationEnded = this.simulationEnded.bind(this);

    const introDiscussionStage = this.dbDiscussionStages.find(
      (s) => s.clientId === introductionDiscussionStage
    );
    const strategyStage = this.dbDiscussionStages.find(
      (s) => s.clientId === selectStrategyDiscussionStage
    );

    if (!introDiscussionStage || !strategyStage) {
      throw new Error('missing stage');
    }

    const feedbackResponseStage = this.dbDiscussionStages.find(
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
          this.updateStageByStageListId('select-strategy');
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
          this.updateStageByStageListId('respond-feedback');
        },
      },
      {
        id: 'respond-feedback',
        stage: feedbackResponseStage,
        onStageFinished: (data) => {
          // Loop back to Stage 2
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
          this.updateStageByStageListId('select-strategy');
        },
      },
    ];
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
  createController: (args: GameStateHandlerArgs) => new SoccerStateHandler(args),
  persistTruthGlobalStateData: []
};

export default SoccerGame;
