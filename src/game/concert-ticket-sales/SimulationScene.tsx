/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import GameScene from '../game-scene';
import { GameStateHandler } from '../../classes/game-state-handler';
import { addBackground, addImage } from '../phaser-helpers';
import EventSystem from '../event-system';
import {
  INSIDE_SHOT_SUCCESS_VALUE,
  MID_SHOT_SUCCESS_VALUE,
  NUMBER_OF_SHOTS,
  OUTSIDE_SHOT_SUCCESS_VALUE,
} from './solution';
import { SenderType } from '../../store/slices/game';
import { localStorageGet, SESSION_ID } from '../../store/local-storage';
export interface BasketballSimulationData {
  player: string;

  outsideShots: number;
  midShots: number;
  insideShots: number;

  outsideShotsMade: number;
  midShotsMade: number;
  insideShotsMade: number;

  totalPoints: number;
}

export interface BasketballShot {
  position: 'outside' | 'mid' | 'inside';
  success: boolean;
}

export class SimulationScene extends GameScene {
  simulation: BasketballSimulationData | undefined;
  shots: BasketballShot[];
  curShot: number;

  constructor() {
    super('Simulation');
    this.simulation = undefined;
    this.shots = [];
    this.curShot = 0;
  }

  preload() {
    super.preload();
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets/basketball');
    this.load.image('court', 'court_side.jpg');
    this.load.image('hoop', 'court_hoop.jpg');
    this.load.image('basketball', 'basketball.png');
  }

  create(handler: GameStateHandler) {
    super.create(handler);
    EventSystem.on('simulate', this.simulate, this);
    this.createScene();
  }

  update() {
    super.update();
  }

  createScene() {
    this.bg = addBackground(this, 'court');
    this.chatWindow?.setY(this.bg.displayHeight / 2);
    this.addChatMessage({
      id: '',
      sender: SenderType.SYSTEM,
      message: 'Select a strategy first to see simulation',
      sessionId: localStorageGet(SESSION_ID) as string,
    });
    super.createScene();
  }

  simulate(simulation: BasketballSimulationData) {
    if (!this.gameStateHandler || !this.bg) return;
    this.chatMsgText?.setAlpha(0);
    this.chatWindow?.setAlpha(0);
    this.simulation = simulation;
    this.destroySprite(this.mySprite);
    this.mySprite = this.renderSpriteAvatar(
      this.gameStateHandler.players.find(
        (p) => p.clientId === simulation.player
      )!.avatar,
      {
        x: this.bg.displayWidth / 2,
        y: 500,
      }
    );
    this.shots = [];
    this.curShot = 0;

    for (
      let i = 0;
      i < Math.ceil(simulation.outsideShots / (NUMBER_OF_SHOTS / 10));
      i++
    ) {
      this.shots.push({
        position: 'outside',
        success: Math.random() <= OUTSIDE_SHOT_SUCCESS_VALUE,
      });
    }
    for (
      let i = 0;
      i < Math.ceil(simulation.midShots / (NUMBER_OF_SHOTS / 10));
      i++
    ) {
      this.shots.push({
        position: 'mid',
        success: Math.random() <= MID_SHOT_SUCCESS_VALUE,
      });
    }
    for (
      let i = 0;
      i < Math.ceil(simulation.insideShots / (NUMBER_OF_SHOTS / 10));
      i++
    ) {
      this.shots.push({
        position: 'inside',
        success: Math.random() <= INSIDE_SHOT_SUCCESS_VALUE,
      });
    }

    this.shootBall();
  }

  shootBall() {
    if (this.curShot >= this.shots.length) {
      EventSystem.emit('simulationEnded', this.simulation);
      return;
    }
    const shot = this.shots[this.curShot];
    const x =
      shot.position === 'outside'
        ? this.bg!.displayWidth * 0.6
        : shot.position === 'mid'
        ? this.bg!.displayWidth * 0.7
        : this.bg!.displayWidth * 0.8;
    let direction = '';
    if (x > this.mySprite[0].x) {
      direction = '_right';
    } else if (x < this.mySprite[0].x) {
      direction = '_left';
    }
    this.playSpriteAnim(this.mySprite, `walk${direction}`);

    if (x === this.mySprite[0].x) {
      this._shoot(shot);
    } else {
      this._runAndShoot(shot, x);
    }
  }

  _runAndShoot(shot: BasketballShot, x: number) {
    this.tweens.add({
      targets: this.mySprite,
      x: x,
      duration: 500,
      onComplete: () => {
        this._shoot(shot);
      },
    });
  }

  _shoot(shot: BasketballShot) {
    // jump
    this.playSpriteAnim(this.mySprite, `jump_right`);
    const hoop = addImage(this, 'hoop', undefined, {
      bg: this.bg,
      heightRel: 1,
    }).setAlpha(0);
    const ball = addImage(this, 'basketball', undefined, {
      bg: this.bg,
      height: this.mySprite[0].displayHeight / 2,
    });
    ball.setX(this.mySprite[0].x);
    ball.setY(this.mySprite[0].y);
    // throw ball
    this.tweens.add({
      targets: ball,
      x: this.bg!.displayWidth * 0.9,
      y: 320,
      duration: 1000,
      onComplete: () => {
        // show whether shot made or not
        hoop.setAlpha(1);
        ball.displayHeight = 200;
        ball.displayWidth = 200;
        ball.setX(this.bg!.displayWidth / 2);
        ball.setY(0);
        this.tweens.add({
          targets: ball,
          x: shot.success ? this.bg!.displayWidth / 2 : 0,
          y: this.bg!.displayHeight,
          duration: 500,
          onComplete: () => {
            ball.destroy();
            hoop.destroy();
            this.curShot++;
            this.shootBall();
          },
        });
      },
    });
  }
}
