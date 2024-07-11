/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { GameStateHandler } from "../classes/game-state/game-state-handler";
import MenuScene from "../classes/game-state/menu-scene";
import { ChatMessage, PromptRoles } from "../types";
import EventSystem from "./event-system";
import { Anchor, addBackground, addText } from "./phaser-helpers";

export class AvatarMenu extends MenuScene {
  avatars: Phaser.GameObjects.Image[];
  selectedAvatar: Phaser.GameObjects.Image[] | undefined;
  systemMsgs: Phaser.GameObjects.Text[];

  constructor() {
    super("AvatarCreator");
    this.avatars = [];
    this.systemMsgs = [];
  }

  preload() {
    super.preload();
    //  Load the assets for the game - Replace with your own assets
  }

  create(handler: GameStateHandler) {
    super.create(handler);
    EventSystem.on("showSystemMessage", this.showSystemMessage, this);
    EventSystem.on("showChatMessage", this.showChatMessage, this);
    EventSystem.on("showAvatars", this.showAvatars, this);
  }

  createMenu() {
    super.createMenu();
    this.bg = addBackground(this, "background").setAlpha(0);
    this.showSystemMessage({
      clientId: "",
      message: "Welcome to Math Meridio!",
      sender: PromptRoles.SYSTEM,
    });
  }

  startGame() {
    super.startGame();
  }

  showSystemMessage(msg: ChatMessage) {
    let text = addText(this, msg.message, {
      bg: this.bg,
      yAnchor: this.avatars.length === 0 ? Anchor.center : Anchor.start,
      widthRel: 1,
      maxFontSize: 78,
    }).setAlpha(0);
    this.tweens.add({
      targets: text,
      alpha: { from: 0, to: 1 },
      duration: 1000,
      onComplete: () => {
        EventSystem.emit("systemMessageShown", msg);
      },
    });
  }

  showChatMessage(msg: ChatMessage) {
    EventSystem.emit("chatMessageShown", msg);
  }

  showAvatars(avatars: string[]) {}

  selectAvatar(avatar: Phaser.GameObjects.Image) {}
}

export default AvatarMenu;
