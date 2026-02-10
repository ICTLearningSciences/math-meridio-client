/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import BasketballGame from './basketball';
import NewGame from './concert-ticket-sales';
import { AbstractGameData } from '../classes/abstract-game-data';
import { PlayerStateData } from '../store/slices/game';
import { DiscussionStage } from '../components/discussion-stage-builder/types';

export interface Game {
  id: 'basketball' | 'concert-ticket-sales' | 'test-base';
  name: string;
  problem: string;
  config: Phaser.Types.Core.GameConfig;
  persistTruthGlobalStateData: string[];
  showProblem: (controller: AbstractGameData) => JSX.Element;
  showSolution: (controller: AbstractGameData) => JSX.Element;
  showSimulation: (
    controller: AbstractGameData,
    simulation?: string
  ) => JSX.Element;
  showPlayerStrategy: (
    data: PlayerStateData,
    controller: AbstractGameData
  ) => JSX.Element;
  showResult: (controller: AbstractGameData) => JSX.Element;
  createController: (discussionStages: DiscussionStage[]) => AbstractGameData;
}

export const GAMES: Game[] = [BasketballGame, NewGame];
