/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export enum PromptOutputTypes {
  TEXT = "TEXT",
  JSON = "JSON",
}

export interface TargetAiModelServiceType {
  serviceName: string;
  model: string;
}

export enum PromptRoles {
  SYSTEM = "system",
  USER = "user",
  ASSISSANT = "assistant",
}

export interface PromptConfiguration {
  promptText: string;
  promptRole?: PromptRoles;
}

export interface GenericLlmRequest {
  prompts: PromptConfiguration[];
  targetAiServiceModel: TargetAiModelServiceType;
  outputDataType: PromptOutputTypes;
  systemRole?: string;
  responseFormat?: string;
}

export enum JobStatus {
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
  FAILED = "FAILED",
}

export interface Avatar {
  type: string;
  id: string;
  traits: string[];
}

export interface Player {
  clientId: string;
  name: string;
  avatar: string;
  description: string;
}

export interface ChatMessage {
  clientId: string;
  sender: PromptRoles;
  playerId?: string;
  message: string;
}

export interface Room {
  clientId: string;
  name: string;
  createdAt: string;
  players: string[];
  game: string; // do we need this?
}
