/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  DiscussionStage,
  IStage,
} from './components/discussion-stage-builder/types';

export enum PromptOutputTypes {
  TEXT = 'TEXT',
  JSON = 'JSON',
}

export interface TargetAiModelServiceType {
  serviceName: string;
  model: string;
}

export enum PromptRoles {
  SYSTEM = 'system',
  USER = 'user',
  ASSISSANT = 'assistant',
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
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

export enum LoadStatus {
  NONE = 0,
  IN_PROGRESS = 1,
  DONE = 2,
  FAILED = 3,
  NOT_LOGGED_IN = 4,
}

export interface LoadingState {
  status: LoadStatus;
  error?: string;
  startedAt?: string;
  endedAt?: string;
  failedAt?: string;
}

export enum AiServiceNames {
  AZURE = 'AZURE_OPEN_AI',
  OPEN_AI = 'OPEN_AI',
  CAMO_GPT = 'CAMO_GPT',
  ASK_SAGE = 'ASK_SAGE',
  GEMINI = 'GEMINI',
  ANTHROPIC = 'ANTHROPIC',
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

export const SIMULTAION_VIEWED_KEY = 'viewed-simulation';

export function getSimulationViewedKey(stageId: string): string {
  return `${SIMULTAION_VIEWED_KEY}-${stageId}`;
}
