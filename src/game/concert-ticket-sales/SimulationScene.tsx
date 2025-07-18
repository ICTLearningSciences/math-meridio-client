/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import GameScene from '../game-scene';
import { GameStateHandler } from '../../classes/game-state-handler';
import {
  addBackground,
  addSprite,
  addText,
  scaleText,
} from '../phaser-helpers';
import EventSystem from '../event-system';
import {
  VIP_TICKET_CONVERSION_RATE,
  RESERVED_TICKET_CONVERSION_RATE,
  TOTAL_NUMBER_OF_TICKETS,
  GENERAL_ADMISSION_TICKET_CONVERSION_RATE,
  GENERAL_ADMISSION_TICKET_PRICE,
  RESERVED_TICKET_PRICE,
  VIP_TICKET_PRICE,
} from '.';
import { SenderType } from '../../store/slices/game';
import { localStorageGet, SESSION_ID } from '../../store/local-storage';
import { Avatar, Player } from '../../store/slices/player';
import { arrayNRandom, getRandomAvatar, getRandomNumber } from '../../helpers';

export interface ConcertTicketSalesSimulationData {
  player: string;
  playerAvatar?: Player;
  // how many we propose to put up for sale
  generalAdmissionTicketsUpForSale: number;
  reservedTicketsUpForSale: number;
  vipTicketsUpForSale: number;
  // how many we actually sold
  generalAdmissionTicketsSold: number;
  reservedTicketsSold: number;
  vipTicketsSold: number;
  // profit
  totalProfit: number;
}

export interface ConcertTicketSaleAttempt {
  ticketType: 'generalAdmission' | 'reserved' | 'vip';
  avatar: Avatar[];
  success: boolean;
}

export class SimulationScene extends GameScene {
  simulation: ConcertTicketSalesSimulationData | undefined;
  tiles: Phaser.GameObjects.Sprite[];
  tickets: ConcertTicketSaleAttempt[];
  curTicket: number;
  profit: number;

  numVip: number;
  numReserved: number;
  numGeneral: number;
  vipText?: Phaser.GameObjects.Text;
  reservedText?: Phaser.GameObjects.Text;
  generalText?: Phaser.GameObjects.Text;
  profitText?: Phaser.GameObjects.Text;

  constructor() {
    super('Simulation');
    this.simulation = undefined;
    this.tiles = [];
    this.tickets = [];
    this.curTicket = 0;
    this.profit = 0;
    this.numVip = 0;
    this.numReserved = 0;
    this.numGeneral = 0;
  }

  preload() {
    super.preload();
    // Load the assets for the game
    this.load.setPath('assets/concert');
    this.load.image('money', 'money.png');
    this.load.image('bg_tickets', 'map_tickets.png');
    this.load.spritesheet('doors', 'doors.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('emotes', 'emotes.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create(handler: GameStateHandler) {
    super.create(handler);
    EventSystem.on('simulate', this.simulate, this);
    this.anims.create({
      key: 'door_open',
      frames: this.anims.generateFrameNumbers('doors', {
        start: 0,
        end: 6,
      }),
      frameRate: 30,
      repeat: 0,
    });
    this.anims.create({
      key: 'emote_angry',
      frames: this.anims.generateFrameNumbers('emotes', {
        start: 8 * 4,
        end: 8 * 5,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'emote_music',
      frames: this.anims.generateFrameNumbers('emotes', {
        start: 8 * 2,
        end: 8 * 3,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.createScene();
  }

  update() {
    super.update();
  }

  createScene() {
    this.bg = addBackground(this, 'bg_tickets');
    this.chatWindow?.setY(this.bg.displayHeight / 2);
    this.addChatMessage({
      id: '',
      sender: SenderType.SYSTEM,
      message: 'Select a strategy first to see simulation',
      sessionId: localStorageGet(SESSION_ID) as string,
    });
    super.createScene();
  }

  simulate(simulation: ConcertTicketSalesSimulationData) {
    if (!this.gameStateHandler || !this.bg) return;
    this.chatMsgText?.setAlpha(0);
    this.chatWindow?.setAlpha(0);
    this.simulation = simulation;
    this.destroySprite(this.mySprite);
    this.tickets = [];
    this.curTicket = 0;
    for (
      let i = 0;
      i <
      Math.ceil(
        simulation.generalAdmissionTicketsUpForSale /
          (TOTAL_NUMBER_OF_TICKETS / 10)
      );
      i++
    ) {
      this.tickets.push({
        ticketType: 'generalAdmission',
        success: Math.random() <= GENERAL_ADMISSION_TICKET_CONVERSION_RATE,
        avatar: getRandomAvatar(),
      });
    }
    for (
      let i = 0;
      i <
      Math.ceil(
        simulation.reservedTicketsUpForSale / (TOTAL_NUMBER_OF_TICKETS / 10)
      );
      i++
    ) {
      this.tickets.push({
        ticketType: 'reserved',
        success: Math.random() <= RESERVED_TICKET_CONVERSION_RATE,
        avatar: getRandomAvatar(),
      });
    }
    for (
      let i = 0;
      i <
      Math.ceil(
        simulation.vipTicketsUpForSale / (TOTAL_NUMBER_OF_TICKETS / 10)
      );
      i++
    ) {
      this.tickets.push({
        ticketType: 'vip',
        success: Math.random() <= VIP_TICKET_CONVERSION_RATE,
        avatar: getRandomAvatar(),
      });
    }
    this.tickets = arrayNRandom(this.tickets, this.tickets.length);
    this.simulateTickets();
    // this.simulateConcert();
  }

  simulateTickets() {
    this.curTicket = 0;
    this.numVip = 0;
    this.numReserved = 0;
    this.numGeneral = 0;
    this.profit = 0;
    this._createTicketScene();
    this.buyTickets();
  }

  simulateConcert() {
    this.curTicket = 0;
    this._createConcertScene();
    this.playConcert();
  }

  buyTickets() {
    if (this.curTicket >= this.tickets.length) {
      EventSystem.emit('simulationEnded', this.simulation);
      // this.simulateConcert();
      return;
    }
    const gameHeight = this.bg!.displayHeight;
    const gameWidth = this.bg!.displayWidth;
    const ticket = this.tickets[this.curTicket];
    const type = ticket.ticketType;
    const xOffset = type === 'vip' ? 0.235 : type === 'reserved' ? 0.345 : 0.45;
    const sprite = this.renderSpriteAvatar(ticket.avatar, {
      x: gameWidth * xOffset,
      y: gameHeight,
      scale: 0.2,
    });
    this.playSpriteAnim(sprite, `walk`);

    this.tweens.add({
      targets: sprite,
      y: gameHeight * 0.35,
      duration: 500,
      onComplete: () => {
        const bubble = addSprite(this, 'emotes', 0, {
          x: sprite[0].x,
          y: sprite[0].y - 30,
          heightRel: 0.1,
        });
        bubble.setDepth(1000);
        // bought ticket
        if (ticket.success) {
          if (type === 'vip')
            scaleText(this, this.vipText!, `${++this.numVip}`);
          else if (type === 'reserved')
            scaleText(this, this.reservedText!, `${++this.numReserved}`);
          else scaleText(this, this.generalText!, `${++this.numGeneral}`);
          this.playSpriteAnim(sprite, 'walk_right');
          this.tiles.push(
            addSprite(this, 'money', 0, {
              x: getRandomNumber(gameWidth * 0.65, gameWidth * 0.85),
              y: getRandomNumber(gameHeight * 0.7, gameHeight * 0.9),
              heightRel: 0.1,
            })
          );
          bubble.play('emote_music');
          this.tweens.add({
            targets: bubble,
            x: gameWidth * 0.8,
            duration: 500,
            delay: 100,
            onComplete: () => {
              bubble.destroy();
            },
          });
          this.tweens.add({
            targets: sprite,
            x: gameWidth * 0.8,
            duration: 500,
            delay: 100,
            onComplete: () => {
              this.tiles[0].play('door_open');
              this.playSpriteAnim(sprite, `walk`);
              if (type === 'vip') this.profit += VIP_TICKET_PRICE;
              else if (type === 'reserved')
                this.profit += RESERVED_TICKET_PRICE;
              else this.profit += GENERAL_ADMISSION_TICKET_PRICE;
              scaleText(this, this.profitText!, `$${this.profit}`);
              this.curTicket++;
              this.destroySprite(sprite);
              this.buyTickets();
            },
          });
        }
        // didn't buy ticket
        else {
          this.playSpriteAnim(sprite, 'walk_left');
          bubble.play('emote_angry');
          this.tweens.add({
            targets: bubble,
            x: -100,
            duration: 500,
            delay: 100,
            onComplete: () => {
              bubble.destroy();
            },
          });
          this.tweens.add({
            targets: sprite,
            x: -100,
            duration: 500,
            delay: 100,
            onComplete: () => {
              this.curTicket++;
              this.destroySprite(sprite);
              this.buyTickets();
            },
          });
        }
      },
    });
  }

  playConcert() {
    if (this.curTicket >= this.tickets.length) {
      EventSystem.emit('simulationEnded', this.simulation);
      return;
    }
  }

  _loadSpriteSheet(name: string, path: string) {
    this.load.spritesheet(name, `32px/${path}.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  _createTicketScene() {
    for (const tile of this.tiles) {
      tile.destroy();
    }
    this.tiles = [];
    this.bg = addBackground(this, 'bg_tickets');
    const bg = this.bg;
    this.vipText?.destroy();
    this.reservedText?.destroy();
    this.generalText?.destroy();
    this.profitText?.destroy();

    this.vipText = addText(this, `${0}`, {
      bg,
      heightRel: 0.1,
      x: bg!.displayWidth * -0.26,
      y: bg!.displayHeight * -0.3,
      maxFontSize: 78,
    });
    this.vipText.setDepth(1000);
    this.reservedText = addText(this, `${0}`, {
      bg,
      heightRel: 0.1,
      x: bg!.displayWidth * -0.16,
      y: bg!.displayHeight * -0.3,
      maxFontSize: 78,
    });
    this.reservedText.setDepth(1000);
    this.generalText = addText(this, `${0}`, {
      bg,
      heightRel: 0.1,
      x: bg!.displayWidth * -0.055,
      y: bg!.displayHeight * -0.3,
      maxFontSize: 78,
    });
    this.generalText.setDepth(1000);
    this.profitText = addText(this, `$${0}`, {
      bg,
      heightRel: 0.1,
      x: bg!.displayWidth * 0.28,
      y: bg!.displayHeight * -0.35,
      maxFontSize: 78,
    });
    this.profitText.setDepth(1000);

    const door = addSprite(this, 'doors', 0, {
      heightRel: 0.2,
      x: this.bg!.displayWidth * 0.79,
      y: this.bg!.displayHeight * 0.39,
    });
    this.tiles.push(door);
  }

  _createConcertScene() {
    for (const tile of this.tiles) {
      tile.destroy();
    }
    this.tiles = [];
    this.bg = addBackground(this, 'bg_tickets');

    this.vipText?.destroy();
    this.reservedText?.destroy();
    this.generalText?.destroy();
    this.profitText?.destroy();
  }
}
