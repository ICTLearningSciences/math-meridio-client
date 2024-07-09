/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Scene } from "phaser";

import bg_front from "./assets/court_front.jpg";
import bg_hoop from "./assets/court_hoop.jpg";
import bg_side from "./assets/court_side.jpg";
import basketball from "./assets/basketball.png";
import player1 from "./assets/player_1.png";
import player2 from "./assets/player_2.png";
import player3 from "./assets/player_3.png";
import player4 from "./assets/player_4.png";
import player5 from "./assets/player_5.png";

import arrow from "../assets/arrow.png";
import button from "../assets/wordui/buttons/long_buttons/blue_button_complete.png";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.image("bg_front", bg_front);
    this.load.image("bg_hoop", bg_hoop);
    this.load.image("bg_side", bg_side);
    this.load.image("basketball", basketball);
    this.load.image("player1", player1);
    this.load.image("player2", player2);
    this.load.image("player3", player3);
    this.load.image("player4", player4);
    this.load.image("player5", player5);

    // Load the assets for the UI
    this.load.image("arrow", arrow);
    this.load.image("button", button);
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
