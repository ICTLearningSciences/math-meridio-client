/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Phaser from 'phaser';

import Game from './Game';
import { GameObjects } from '../../classes/game-state/types';

export interface BasketballPlayerStats {
  twoPoint: number;
  threePoint: number;
  freeThrow: number;
  rebound: number;
  block: number;
  steal: number;
  pass: number;
  foul: number;
}
export interface BasketballPlayer extends GameObjects {
  description: string;
  stats: BasketballPlayerStats; // base stats defining player skills
  gameStats: BasketballPlayerStats; // # of times successfully completed in the game
  totalStats: BasketballPlayerStats; // # of times attempted in the game
}

export function BuildPlayerStats(
  twP = 0,
  thP = 0,
  ft = 0,
  rb = 0,
  bl = 0,
  st = 0,
  pa = 0,
  fo = 0
): BasketballPlayerStats {
  return {
    twoPoint: twP / 10,
    threePoint: thP / 10,
    freeThrow: ft / 10,
    rebound: rb / 10,
    block: bl / 10,
    steal: st / 10,
    pass: pa / 10,
    foul: fo / 10,
  };
}
export const BB_PLAYERS: BasketballPlayer[] = [
  {
    clientId: '1',
    name: 'Red Bounder',
    description: 'Great at blocking short distance shots and getting rebounds.',
    stats: BuildPlayerStats(7, 5, 5, 10, 8, 0, 9, 0),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: '2',
    name: 'Purple Wall',
    description: 'Great at blocking long distance shots.',
    stats: BuildPlayerStats(5, 5, 7, 8, 10, 0, 9, 0),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: '3',
    name: 'Green Menace',
    description: 'Great at stealing the ball and drawing fouls. ',
    stats: BuildPlayerStats(5, 5, 8, 0, 0, 10, 7, 9),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: '4',
    name: 'Blue Ace',
    description: 'Great at scoring 2 pointers.',
    stats: BuildPlayerStats(10, 8, 7, 0, 0, 5, 5, 9),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: '5',
    name: 'Pink Shooter',
    description: 'Great at scoring 3 pointers.',
    stats: BuildPlayerStats(8, 10, 9, 0, 0, 5, 7, 5),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
];

const config: Phaser.Types.Core.GameConfig = {
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
  scene: [Game],
};

export default config;
