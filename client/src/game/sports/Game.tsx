/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { EventSystem } from "../event-system";
import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x00ff00);
    this.add.image(512, 384, "background").setAlpha(0.5);
    EventSystem.on("addBall", this.addBall, this);
    // EventSystem.emit("current-scene-ready", this);
  }

  addBall(ball: string) {
    const image = this.add.image(
      Math.random() * 100,
      Math.random() * 100,
      ball
    );
    image.scale = 0.1;
  }
}
