/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import GameScene from '../game-scene';
import { GameStateHandler } from '../../classes/game-state-handler';
import { addBackground, addImage } from '../phaser-helpers';
import EventSystem from '../event-system';

export interface BasketballSimData {
  player: string;
  outsideShots: number;
  midShots: number;
  insideShots: number;
  outsidePoints: number;
  midPoints: number;
  insidePoints: number;
  outsidePercent: number;
  midPercent: number;
  insidePercent: number;
}

export interface BasketballShot {
  position: 'outside' | 'mid' | 'inside';
  success: boolean;
}

export class SimulationScene extends GameScene {
  simulation: BasketballSimData | undefined;
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
    super.createScene();
  }

  simulate(simulation: BasketballSimData) {
    if (!this.gameStateHandler || !this.bg) return;
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

    for (let i = 0; i < simulation.outsideShots; i++) {
      this.shots.push({
        position: 'outside',
        success: Math.random() > simulation.outsidePercent,
      });
    }
    for (let i = 0; i < simulation.midShots; i++) {
      this.shots.push({
        position: 'mid',
        success: Math.random() > simulation.midPercent,
      });
    }
    for (let i = 0; i < simulation.insideShots; i++) {
      this.shots.push({
        position: 'inside',
        success: Math.random() > simulation.insidePercent,
      });
    }

    this.shootBall();
  }

  shootBall() {
    if (this.curShot >= this.shots.length) return;
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
    // run up to position
    this.tweens.add({
      targets: this.mySprite,
      x: x,
      duration: 1000,
      onComplete: () => {
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
              duration: 1000,
              onComplete: () => {
                ball.destroy();
                hoop.destroy();
                this.curShot++;
                this.shootBall();
              },
            });
          },
        });
      },
    });
  }
}