/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Phaser from "phaser";

import { Preloader } from "./Preloader";
import { Game } from "./Game";
import { GameOver } from "./GameOver";
import { MainMenu } from "./MainMenu";
import {
  GameObjects,
  IRemoveItem,
  OpenAiServiceModel,
  removeItemSchema,
} from "../../classes/game-state/types";
import { GenericLlmRequest, PromptOutputTypes, PromptRoles } from "../../types";
import { jsonLlmRequest } from "../../classes/game-state/api-helpers";
import { GameStateHandler } from "../../classes/game-state/game-state-handler";
import { ChatMessage } from "../../store/slices/gameData";
import EventSystem from "../event-system";

export interface PlayerStats {
  twoPoint: number;
  threePoint: number;
  freeThrow: number;
  rebound: number;
  block: number;
  steal: number;
  pass: number;
  foul: number;
}
export interface Player extends GameObjects {
  description: string;
  stats: PlayerStats; // base stats defining player skills
  gameStats: PlayerStats; // # of times successfully completed in the game
  totalStats: PlayerStats; // # of times attempted in the game
}

export function BuildPlayerStats(
  twP: number = 0,
  thP: number = 0,
  ft: number = 0,
  rb: number = 0,
  bl: number = 0,
  st: number = 0,
  pa: number = 0,
  fo: number = 0
): PlayerStats {
  return {
    twoPoint: twP / 10,
    threePoint: thP / 10,
    freeThrow: ft / 10,
    rebound: rb / 10,
    block: bl / 10,
    steal: st / 10,
    pass: pa / 10,
    foul: fo / 10,
  };
}
export const PLAYERS: Player[] = [
  {
    clientId: "1",
    name: "Red Bounder",
    description: "Great at blocking short distance shots and getting rebounds.",
    stats: BuildPlayerStats(7, 5, 5, 10, 8, 0, 9, 0),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: "2",
    name: "Purple Wall",
    description: "Great at blocking long distance shots.",
    stats: BuildPlayerStats(5, 5, 7, 8, 10, 0, 9, 0),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: "3",
    name: "Green Menace",
    description: "Great at stealing the ball and drawing fouls. ",
    stats: BuildPlayerStats(5, 5, 8, 0, 0, 10, 7, 9),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: "4",
    name: "Blue Ace",
    description: "Great at scoring 2 pointers.",
    stats: BuildPlayerStats(10, 8, 7, 0, 0, 5, 5, 9),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
  {
    clientId: "5",
    name: "Pink Shooter",
    description: "Great at scoring 3 pointers.",
    stats: BuildPlayerStats(8, 10, 9, 0, 0, 5, 7, 5),
    gameStats: BuildPlayerStats(),
    totalStats: BuildPlayerStats(),
  },
];

export class BasketballStateHandler extends GameStateHandler {
  opponents: GameObjects[];

  constructor() {
    super([]);
    this.opponents = [];
  }

  addPlayer(object: GameObjects) {
    super.addObject(object);
  }

  removePlayer(object: GameObjects) {
    super.removeObject(object);
  }

  addOrRemovePlayer(object: GameObjects) {
    if (this.objects.find((o) => o.clientId === object.clientId)) {
      this.removePlayer(object);
    } else {
      this.objects = [object];
      EventSystem.emit("addPlayer", object);
    }
  }

  async start(): Promise<ChatMessage[]> {
    super.start();
    const shuffled = PLAYERS.sort(() => 0.5 - Math.random());
    this.opponents = shuffled.slice(0, 2);
    const messages = [
      {
        sender: PromptRoles.SYSTEM,
        message:
          "Choose a player to add from the list of players below. Provide just the # or name of the player to add.",
      },
    ];
    PLAYERS.forEach((p) => {
      messages.push({
        sender: PromptRoles.SYSTEM,
        message: `${p.clientId}. ${p.name}: ${p.description}`,
      });
    });
    return messages;
  }

  async respond(msg: ChatMessage): Promise<ChatMessage[]> {
    super.respond(msg);
    if (msg.sender === PromptRoles.USER) {
      const text = msg.message.toLowerCase();
      const player = PLAYERS.find(
        (p) =>
          p.clientId.toLowerCase() === text || p.name.toLowerCase() === text
      );
      if (player) {
        this.addOrRemovePlayer(player);
      } else if (text === "help") {
        return await this.aiPickPlayer();
      }
    }
    return [];
  }

  async aiPickPlayer(): Promise<ChatMessage[]> {
    const request: GenericLlmRequest = {
      prompts: [
        {
          promptText: JSON.stringify(PLAYERS),
          promptRole: PromptRoles.USER,
        },
        {
          promptText:
            "Choose a player to add from the list of players above, provide just the clientId of the player to add.",
          promptRole: PromptRoles.USER,
        },
      ],
      targetAiServiceModel: OpenAiServiceModel,
      outputDataType: PromptOutputTypes.JSON,
      responseFormat: `
        Please only respond in JSON.
        Validate that your response is in valid JSON.
        Respond in this format:
        {
            "clientId": "string" // the clientId of the player to remove
        }
      `,
    };

    const res = await jsonLlmRequest<IRemoveItem>(request, removeItemSchema);
    const player = PLAYERS.find((p) => p.clientId === res.clientId);
    if (player) {
      this.addOrRemovePlayer(player);
    }
    return [
      {
        sender: PromptRoles.ASSISSANT,
        message: `AI assistant picked: ${res.clientId} ${player?.name}`,
      },
    ];
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  backgroundColor: "#282c34",
  scene: [Preloader, MainMenu, Game, GameOver],
};

export default config;
