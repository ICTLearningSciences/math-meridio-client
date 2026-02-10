/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { AbstractGameData } from '../../classes/abstract-game-data';
import { Game } from '../types';
import { SimulationScene } from './SimulationScene';
import { ProblemComponent } from './problem';
import { SolutionComponent } from './solution';
import { PlayerStrategy, SimulationComponent } from './simulation';
import { ResultComponent } from './results';
import { GameData, GameStateData, PlayerStateData } from '../../store/slices/game';
import { SIMULTAION_VIEWED_KEY } from '../../helpers';
import { CollectedDiscussionData, CurrentStage } from '../../types';
import {
  IStage,
  SimulationStage,
} from '../../components/discussion-stage-builder/types';
import { DiscussionStage } from '../../components/discussion-stage-builder/types';
import { Player } from '../../store/slices/player/types';

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

export class BasketballStateHandler extends AbstractGameData {
  stageList: CurrentStage<IStage>[] = [];
  constructor(discussionStages: DiscussionStage[]) {
    super();
    const introDiscussionStage = discussionStages.find(
      (s) => s.clientId === introductionDiscussionStage
    );
    const collectVariablesStage = discussionStages.find(
      (s) => s.clientId === collectVariablesDiscussionStage
    );
    const explainConceptsStage = discussionStages.find(
      (s) => s.clientId === explainConceptsDiscussionStage
    );
    const keyConceptsConvoStage = discussionStages.find(
      (s) => s.clientId === keyConceptsConvoDiscussionStage
    );
    const selectStrategyStage = discussionStages.find(
      (s) => s.clientId === selectStrategyDiscussionStage
    );
    const discussNewStrategyStage = discussionStages.find(
      (s) => s.clientId === discussNewStrategyDiscussionStage
    );
    const discussBestStrategyStage = discussionStages.find(
      (s) => s.clientId === discussBestStrategyDiscussionStage
    );
    const finishedStage = discussionStages.find(
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
        getNextStage: () => {
          return 'collect-variables';
        },
      },
      {
        id: 'collect-variables',
        stage: collectVariablesStage,
        getNextStage: () => {
          return 'explain-concepts';
        },
      },
      {
        id: 'explain-concepts',
        stage: explainConceptsStage,
        getNextStage: (data) => {
          if (data['understands_algorithm'] !== 'true') {
            return 'key-concepts-convo';
          } else {
            return 'select-strategy';
          }
        },
      },
      {
        id: 'key-concepts-convo',
        stage: keyConceptsConvoStage,
        beforeStart: () => {
          // this.discussionStageHandler.exitEarlyCondition = (
          //   data: CollectedDiscussionData
          // ) => {
          //   return data['understands_algorithm'] === 'true';
          // };
          console.log(
            "WARNING: beforeStart called, doing nothing, used to exit early if player didn't understand algorithm"
          );
        },
        getNextStage: (data) => {
          // this.discussionStageHandler.exitEarlyCondition = undefined;
          if (data['understands_algorithm'] !== 'true') {
            return 'key-concepts-convo';
          } else {
            return 'select-strategy';
          }
        },
      },
      {
        id: 'select-strategy',
        stage: selectStrategyStage,
        getNextStage: () => {
          return 'wait-for-simulation';
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
          return 'discuss-new-strategy';
        },
      },
      {
        id: 'discuss-new-strategy',
        stage: discussNewStrategyStage,
        getNextStage: (data) => {
          if (data['best_strategy_found'] === 'false') {
            return 'discuss-best-strategy';
          } else {
            return 'finished';
          }
        },
      },
      {
        id: 'discuss-best-strategy',
        stage: discussBestStrategyStage,
        getNextStage: (data) => {
          if (data['best_strategy_found'] === 'false') {
            return 'discuss-best-strategy';
          } else {
            return 'finished';
          }
        },
      },
      {
        id: 'finished',
        stage: finishedStage,
        getNextStage: () => {
          return '';
        },
      },
    ];
    this.stageList = stageList;
  }
}

const BasketballGame: Game = {
  id: 'basketball',
  name: 'NBA Analyst',
  problem: `We need you and the analyst team to figure out why we're losing and what to change in our strategy to start winning. Based on what you see, what do you think we're doing wrong? Out of 100 shots, how many should be inside, outside, or mid lane? Inside and mid lane shots earn 2 points, and outside shots earn 3, but they're harder to make.`,
  persistTruthGlobalStateData: [
    'Points per outside shot',
    'Points per inside shot',
    'Points per mid shot',
    'understands_algorithm',
    'understands_multiplication',
    'understands_addition',
    'understands_success_shots',
    'understands_shot_points',
    'best_strategy_found',
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
  showSolution: (uiGameData: GameData, player: Player, updatePlayerStateData: (newPlayerStateData: GameStateData[], playerId: string) => void) => {
    return <SolutionComponent uiGameData={uiGameData} player={player} updatePlayerStateData={updatePlayerStateData} />;
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
  createController: (discussionStages: DiscussionStage[]) => {
    return new BasketballStateHandler(discussionStages);
  },
};

export default BasketballGame;
