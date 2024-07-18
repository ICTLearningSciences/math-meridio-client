/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Scene } from 'phaser';
import { GameStateHandler } from './game-state-handler';
import EventSystem from './event-system';
import { ChatMessage } from '../store/slices/game';
import {
  Avatars,
  CHAT_AVATAR_BROWS,
  CHAT_AVATAR_EYES,
  CHAT_AVATAR_HEADS,
  CHAT_AVATAR_MOUTH,
  CHAT_AVATAR_NOSE,
  SPRITE_ACCESSORY,
  SPRITE_BODY,
  SPRITE_CLOTHES,
  SPRITE_HAIR,
} from '../store/slices/player/use-with-player-state';
import {
  Anchor,
  addBackground,
  addImage,
  addSprite,
  addText,
  animateText,
  scaleText,
} from './phaser-helpers';
import { Avatar } from '../store/slices/player';

export interface RenderAvatars extends Avatars {
  sprite: Phaser.GameObjects.Sprite[];
  chatSprite: Phaser.GameObjects.Image[];
}

/**
 * Abstract class defining a standard phaser game
 */
export abstract class GameScene extends Scene {
  sceneName: string;
  gameStateHandler?: GameStateHandler;

  bg: Phaser.GameObjects.Image | undefined;
  chatWindow: Phaser.GameObjects.Rectangle | undefined;
  systemMsgText: Phaser.GameObjects.Text | undefined;
  chatMsgText: Phaser.GameObjects.Text | undefined;
  messageQueue: ChatMessage[];
  curSystemMessage: ChatMessage | undefined;
  curChatMessage: ChatMessage | undefined;

  mySprite: Phaser.GameObjects.Sprite[];
  myChatAvatar: Phaser.GameObjects.Image[];

  constructor(name: string) {
    super(name);
    this.sceneName = name;
    this.messageQueue = [];
    this.myChatAvatar = [];
    this.mySprite = [];
  }

  preload() {
    // Load the assets for the UI
    this.load.setPath('assets/wordui');
    this.load.image('mic', 'icons/icons_256/microphone.png');
    this.load.image('button', 'buttons/long_buttons/blue_button_complete.png');

    // Load the assets for the avatars
    this.load.setPath('assets/avatar/chat');
    for (const a of [
      ...CHAT_AVATAR_HEADS,
      ...CHAT_AVATAR_EYES,
      ...CHAT_AVATAR_BROWS,
      ...CHAT_AVATAR_NOSE,
    ]) {
      this.load.image(a.id, `${a.id}.png`);
    }
    for (const a of CHAT_AVATAR_MOUTH) {
      this.load.image(a.id, `${a.id}.png`);
      this.load.image(`${a.id}_open`, `${a.id}_open.png`);
      this.load.image(`${a.id}_happy`, `${a.id}_happy.png`);
      this.load.image(`${a.id}_sad`, `${a.id}_sad.png`);
    }

    this.load.setPath('assets/avatar/sprite');
    for (const a of SPRITE_BODY) {
      this.loadSprite(a.id, `body/${a.id}.png`, 32, 32);
    }
    for (const a of SPRITE_CLOTHES) {
      this.loadSprite(a.id, `clothes/${a.id}.png`, 32, 32);
    }
    for (const a of SPRITE_HAIR) {
      this.loadSprite(a.id, `hair/${a.id}.png`, 32, 32);
    }
    for (const a of SPRITE_ACCESSORY) {
      this.loadSprite(a.id, `acc/${a.id}.png`, 32, 32);
    }
  }

  create(handler: GameStateHandler) {
    this.gameStateHandler = handler;

    for (const a of [
      ...SPRITE_BODY,
      ...SPRITE_CLOTHES,
      ...SPRITE_HAIR,
      ...SPRITE_ACCESSORY,
    ]) {
      this.createSpriteAnim(a.id, 'walk', Array.from(Array(8).keys()));
    }

    this.bg = addBackground(this, 'background').setAlpha(0);
    const chatWindow = this.add.rectangle(
      10,
      this.bg.displayHeight * 0.9 - 5,
      1260,
      this.bg.displayHeight * 0.1 - 5,
      0x41eaea,
      1
    );
    chatWindow.setOrigin(0, 0);
    this.chatWindow = this.add.rectangle(
      20,
      this.bg.displayHeight * 0.9 + 5,
      chatWindow.displayWidth - 20,
      chatWindow.displayHeight - 20,
      0x6bffff,
      1
    );
    this.chatWindow.setOrigin(0, 0);

    this.systemMsgText = addText(this, '              ', {
      bg: this.bg,
      yAnchor: Anchor.start,
    })
      .setFontSize(48)
      .setWordWrapWidth(this.bg.displayWidth);
    this.chatMsgText = addText(this, '              ', {
      bg: this.bg,
      yAnchor: Anchor.end,
      xAnchor: Anchor.center,
    }).setFontSize(36);

    EventSystem.on('startGame', this.startGame, this);
    EventSystem.on('resetGame', this.resetGame, this);
    EventSystem.on('addSystemMessage', this.addSystemMessage, this);
    EventSystem.on('addChatMessage', this.addChatMessage, this);
  }

  update() {
    if (this.messageQueue.length > 0 && !this.curSystemMessage) {
      this.curSystemMessage = this.messageQueue.shift();
      this.showSystemMessage(this.curSystemMessage!);
    }
  }

  createScene() {
    EventSystem.emit('sceneCreated', this.sceneName);
  }

  updateScene() {
    EventSystem.emit('sceneUpdated');
  }

  startGame() {
    EventSystem.emit('gameStarted');
  }

  resetGame() {
    EventSystem.emit('gameReset');
  }

  /** shared functions */
  loadSprite(name: string, path: string, w: number, h: number): void {
    this.load.spritesheet(name, path, {
      frameWidth: w,
      frameHeight: h,
    });
  }

  createSpriteAnim(name: string, anim: string, frames: number[]): void {
    this.anims.create({
      key: `${name}_${anim}`,
      frames: this.anims.generateFrameNumbers(name, {
        frames: frames,
      }),
      frameRate: 20,
      repeat: -1,
    });
  }

  renderSpriteAvatar(
    avatar: Avatar[],
    props: { x: number; y: number }
  ): Phaser.GameObjects.Sprite[] {
    const sprites: Phaser.GameObjects.Sprite[] = [];
    avatar.forEach((a) => {
      const sprite = addSprite(this, a.id, 0, {
        bg: this.bg,
        heightRel: 0.1,
      })
        .setName(a.id)
        .setX(props.x)
        .setY(props.y);
      sprites.push(sprite);
    });
    return sprites;
  }

  renderChatAvatar(
    avatar: Avatar[],
    props: { x?: number; y?: number } = {}
  ): Phaser.GameObjects.Image[] {
    const { x, y } = props;
    const head = avatar.find((a) => a.type === 'head')?.id || '';
    const headSprite = addImage(this, head, undefined, {
      bg: this.bg,
      heightRel: 0.2,
    });
    headSprite.setX((x || 0) + headSprite.displayWidth / 2);
    headSprite.setY(y || this.chatWindow!.y);

    const eyes = avatar.find((a) => a.type === 'eyes')?.id || '';
    const eyeSprite = addImage(this, eyes, undefined, {
      bg: headSprite,
      height: headSprite.displayHeight / 8,
    });
    eyeSprite.setY(headSprite.y - eyeSprite.displayHeight / 2);

    const brows = avatar.find((a) => a.type === 'eyebrows')?.id || '';
    const browSprite = addImage(this, brows, undefined, {
      bg: headSprite,
      width: eyeSprite.displayWidth * 1.1,
    });
    browSprite.setY(
      eyeSprite.y - eyeSprite.displayHeight / 2 - browSprite.displayHeight / 2
    );

    const nose = avatar.find((a) => a.type === 'nose')?.id || '';
    const noseSprite = addImage(this, nose, undefined, {
      bg: headSprite,
      width: eyeSprite.displayWidth / 4,
    });
    noseSprite.setY(
      eyeSprite.y +
        eyeSprite.displayHeight / 2 +
        noseSprite.displayHeight * 0.75
    );

    const mouth = avatar.find((a) => a.type === 'mouth')?.id || '';
    const mouthSprite = addImage(this, mouth, undefined, {
      bg: headSprite,
      width: eyeSprite.displayWidth / 2,
    });
    mouthSprite
      .setY(
        noseSprite.y + noseSprite.displayHeight + mouthSprite.displayHeight / 2
      )
      .setName(mouth);

    return [mouthSprite, headSprite, eyeSprite, browSprite, noseSprite];
  }

  /** event functions */

  addSystemMessage(msg: ChatMessage) {
    this.messageQueue.push(msg);
  }

  addChatMessage(msg: ChatMessage) {
    if (!this.chatMsgText || !this.chatWindow) return;
    this.chatMsgText.setText(msg.message);
    this.curChatMessage = msg;
    EventSystem.emit('chatMessageStart', msg);
    this.chatMsgText.setY(
      this.chatWindow.y + this.chatWindow.displayHeight / 2
    );
    const mouth = this.myChatAvatar[0];
    let timer: Phaser.Time.TimerEvent;
    // if (mouth) {
    //   timer = this.time.addEvent({
    //     delay: 100,
    //     loop: true,
    //     callback() {
    //       if (mouth.texture.key.endsWith("_open")) {
    //         mouth.setTexture(mouth.name);
    //       } else {
    //         mouth.setTexture(`${mouth.name}_open`);
    //       }
    //     },
    //   });
    // }
    animateText(this.chatMsgText).then(() => {
      EventSystem.emit('chatMessageEnd', msg);
      if (mouth) {
        timer?.destroy();
        // mouth.setTexture(mouth.name);
      }
    });
  }

  showSystemMessage(msg: ChatMessage) {
    if (!this.systemMsgText) return;
    const msgRef = this.systemMsgText;
    this.tweens.add({
      targets: this.systemMsgText,
      alpha: { from: 1, to: 0 },
      duration: 100,
      onComplete: () => {
        EventSystem.emit('systemMessageStart', msg);
        msgRef.setText(msg.message);
        msgRef.setY(msgRef.displayHeight / 2);
        this.tweens.add({
          targets: this.systemMsgText,
          alpha: { from: 0, to: 1 },
          duration: 1000,
          onComplete: () => {
            this.curSystemMessage = undefined;
          },
        });
      },
    });
  }
}

export default GameScene;
