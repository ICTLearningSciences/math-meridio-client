/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { BB_PLAYERS } from ".";
import { jsonLlmRequest } from "../../classes/game-state/api-helpers";
import { GameStateHandler } from "../../classes/game-state/game-state-handler";
import {
  GameObjects,
  OpenAiServiceModel,
  IRemoveItem,
  removeItemSchema,
} from "../../classes/game-state/types";
import {
  ChatMessage,
  PromptRoles,
  GenericLlmRequest,
  PromptOutputTypes,
} from "../../types";

export class BasketballStateHandler extends GameStateHandler {

  constructor() {
    super();
  }

  startGame(): void {

  }

  resetGame(): void {

  }

  setStage(): void {

  }

  nextStage(): void {

  }

  globalStateUpdated(): void {

  }

  addPlayer(object: GameObjects) {
  }

  removePlayer(object: GameObjects) {
  }

  respond(msg: ChatMessage): void {
    // super.respond(msg);
    // if (msg.sender === PromptRoles.USER) {
    //   const text = msg.message.toLowerCase();
    //   const player = BB_PLAYERS.find(
    //     (p) =>
    //       p.clientId.toLowerCase() === text || p.name.toLowerCase() === text
    //   );
    //   if (player) {
    //     this.addOrRemovePlayer(player);
    //   } else if (text === "help") {
    //     return await this.aiPickPlayer();
    //   }
    // }
    // return [];
  }

  // async aiPickPlayer(): Promise<ChatMessage[]> {
  //   const request: GenericLlmRequest = {
  //     prompts: [
  //       {
  //         promptText: JSON.stringify(BB_PLAYERS),
  //         promptRole: PromptRoles.USER,
  //       },
  //       {
  //         promptText:
  //           "Choose a player to add from the list of players above, provide just the clientId of the player to add.",
  //         promptRole: PromptRoles.USER,
  //       },
  //     ],
  //     targetAiServiceModel: OpenAiServiceModel,
  //     outputDataType: PromptOutputTypes.JSON,
  //     responseFormat: `
  //         Please only respond in JSON.
  //         Validate that your response is in valid JSON.
  //         Respond in this format:
  //         {
  //             "clientId": "string" // the clientId of the player to remove
  //         }
  //       `,
  //   };

  //   const res = await jsonLlmRequest<IRemoveItem>(request, removeItemSchema);
  //   const player = BB_PLAYERS.find((p) => p.clientId === res.clientId);
  //   // if (player) {
  //   //   this.addOrRemovePlayer(player);
  //   // }
  //   return [
  //     {
  //       clientId: "",
  //       sender: PromptRoles.ASSISSANT,
  //       message: `AI assistant picked: ${res.clientId} ${player?.name}`,
  //     },
  //   ];
  // }
}
