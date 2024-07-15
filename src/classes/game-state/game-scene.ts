/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Scene } from 'phaser';
import { GameStateHandler } from './game-state-handler';
import EventSystem from '../../game/event-system';

/**
 * Abstract class defining a standard phaser game
 */
export abstract class GameScene extends Scene {
  bg: Phaser.GameObjects.Image | undefined;
  gameStateHandler?: GameStateHandler;

  constructor(name?: string) {
    super(name || 'Game');
  }

  preload() {
    // Load the assets for the game - Replace with your own assets
    // Load the assets for the player avatars
    // Load the assets for the UI
  }

  create(handler: GameStateHandler) {
    this.gameStateHandler = handler;
    this.createScene();
    EventSystem.on('updateScene', this.updateScene, this);
    EventSystem.on('startGame', this.startGame, this);
    EventSystem.on('resetGame', this.resetGame, this);
  }

  createScene() {
    // implemented in game
    EventSystem.emit('sceneCreated');
  }

  updateScene(scene?: any) {
    // todo: define what the scene objects are in JSON
    // implemented in game
    EventSystem.emit('sceneUpdated');
  }

  startGame() {
    // implemented in game
    EventSystem.emit('gameStarted');
  }

  resetGame() {
    // implemented in game
    EventSystem.emit('gameReset');
  }

  /** event functions are defined per game */
}

export default GameScene;
