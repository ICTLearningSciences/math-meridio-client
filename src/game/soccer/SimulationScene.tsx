import Phaser from 'phaser';
import EventSystem from '../event-system';
import goalImg from './assets/goal.png';
import ballImg from './assets/ball.png';
import keeperImg from './assets/keeper.png';
import boy1Img from './assets/boy_2.png';
import boy2Img from './assets/boy_3.png';
import boy3Img from './assets/boy_4.png';
import boy4Img from './assets/boy_5.png';

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
  direction?: 'left' | 'right';
  playerId: number;
  avatar: string;
  name: string;

  constructor(config: Phaser.Types.Scenes.SettingsConfig & {
    containerId: string;
    direction?: 'left' | 'right';
    playerId: number;
    avatar: string;
    name: string;
  }) {
    super({ key: `SoccerGame-${config.containerId}` });
    this.containerId = config.containerId;
    this.direction = config.direction;
    this.playerId = config.playerId;
    this.avatar = config.avatar;
    this.name = config.name;
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

    this.add.image(125, 190, this.avatar).setScale(0.015);
    this.add.text(95, 200, this.name, {
      fontSize: '9px', color: '#ffffff'
    } as Phaser.Types.GameObjects.Text.TextStyle);

    this.resultText = this.add.text(110, 8, '', {
      fontSize: '11px', color: '#ffffff'
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
    const keeperDirection = Math.random() < 0.5 ? 'left' : 'right';
    const keeperMove = keeperDirection === 'left' ? 90 : 160;
    targetY = keeperDirection !== direction ? 60 : 100;

    this.physics.moveTo(this.ball, targetX, targetY, 300);
    this.keeper.setX(keeperMove);
    const distance = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, targetX, targetY);
    const travelTime = (distance / 300) * 1000;

    this.time.delayedCall(travelTime, () => {
      this.ball.setVelocity(0, 0);
      this.ball.setPosition(targetX, targetY);
      this.tweens.add({ targets: this.ball, y: 140, duration: 800, ease: 'Linear' });

      const result = keeperDirection !== direction ? 'Score' : 'Saved';
      this.resultText?.setText(result);

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
