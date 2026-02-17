/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Game } from '../types';
import { SimulationScene } from './SimulationScene';
import { ProblemComponent } from './problem';
import { SolutionComponent } from './solution';
import { PlayerStrategy, SimulationComponent } from './simulation';
import { ResultComponent } from './results';
import {
  GameData,
  GameStateData,
  PlayerStateData,
} from '../../store/slices/game/types';
import { Player } from '../../store/slices/player/types';

const BasketballGame: Game = {
  id: 'basketball',
  name: 'NBA Analyst',
  problem: `We need you and the analyst team to figure out why we're losing and what to change in our strategy to start winning. Based on what you see, what do you think we're doing wrong? Out of 100 shots, how many should be inside, outside, or mid lane? Inside and mid lane shots earn 2 points, and outside shots earn 3, but they're harder to make.`,
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
  showSolution: (
    uiGameData: GameData,
    player: Player,
    updatePlayerStateData: (
      newPlayerStateData: GameStateData[],
      playerId: string
    ) => void
  ) => {
    return (
      <SolutionComponent
        uiGameData={uiGameData}
        player={player}
        updatePlayerStateData={updatePlayerStateData}
      />
    );
  },
  showSimulation: (game: Game) => {
    return <SimulationComponent game={game} />;
  },
  showPlayerStrategy: (
    player: Player,
    playersGameStateData: PlayerStateData
  ) => {
    return (
      <PlayerStrategy
        player={player}
        playersGameStateData={playersGameStateData}
      />
    );
  },
  showResult: (uiGameData: GameData) => {
    return <ResultComponent uiGameData={uiGameData} />;
  },
};

export default BasketballGame;
