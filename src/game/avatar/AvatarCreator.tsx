/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { GameStateHandler } from '../../classes/game-state/game-state-handler';
import GameScene, { RenderAvatars } from '../../classes/game-state/game-scene';
import EventSystem from '../event-system';
import { Anchor, addImage, scaleText } from '../phaser-helpers';
import { Avatars } from '../../store/slices/player/use-with-player';

export class AvatarCreator extends GameScene {
  avatars: RenderAvatars[];
  search: Phaser.GameObjects.Image | undefined;

  constructor() {
    super('AvatarCreator');
    this.avatars = [];
    this.messageQueue = [];
  }

  preload() {
    super.preload();
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');
    this.load.image('search', 'wordui/icons/icons_256/looking_glass_2.png');
  }

  create(handler: GameStateHandler) {
    super.create(handler);
    EventSystem.on('loadingAvatars', this.loadingAvatars, this);
    EventSystem.on('showAvatars', this.showAvatars, this);
    this.createScene();
  }

  update() {
    super.update();
  }

  createScene() {
    this.search = addImage(this, 'search', undefined, {
      bg: this.bg,
      yAnchor: Anchor.center,
      xAnchor: Anchor.center,
    }).setAlpha(0);
    this.tweens.add({
      targets: this.search,
      angle: '-=45',
      yoyo: true,
      repeat: -1,
      ease: 'sine.inout',
      duration: 500,
    });
    super.createScene();
  }

  // event handlers

  destroyAvatars() {
    for (const avatar of this.avatars) {
      avatar.sprite.forEach((s) => s.destroy());
      avatar.chatSprite.forEach((s) => s.destroy());
    }
    this.avatars = [];
    this.myChatAvatar?.forEach((a) => a.destroy());
    this.myChatAvatar = [];
  }

  loadingAvatars(tf: boolean) {
    if (tf) {
      this.search?.setAlpha(1);
      this.destroyAvatars();
    } else {
      this.search?.setAlpha(0);
    }
  }

  showAvatars(avatars: Avatars[]) {
    this.destroyAvatars();

    let x = 50;
    const y = this.bg!.displayHeight / 2;
    for (let i = 0; i < avatars.length; i++) {
      const a = avatars[i];
      const chatAvatar = this.renderChatAvatar(a.chatAvatar, { x, y });
      const spriteAvatar = this.renderSpriteAvatar(a.avatar, {
        x: x + chatAvatar[1].displayWidth / 2,
        y: y + chatAvatar[1].displayHeight,
      });
      x += chatAvatar[1].displayWidth + 50;

      chatAvatar[1].setInteractive();
      chatAvatar[1].on(
        'pointerdown',
        () => {
          this.selectAvatar(a, i);
        },
        this
      );
      spriteAvatar[0].setInteractive();
      spriteAvatar[0].on('pointerover', function () {
        spriteAvatar.forEach((s) => s.play(`${s.name}_walk`));
      });
      spriteAvatar[0].on('pointerout', function () {
        spriteAvatar.forEach((s) => s.stop());
      });

      this.tweens.add({
        targets: [...spriteAvatar, ...chatAvatar],
        alpha: { from: 0, to: 1 },
        duration: 1000,
        delay: i * 100,
      });

      this.avatars.push({
        ...a,
        sprite: spriteAvatar,
        chatSprite: chatAvatar,
      });
    }
  }

  selectAvatar(avatar: Avatars, i: number) {
    EventSystem.emit('avatarSelected', avatar);
    this.myChatAvatar?.forEach((a) => a.destroy());
    this.myChatAvatar = [];
    for (let n = 0; n < this.avatars.length; n++) {
      const a = this.avatars[n];
      if (i === n) {
        a.chatSprite.forEach((s) => s.setAlpha(1));
        a.sprite.forEach((s) => s.setAlpha(1));
      } else {
        a.chatSprite.forEach((s) => s.setAlpha(0.2));
        a.sprite.forEach((s) => s.setAlpha(0.2));
      }
    }
    this.myChatAvatar = this.renderChatAvatar(avatar.chatAvatar);
  }
}
