/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Scene } from "phaser";
import { GameStateHandler } from "./game-state-handler";
import EventSystem from "../../game/event-system";

import button from "../../game/assets/wordui/buttons/long_buttons/blue_button_complete.png";

/**
 * Abstract class defining a standard phaser menu
 * Menu scene always goes in front of a game scene
 */
export abstract class MenuScene extends Scene {
  bg: Phaser.GameObjects.Image | undefined;
  gameStateHandler?: GameStateHandler;

  constructor(name?: string) {
    super(name || "MainMenu");
  }

  preload() {
    // Load the assets for the game - Replace with your own assets

    // Load the assets for the player avatars

    // Load the assets for the UI
    this.load.image("button", button);
  }

  create(handler: GameStateHandler) {
    this.gameStateHandler = handler;
    this.createMenu();
  }

  createMenu() {
    // implemented in game
  }

  startGame() {
    // implemented in game
    EventSystem.emit("sceneStarted", "Game");
    this.scene.start("Game");
  }
}

export default MenuScene;
