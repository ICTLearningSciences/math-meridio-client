/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Scene } from "phaser";
import { Anchor, addBackground, addImage, addText } from "../phaser-helpers";
import EventSystem from "../event-system";
import { Player } from ".";

export class MainMenu extends Scene {
  bg: Phaser.GameObjects.Image | undefined;
  player: Phaser.GameObjects.Image | undefined;

  constructor() {
    super("MainMenu");
  }

  create() {
    const bg = addBackground(this, "bg_front");

    const btnStart = addImage(this, "button", undefined, {
      bg,
      width: 300,
      yAnchor: Anchor.end,
      xAnchor: Anchor.center,
    });
    addText(this, "Start", {
      bg: btnStart,
      heightRel: 0.5,
    });
    btnStart.setInteractive();
    btnStart.on(
      "pointerdown",
      () => {
        this.scene.start("Game");
      },
      this
    );

    EventSystem.on("addPlayer", this.addPlayer, this);
    this.bg = bg;
  }

  addPlayer(player: Player) {
    if (this.player) {
      this.player.destroy();
    }
    this.player = addImage(this, `player${player.clientId}`, undefined, {
      bg: this.bg,
      width: 300,
      xAnchor: Anchor.center,
      yAnchor: Anchor.center,
    });
  }
}
