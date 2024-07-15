/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { GameStateHandler } from '../classes/game-state/game-state-handler';
import MenuScene from '../classes/game-state/menu-scene';
import EventSystem from './event-system';
import {
  Anchor,
  addBackground,
  addImage,
  addText,
  animateText,
  scaleText,
} from './phaser-helpers';
import { ChatMessage } from '../store/slices/gameData';

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
    super('AvatarCreator');
    this.avatars = [];
    this.messageQueue = [];
    this.chatAvatar = [];
    this.playername = '';
  }

  preload() {
    super.preload();
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');
    this.load.image('search', 'wordui/icons/icons_256/looking_glass_2.png');
    for (let i = 1; i <= 20; i++) {
      this.load.image(`boy_${i}`, `avatar/boy_${i}.png`);
    }
    for (let i = 1; i <= 28; i++) {
      this.load.image(`girl_${i}`, `avatar/girl_${i}.png`);
    }
    for (let i = 1; i <= 9; i++) {
      this.load.image(`brows_${i}`, `avatar/brows_${i}.png`);
    }
    for (let i = 1; i <= 21; i++) {
      this.load.image(`eyes_${i}`, `avatar/eyes_${i}.png`);
    }
    for (let i = 1; i <= 9; i++) {
      this.load.image(`mouth_${i}`, `avatar/mouth_${i}.png`);
    }
    for (let i = 1; i <= 6; i++) {
      this.load.image(`nose_${i}`, `avatar/nose_${i}.png`);
    }
  }

  create(handler: GameStateHandler) {
    super.create(handler);
  }

  createMenu() {
    super.createMenu();
    this.bg = addBackground(this, 'background').setAlpha(0);

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
    this.chatButton = addImage(this, 'chat', undefined, {
      bg: this.bg,
      heightRel: 0.2,
      yAnchor: Anchor.end,
      xAnchor: Anchor.center,
    }).setAlpha(0.5);
    this.chatButton.setY(
      this.chatButton.y - this.chatButton.displayHeight / 2 - 10
    );
    this.chatButton.setInteractive();
    this.chatButton.on(
      'pointerdown',
      () => {
        EventSystem.emit('ttsToggled');
      },
      this
    );

    this.renderMiniAvatar('girl_1');

    EventSystem.on('setPlayername', this.setPlayername, this);
    EventSystem.on('addSystemMessage', this.addSystemMessage, this);
    EventSystem.on('addChatMessage', this.addChatMessage, this);
    EventSystem.on('ttsFinished', this.ttsFinished, this);
    EventSystem.on('loadingAvatars', this.loadingAvatars, this);
    EventSystem.on('showAvatars', this.showAvatars, this);
    EventSystem.on('setTTS', this.setTTS, this);

    EventSystem.emit('sceneCreated', 'AvatarCreator');
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
      this.chatButton.setAlpha(1);
    } else {
      this.chatButton.setAlpha(0.5);
    }
  }

  ttsFinished(msg: ChatMessage) {
    if (msg.id === this.currentSystemMessage?.id) {
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
      EventSystem.emit('systemMessageStart', msg);
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
          EventSystem.emit('systemMessageStart', msg);
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
      });
    } else {
      scaleText(this, this.chatMsg, msg.message);
    }
    this.currentChatMessage = msg;
    EventSystem.emit('chatMessageStart', msg);
    this.chatMsg.setY(
      this.chatInnerWindow.y + this.chatInnerWindow.displayHeight / 2
    );

    const mouth = this.chatAvatar[0];
    let timer: Phaser.Time.TimerEvent;
    if (mouth) {
      timer = this.time.addEvent({
        delay: 100,
        loop: true,
        callback() {
          // hard-code mouth animation for now but shouldn't be...
          if (mouth.texture.key === 'mouth_1') mouth.setTexture('mouth_2');
          else mouth.setTexture('mouth_1');
        },
      });
    }
    animateText(this.chatMsg).then(() => {
      EventSystem.emit('chatMessageEnd', msg);
      if (mouth) {
        timer?.destroy();
        mouth.setTexture('mouth_1');
      }
    });
  }

  loadingAvatars(tf: boolean) {
    if (!this.systemMsg) return;
    if (tf) {
      for (const avatar of this.avatars) {
        avatar.destroy();
      }
      this.avatars = [];

      this.search = addImage(this, 'search', undefined, {
        bg: this.bg,
        yAnchor: Anchor.center,
        xAnchor: Anchor.center,
      });
      this.tweens.add({
        targets: this.search,
        angle: '-=45',
        yoyo: true,
        repeat: -1,
        ease: 'sine.inout',
        duration: 500,
      });
      this.tweens.add({
        targets: this.systemMsg,
        y: { from: this.systemMsg.y, to: 0 + this.systemMsg.displayHeight },
        ease: 'bounce.out',
        duration: 1000,
        onComplete: () => {
          scaleText(this, this.systemMsg!, this.systemMsg?.text, {
            yAnchor: Anchor.start,
          });
        },
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
      avatar.setX(0 + (avatar.displayWidth + 50) * i);
      avatar.setInteractive({ useHandCursor: true });
      avatar.setData('name', id);
      avatar.on(
        'pointerdown',
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
    EventSystem.emit('avatarSelected', avatar.getData('name'));

    this.selectedAvatar = addImage(this, avatar.getData('name'), undefined, {
      bg: this.bg,
      widthRel: 0.5,
      yAnchor: Anchor.center,
      xAnchor: Anchor.center,
    });
    this.renderMiniAvatar(avatar.getData('name'));

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
    head.setX(0 + head.displayWidth / 2);
    head.setY(this.chatWindow!.y);
    const eyes = addImage(this, 'eyes_1', undefined, {
      bg: head,
      height: head.displayHeight / 8,
    });
    eyes.setY(head.y - eyes.displayHeight / 2);
    const brows = addImage(this, 'brows_1', undefined, {
      bg: head,
      width: eyes.displayWidth * 1.1,
    });
    brows.setY(eyes.y - eyes.displayHeight / 2 - brows.displayHeight / 2);
    const nose = addImage(this, 'nose_1', undefined, {
      bg: head,
      width: eyes.displayWidth / 4,
    });
    nose.setY(eyes.y + eyes.displayHeight / 2 + nose.displayHeight * 0.75);
    const mouth = addImage(this, 'mouth_1', undefined, {
      bg: head,
      width: eyes.displayWidth / 2,
    });
    mouth.setY(nose.y + nose.displayHeight + mouth.displayHeight / 2);

    this.chatAvatar = [mouth, head, brows, nose, eyes];
  }
}

export default AvatarMenu;
