/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Phaser from 'phaser';
import EventSystem from '../event-system';
import goalImg from './assets/goal.png';
import ballImg from './assets/ball.png';
import keeperImg from './assets/keeper.png';
import boy1Img from './assets/boy1.png';
import boy2Img from './assets/boy2.png';
import boy3Img from './assets/boy3.png';
import boy4Img from './assets/boy4.png';
import GoalieAI from './goalieAI';

interface PlayerData {
  id: number;
  avatar: string;
  name: string;
  score: string;
  containerId: string;
  direction?: 'left' | 'right'; // optional for static mode
}

class SoccerGame extends Phaser.Scene {
  containerId: string;
  ball!: Phaser.Physics.Arcade.Image;
  keeper!: Phaser.Physics.Arcade.Image;
  resultText?: Phaser.GameObjects.Text;
  historyText?: Phaser.GameObjects.Text;
  direction?: 'left' | 'right';
  playerId: number;
  avatar: string;
  name: string;
  goalHistory: ('Score' | 'Saved')[] = [];
  goalieAI: GoalieAI;

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig & {
      containerId: string;
      direction?: 'left' | 'right';
      playerId: number;
      avatar: string;
      name: string;
      goalHistory?: ('Score' | 'Saved')[];
    }
  ) {
    super({ key: `SoccerGame-${config.containerId}` });
    this.containerId = config.containerId;
    this.direction = config.direction;
    this.playerId = config.playerId;
    this.avatar = config.avatar;
    this.name = config.name;
    this.goalHistory = config.goalHistory || [];
    this.goalieAI = new GoalieAI();
  }

  preload() {
    this.load.image('goal', goalImg);
    this.load.image('ball', ballImg);
    this.load.image('keeper', keeperImg);
    this.load.image('boy_1', boy1Img);
    this.load.image('boy_2', boy2Img);
    this.load.image('boy_3', boy3Img);
    this.load.image('boy_4', boy4Img);
  }

  create() {
    this.add.image(125, 100, 'goal').setScale(0.15);
    this.ball = this.physics.add.image(127, 170, 'ball').setScale(0.028);
    this.keeper = this.physics.add.image(125, 105, 'keeper').setScale(0.04);
    this.ball.setDepth(1);
    this.keeper.setDepth(0);

    this.add.image(125, 150, this.avatar).setScale(0.15);
    this.add.text(95, 200, this.name, {
      fontSize: '9px',
      color: '#ffffff',
    } as Phaser.Types.GameObjects.Text.TextStyle);

    this.resultText = this.add.text(110, 8, '', {
      fontSize: '11px',
      color: '#ffffff',
    } as Phaser.Types.GameObjects.Text.TextStyle);

    this.historyText = this.add.text(10, 8, '', {
      fontSize: '11px',
      color: '#ffffff',
    } as Phaser.Types.GameObjects.Text.TextStyle);

    if (this.direction) {
      this.shootBall(this.direction);
    } else {
      this.resultText?.setText('');
    }
  }

  shootBall(direction: 'left' | 'right') {
    const targetX = direction === 'left' ? 90 : 160;
    let targetY = 60;
    const keeperDirection = this.goalieAI.getDiveDecision();
    const keeperMove = keeperDirection === 'left' ? 90 : 160;
    targetY = keeperDirection !== direction ? 60 : 100;

    this.physics.moveTo(this.ball, targetX, targetY, 300);
    this.keeper.setX(keeperMove);
    const distance = Phaser.Math.Distance.Between(
      this.ball.x,
      this.ball.y,
      targetX,
      targetY
    );
    const travelTime = (distance / 300) * 1000;

    this.time.delayedCall(travelTime, () => {
      this.ball.setVelocity(0, 0);
      this.ball.setPosition(targetX, targetY);
      this.tweens.add({
        targets: this.ball,
        y: 140,
        duration: 800,
        ease: 'Linear',
      });

      const scoreProb = this.goalieAI.payoffMatrix[direction][keeperDirection];
      const result = Math.random() < scoreProb ? 'Score' : 'Saved';

      this.resultText?.setText(result);

      this.goalHistory.push(result);
      if (this.goalHistory.length > 5) this.goalHistory.shift();

      const dots = this.goalHistory
        .map((r) => (r === 'Score' ? '●' : '○'))
        .join(' ');
      this.historyText?.setText(dots);

      this.goalieAI.recordKick(
        direction,
        result === 'Score' ? 'goal' : 'saved'
      );
      this.goalieAI.updateStrategy();

      EventSystem.emit('simulationEnded', {
        player: String(this.playerId),
        kickLeft: direction === 'left' ? 1 : 0,
        kickRight: direction === 'right' ? 1 : 0,
        kickLeftMade: direction === 'left' && result === 'Score' ? 1 : 0,
        kickRightMade: direction === 'right' && result === 'Score' ? 1 : 0,
        totalPoints: result === 'Score' ? (direction === 'left' ? 1 : 1) : 0,
      });
    });
  }
}

export default SoccerGame;
