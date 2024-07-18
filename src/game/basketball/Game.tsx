/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GameScene } from '../game-scene';
import { GameStateHandler } from '../game-state-handler';
import { EventSystem } from '../event-system';
import { Anchor, addBackground, addImage } from '../phaser-helpers';
import { BasketballPlayer } from '.';

export class BasketballGame extends GameScene {
  bbPlayer: Phaser.GameObjects.Image | undefined;

  constructor() {
    super('Game');
  }

  preload() {
    super.preload();
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets/basketball');
    this.load.image('bg_front', 'court_front');
    this.load.image('bg_hoop', 'court_hoop');
    this.load.image('bg_side', 'court_side');
    this.load.image('basketball', 'basketball');
    this.load.image('player1', 'player_1');
    this.load.image('player2', 'player_2');
    this.load.image('player3', 'player_3');
    this.load.image('player4', 'player_4');
    this.load.image('player5', 'player_5');
  }

  create(handler: GameStateHandler) {
    super.create(handler);
    EventSystem.on('addPlayer', this.addPlayer, this);
  }

  createScene() {
    super.createScene();
    const bg = addBackground(this, 'bg_front');
    this.bg = bg;
  }

  updateScene() {
    // todo: define what the scene objects are in JSON
    super.updateScene();
  }

  startGame() {
    super.startGame();
  }

  resetGame() {
    super.resetGame();
  }

  /** event functions are defined per game */

  addPlayer(player: BasketballPlayer) {
    if (this.bbPlayer) {
      this.bbPlayer.destroy();
    }
    this.bbPlayer = addImage(this, `player${player.clientId}`, undefined, {
      bg: this.bg,
      width: 300,
      xAnchor: Anchor.center,
      yAnchor: Anchor.center,
    });
  }
}

export default BasketballGame;
