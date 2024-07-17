/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Boot } from './Boot';
import { AvatarCreator } from './AvatarCreator';
import { GameStateHandler } from '../../classes/game-state/game-state-handler';
import { ChatMessage } from '../../store/slices/game';
import { Player } from '../../store/slices/player';

export class AvatarStateHandler extends GameStateHandler {
  constructor(sendMessage: (msg: ChatMessage) => void, player: Player) {
    super(sendMessage, player);
    this.sendMessage = sendMessage;
    this.stages = [];
    this.globalStateData = {
      player,
    };
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  backgroundColor: '#282c34',
  width: 1280,
  height: 720,
  scale: {
    // Fit to window
    mode: Phaser.Scale.FIT,
    // Center vertically and horizontally
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, AvatarCreator],
};

export default config;
