/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Schema } from "jsonschema";
import { asyncLlmRequest } from "../../api";
import {
  GenericLlmRequest,
  PromptOutputTypes,
  PromptRoles,
  TargetAiModelServiceType,
} from "../../types";
import { jsonLlmRequest } from "./api-helpers";
import {
  GameObjects,
  OpenAiServiceModel,
  IRemoveItem,
  removeItemSchema,
} from "./types";
import { ChatMessage } from "../../store/slices/gameData";

export class GameStateHandler {
  objects: GameObjects[];

  constructor(objects: GameObjects[]) {
    this.objects = objects;
  }

  addObject(object: GameObjects) {
    this.objects.push(object);
  }

  removeObject(object: GameObjects) {
    this.objects = this.objects.filter(
      (obj) => obj.clientId !== object.clientId
    );
    this.testAiRemoveItems = this.testAiRemoveItems.bind(this);
  }

  async start(): Promise<ChatMessage[]> {
    return [];
  }

  async respond(msg: ChatMessage): Promise<ChatMessage[]> {
    return [];
  }

  async testAiRemoveItems() {
    const request: GenericLlmRequest = {
      prompts: [
        {
          promptText: JSON.stringify(this.objects),
          promptRole: PromptRoles.USER,
        },
        {
          promptText:
            "choose an item to remove from the list of objects above, provide just the clientId of the item to remove.",
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
            "clientId": "string" // the clientId of the object to remove
        }
      `,
    };
    const res = await jsonLlmRequest<IRemoveItem>(request, removeItemSchema);
    this.objects = this.objects.filter((obj) => obj.clientId !== res.clientId);
  }
}
