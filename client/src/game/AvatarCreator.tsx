/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { GameStateHandler } from "../classes/game-state/game-state-handler";
import MenuScene from "../classes/game-state/menu-scene";
import { ChatMessage } from "../types";
import EventSystem from "./event-system";
import { Anchor, addBackground, addImage, addText, animateText, scaleText } from "./phaser-helpers";

import search from "./assets/wordui/icons/icons_256/looking_glass_2.png";
import boy_1 from "./assets/avatar/boy_1.png";
import boy_2 from "./assets/avatar/boy_2.png";
import boy_3 from "./assets/avatar/boy_3.png";
import boy_4 from "./assets/avatar/boy_4.png";
import boy_5 from "./assets/avatar/boy_5.png";
import boy_6 from "./assets/avatar/boy_6.png";
import boy_7 from "./assets/avatar/boy_7.png";
import boy_8 from "./assets/avatar/boy_8.png";
import boy_9 from "./assets/avatar/boy_9.png";
import boy_10 from "./assets/avatar/boy_10.png";
import boy_11 from "./assets/avatar/boy_11.png";
import boy_12 from "./assets/avatar/boy_12.png";
import boy_13 from "./assets/avatar/boy_13.png";
import boy_14 from "./assets/avatar/boy_14.png";
import boy_15 from "./assets/avatar/boy_15.png";
import boy_16 from "./assets/avatar/boy_16.png";
import boy_17 from "./assets/avatar/boy_17.png";
import boy_18 from "./assets/avatar/boy_18.png";
import boy_19 from "./assets/avatar/boy_19.png";
import boy_20 from "./assets/avatar/boy_20.png";

import girl_1 from "./assets/avatar/girl_1.png";
import girl_2 from "./assets/avatar/girl_2.png";
import girl_3 from "./assets/avatar/girl_3.png";
import girl_4 from "./assets/avatar/girl_4.png";
import girl_5 from "./assets/avatar/girl_5.png";
import girl_6 from "./assets/avatar/girl_6.png";
import girl_7 from "./assets/avatar/girl_7.png";
import girl_8 from "./assets/avatar/girl_8.png";
import girl_9 from "./assets/avatar/girl_9.png";
import girl_10 from "./assets/avatar/girl_10.png";
import girl_11 from "./assets/avatar/girl_11.png";
import girl_12 from "./assets/avatar/girl_12.png";
import girl_13 from "./assets/avatar/girl_13.png";
import girl_14 from "./assets/avatar/girl_14.png";
import girl_15 from "./assets/avatar/girl_15.png";
import girl_16 from "./assets/avatar/girl_16.png";
import girl_17 from "./assets/avatar/girl_17.png";
import girl_18 from "./assets/avatar/girl_18.png";
import girl_19 from "./assets/avatar/girl_19.png";
import girl_20 from "./assets/avatar/girl_20.png";
import girl_21 from "./assets/avatar/girl_21.png";
import girl_22 from "./assets/avatar/girl_22.png";
import girl_23 from "./assets/avatar/girl_23.png";
import girl_24 from "./assets/avatar/girl_24.png";
import girl_25 from "./assets/avatar/girl_25.png";
import girl_26 from "./assets/avatar/girl_26.png";
import girl_27 from "./assets/avatar/girl_27.png";
import girl_28 from "./assets/avatar/girl_28.png";

import brows_1 from "./assets/avatar/brows_1.png";
import eyes_1 from "./assets/avatar/eyes_1.png";
import nose_1 from "./assets/avatar/nose_1.png";
import mouth_1 from "./assets/avatar/mouth_1.png";
import mouth_2 from "./assets/avatar/mouth_2.png";
import mouth_3 from "./assets/avatar/mouth_3.png";
import mouth_4 from "./assets/avatar/mouth_4.png";

export class AvatarMenu extends MenuScene {
  playername: string;
  avatars: Phaser.GameObjects.Image[];
  selectedAvatar: Phaser.GameObjects.Image | undefined;
  search: Phaser.GameObjects.Image | undefined;

  systemMsg: Phaser.GameObjects.Text | undefined;
  chatMsg: Phaser.GameObjects.Text | undefined;
  chatWindow: Phaser.GameObjects.Rectangle | undefined;
  chatInnerWindow: Phaser.GameObjects.Rectangle | undefined;

  messageQueue: ChatMessage[];
  currentSystemMessage: ChatMessage | undefined;
  currentChatMessage: ChatMessage | undefined;

  chatButton: Phaser.GameObjects.Image | undefined;
  chatAvatar: Phaser.GameObjects.Image[];

  constructor() {
    super("AvatarCreator");
    this.avatars = [];
    this.messageQueue = [];
    this.chatAvatar = [];
    this.playername = "";
  }

  preload() {
    super.preload();
    //  Load the assets for the game - Replace with your own assets
    this.load.image("search", search);
    this.load.image(`boy_1`, boy_1);
    this.load.image(`boy_2`, boy_2);
    this.load.image(`boy_3`, boy_3);
    this.load.image(`boy_4`, boy_4);
    this.load.image(`boy_5`, boy_5);
    this.load.image(`boy_6`, boy_6);
    this.load.image(`boy_7`, boy_7);
    this.load.image(`boy_8`, boy_8);
    this.load.image(`boy_9`, boy_9);
    this.load.image(`boy_10`, boy_10);
    this.load.image(`boy_11`, boy_11);
    this.load.image(`boy_12`, boy_12);
    this.load.image(`boy_13`, boy_13);
    this.load.image(`boy_14`, boy_14);
    this.load.image(`boy_15`, boy_15);
    this.load.image(`boy_16`, boy_16);
    this.load.image(`boy_17`, boy_17);
    this.load.image(`boy_18`, boy_18);
    this.load.image(`boy_19`, boy_19);
    this.load.image(`boy_20`, boy_20);

    this.load.image(`girl_1`, girl_1);
    this.load.image(`girl_2`, girl_2);
    this.load.image(`girl_3`, girl_3);
    this.load.image(`girl_4`, girl_4);
    this.load.image(`girl_5`, girl_5);
    this.load.image(`girl_6`, girl_6);
    this.load.image(`girl_7`, girl_7);
    this.load.image(`girl_8`, girl_8);
    this.load.image(`girl_9`, girl_9);
    this.load.image(`girl_10`, girl_10);
    this.load.image(`girl_11`, girl_11);
    this.load.image(`girl_12`, girl_12);
    this.load.image(`girl_13`, girl_13);
    this.load.image(`girl_14`, girl_14);
    this.load.image(`girl_15`, girl_15);
    this.load.image(`girl_16`, girl_16);
    this.load.image(`girl_17`, girl_17);
    this.load.image(`girl_18`, girl_18);
    this.load.image(`girl_19`, girl_19);
    this.load.image(`girl_20`, girl_20);
    this.load.image(`girl_21`, girl_21);
    this.load.image(`girl_22`, girl_22);
    this.load.image(`girl_23`, girl_23);
    this.load.image(`girl_24`, girl_24);
    this.load.image(`girl_25`, girl_25);
    this.load.image(`girl_26`, girl_26);
    this.load.image(`girl_27`, girl_27);
    this.load.image(`girl_28`, girl_28);

    this.load.image(`brows_1`, brows_1);
    this.load.image(`eyes_1`, eyes_1);
    this.load.image(`nose_1`, nose_1);
    this.load.image(`mouth_1`, mouth_1);
    this.load.image(`mouth_2`, mouth_2);
    this.load.image(`mouth_3`, mouth_3);
    this.load.image(`mouth_4`, mouth_4);
  }

  create(handler: GameStateHandler) {
    super.create(handler);
  }

  createMenu() {
    super.createMenu();
    this.bg = addBackground(this, "background").setAlpha(0);

    this.chatWindow = this.add.rectangle(
      10,
      this.bg.displayHeight * 0.9 - 5,
      window.innerWidth * (9 / 12) - 35,
      this.bg.displayHeight * 0.1 - 5,
      0x41eaea,
      1
    );
    this.chatWindow.setOrigin(0, 0);
    this.chatInnerWindow = this.add.rectangle(
      20,
      this.bg.displayHeight * 0.9 + 5,
      this.chatWindow.displayWidth - 20,
      this.chatWindow.displayHeight - 20,
      0x6bffff,
      1
    );
    this.chatInnerWindow.setOrigin(0, 0);
    this.chatButton = addImage(this, "chat", undefined, {
      bg: this.bg,
      heightRel: 0.2,
      yAnchor: Anchor.end,
      xAnchor: Anchor.center,
    }).setAlpha(0.5)
    this.chatButton.setY(this.chatButton.y - this.chatButton.displayHeight / 2 - 10)
    this.chatButton.setInteractive();
    this.chatButton.on(
      "pointerdown",
      () => {
        EventSystem.emit("ttsToggled")
      },
      this
    );

    this.renderMiniAvatar("girl_1")

    EventSystem.on("setPlayername", this.setPlayername, this);
    EventSystem.on("addSystemMessage", this.addSystemMessage, this);
    EventSystem.on("addChatMessage", this.addChatMessage, this);
    EventSystem.on("ttsFinished", this.ttsFinished, this);
    EventSystem.on("loadingAvatars", this.loadingAvatars, this);
    EventSystem.on("showAvatars", this.showAvatars, this);
    EventSystem.on("setTTS", this.setTTS, this);

    EventSystem.emit("sceneCreated", "AvatarCreator")
  }

  update() {
    if (this.messageQueue.length > 0 && !this.currentSystemMessage) {
      this.currentSystemMessage = this.messageQueue.shift();
      this.showSystemMessage(this.currentSystemMessage!);
    }
  }

  // event handlers
  setPlayername(name: string) {
    if (!this.systemMsg || !this.bg) return;
    this.playername = name;
  }

  setTTS(tf: boolean) {
    if (!this.chatButton) return;
    if (tf) {
      this.chatButton.setAlpha(1)
    } else {
      this.chatButton.setAlpha(0.5)
    }
  }

  ttsFinished(msg: ChatMessage) {
    if (msg.clientId === this.currentSystemMessage?.clientId) {
      this.currentSystemMessage = undefined;
    }
  }

  addSystemMessage(msg: ChatMessage) {
    this.messageQueue.push(msg);
  }

  showSystemMessage(msg: ChatMessage) {
    if (!this.systemMsg) {
      this.systemMsg = addText(this, msg.message, {
        bg: this.bg,
        yAnchor: Anchor.center,
        widthRel: 1,
        maxFontSize: 78,
      }).setAlpha(0);
      EventSystem.emit("systemMessageStart", msg);
      this.tweens.add({
        targets: this.systemMsg,
        alpha: { from: 0, to: 1 },
        duration: 1000,
        onComplete: () => {
          this.currentSystemMessage = undefined;
        },
      });
    } else {
      const msgRef = this.systemMsg;
      this.tweens.add({
        targets: this.systemMsg,
        alpha: { from: 1, to: 0 },
        duration: 500,
        onComplete: () => {
          EventSystem.emit("systemMessageStart", msg);
          scaleText(this, msgRef, msg.message);
          this.tweens.add({
            targets: this.systemMsg,
            alpha: { from: 0, to: 1 },
            duration: 1000,
            onComplete: () => {
              this.currentSystemMessage = undefined;
            },
          });
        },
      });
    }
  }

  addChatMessage(msg: ChatMessage) {
    if (!this.chatInnerWindow) return;
    if (!this.chatMsg) {
      this.chatMsg = addText(this, msg.message, {
        bg: this.bg,
        yAnchor: Anchor.end,
        xAnchor: Anchor.center,
        heightRel: 0.1,
        widthRel: 0.9,
        maxFontSize: 36,
      })
    } else {
      scaleText(this, this.chatMsg, msg.message);
    }
    this.currentChatMessage = msg;
    EventSystem.emit("chatMessageStart", msg);
    this.chatMsg.setY(this.chatInnerWindow.y + this.chatInnerWindow.displayHeight / 2)

    const mouth = this.chatAvatar[0];
    let timer: Phaser.Time.TimerEvent;
    if (mouth) {
      timer = this.time.addEvent({
        delay: 100,
        loop: true,
        callback() {
          // hard-code mouth animation for now but shouldn't be...
          if (mouth.texture.key === "mouth_1")
            mouth.setTexture("mouth_2")
          else
            mouth.setTexture("mouth_1")
        }
      });
    }
    animateText(this.chatMsg).then(() => {
      EventSystem.emit("chatMessageEnd", msg);
      if (mouth) {
        timer?.destroy();
        mouth.setTexture("mouth_1")
      }
    })
  }

  loadingAvatars(tf: boolean) {
    if (!this.systemMsg) return;
    if (tf) {
      for (const avatar of this.avatars) {
        avatar.destroy();
      }
      this.avatars = [];

      this.search = addImage(this, "search", undefined, {
        bg: this.bg,
        yAnchor: Anchor.center,
        xAnchor: Anchor.center,
      })
      this.tweens.add({
        targets: this.search,
        angle: "-=45",
        yoyo: true,
        repeat: -1,
        ease: "sine.inout",
        duration: 500,
      });
      this.tweens.add({
        targets: this.systemMsg,
        y: { from: this.systemMsg.y, to: 0 + this.systemMsg.displayHeight },
        ease: "bounce.out",
        duration: 1000,
        onComplete: () => {
          scaleText(this, this.systemMsg!, this.systemMsg?.text, {
            yAnchor: Anchor.start,
          })
        }
      });
    } else {
      this.search?.destroy();
    }
  }

  showAvatars(avatars: string[]) {
    for (const avatar of this.avatars) {
      avatar.destroy();
    }
    this.avatars = [];
    this.selectedAvatar?.destroy();

    let i = 1;
    for (const id of avatars) {
      const avatar = addImage(this, id, undefined, {
        bg: this.bg,
        widthRel: 0.2,
        yAnchor: Anchor.center,
        xAnchor: Anchor.start,
      }).setAlpha(0);
      avatar.setX(0 + (avatar.displayWidth + 50) * i)
      avatar.setInteractive({ useHandCursor: true });
      avatar.setData("name", id)
      avatar.on(
        "pointerdown",
        () => {
          this.selectAvatar(avatar);
        },
        this
      );
      this.tweens.add({
        targets: avatar,
        alpha: { from: 0, to: 1 },
        duration: 1000,
        delay: i * 100,
      });
      this.avatars.push(avatar);
      i++;
    }
  }

  selectAvatar(avatar: Phaser.GameObjects.Image) {
    EventSystem.emit("avatarSelected", avatar.getData("name"))

    this.selectedAvatar = addImage(this, avatar.getData("name"), undefined, {
      bg: this.bg,
      widthRel: 0.5,
      yAnchor: Anchor.center,
      xAnchor: Anchor.center,
    });
    this.renderMiniAvatar(avatar.getData("name"));

    for (const avatar of this.avatars) {
      avatar.destroy();
    }
    this.avatars = [];
  }

  renderMiniAvatar(name: string) {
    for (const avatar of this.chatAvatar) {
      avatar.destroy();
    }
    this.chatAvatar = [];

    const head = addImage(this, name, undefined, {
      bg: this.bg,
      heightRel: 0.2,
    });
    head.setX(0 + head.displayWidth / 2)
    head.setY(this.chatWindow!.y)
    const eyes = addImage(this, "eyes_1", undefined, {
      bg: head,
      height: head.displayHeight / 8
    });
    eyes.setY(head.y - eyes.displayHeight / 2);
    const brows = addImage(this, "brows_1", undefined, {
      bg: head,
      width: eyes.displayWidth * 1.1
    });
    brows.setY(eyes.y - eyes.displayHeight / 2 - brows.displayHeight / 2);
    const nose = addImage(this, "nose_1", undefined, {
      bg: head,
      width: eyes.displayWidth / 4
    });
    nose.setY(eyes.y + eyes.displayHeight / 2 + nose.displayHeight * 0.75);
    const mouth = addImage(this, "mouth_1", undefined, {
      bg: head,
      width: eyes.displayWidth / 2
    });
    mouth.setY(nose.y + nose.displayHeight + mouth.displayHeight / 2);

    this.chatAvatar = [mouth, head, brows, nose, eyes]
  }
}

export default AvatarMenu;
