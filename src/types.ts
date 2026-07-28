/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import type {
  DiscussionStage,
  IStage,
} from "./components/discussion-stage-builder/types";
import type { Player } from "./store/slices/player/types";

export type PromptOutputTypes = "TEXT" | "JSON";
export type PromptRoles = "system" | "user" | "assistant";
export type JobStatus = "QUEUED" | "IN_PROGRESS" | "COMPLETE" | "FAILED";
export type LoadStatus = 0 | 1 | 2 | 3 | 4;
export type AiServiceNames =
  | "AZURE_OPEN_AI"
  | "OPEN_AI"
  | "CAMO_GPT"
  | "ASK_SAGE"
  | "GEMINI"
  | "ANTHROPIC";

export interface TargetAiModelServiceType {
  serviceName: string;
  model: string;
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

export interface LoadingState {
  status: LoadStatus;
  error?: string;
  startedAt?: string;
  endedAt?: string;
  failedAt?: string;
}

export interface ServiceModelInfo {
  name: string;
  maxTokens: number;
  supportsWebSearch: boolean;
  onlyAdminUse?: boolean;
  disabled?: boolean;
}

export type AiServiceModelConfigs = {
  serviceName: AiServiceNames;
  modelList: ServiceModelInfo[];
};

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

export type DiscussionCurrentStage = CurrentStage<DiscussionStage>;

export interface CurrentStage<T extends IStage> {
  id: string;
  stage: T;
  action?: () => void;
  beforeStart?: () => void;
  getNextStage: (collectedData: CollectedDiscussionData) => IStage;
}
export type CollectedDiscussionData = Record<
  string,
  string | number | boolean | string[]
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SolutionGameStateData = Record<string, any>;

export const SIMULTAION_VIEWED_KEY = "viewed-simulation";

export function getSimulationViewedKey(stageId: string): string {
  return `${SIMULTAION_VIEWED_KEY}-${stageId}`;
}

export interface GamePhaseReflections {
  roomId: string;
  stepId: string;
  phaseId: string;
  question: string;
  roundNumber: number;
  reflections: Record<string, string>; // keyed by player ID
}

export interface SkillsMet {
  playersMet: Player[];
  players: Player[];
}
