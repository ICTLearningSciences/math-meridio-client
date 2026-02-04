/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export enum PromptOutputTypes {
  TEXT = 'TEXT',
  JSON = 'JSON',
}

export interface IStage {
  stageType: 'discussion' | 'simulation';
  clientId: string;
}

export type DiscussionStageStep =
  | SystemMessageStageStep
  | RequestUserInputStageStep
  | PromptStageStep
  | ConditionalActivityStep;

export type DiscussionStageStepGQL =
  | SystemMessageStageStep
  | RequestUserInputStageStep
  | PromptStageStepGql
  | ConditionalActivityStep;

export interface FlowItem {
  clientId: string;
  name: string;
  steps: DiscussionStageStep[];
}

export interface FlowItemGQL {
  clientId: string;
  name: string;
  steps: DiscussionStageStepGQL[];
}

export interface SimulationStage extends IStage {
  _id: string;
  stageType: 'simulation';
}

export function isDiscussionStage(stage: IStage): stage is DiscussionStage {
  return stage.stageType === 'discussion';
}

export interface DiscussionStage extends IStage {
  _id: string;
  stageType: 'discussion';
  title: string;
  description: string;
  flowsList: FlowItem[];
}

export interface DiscussionStageGQL extends IStage {
  _id: string;
  stageType: 'discussion';
  title: string;
  description: string;
  flowsList: FlowItemGQL[];
}

export enum DiscussionStageStepType {
  SYSTEM_MESSAGE = 'SYSTEM_MESSAGE',
  REQUEST_USER_INPUT = 'REQUEST_USER_INPUT',
  PROMPT = 'PROMPT',
  CONDITIONAL = 'CONDITIONAL',
}

export interface StageBuilderStep {
  stepId: string;
  stepType: DiscussionStageStepType;
  lastStep: boolean;
  jumpToStepId?: string;
}

// SystemMessage
export interface SystemMessageStageStep extends StageBuilderStep {
  stepType: DiscussionStageStepType.SYSTEM_MESSAGE;
  message: string;
}

// RequestUserInput
export interface PredefinedResponse {
  clientId: string;
  isArray?: boolean;
  message: string;
  jumpToStepId?: string;
  responseWeight?: string;
}

export interface RequestUserInputStageStep extends StageBuilderStep {
  stepType: DiscussionStageStepType.REQUEST_USER_INPUT;
  message: string;
  saveResponseVariableName: string;
  disableFreeInput: boolean;
  predefinedResponses: PredefinedResponse[];
  requireAllUserInputs: boolean;
}

//Prompt
export enum JsonResponseDataType {
  STRING = 'string',
  OBJECT = 'object',
  ARRAY = 'array',
}

export enum SubJsonResponseDataType {
  STRING = 'string',
  ARRAY = 'array',
}

export interface JsonResponseDataGQL {
  clientId: string;
  stringifiedData: string;
}

export interface JsonResponseData {
  clientId: string;
  name: string;
  type: JsonResponseDataType;
  isRequired: boolean;
  additionalInfo?: string;
  subData?: JsonResponseData[];
}

export interface PromptStageStepGql extends StageBuilderStep {
  stepType: DiscussionStageStepType.PROMPT;
  promptText: string;
  responseFormat: string;
  includeChatLogContext: boolean;
  outputDataType: PromptOutputTypes;
  jsonResponseData?: string;
  customSystemRole: string;
}

export interface PromptStageStep
  extends Omit<PromptStageStepGql, 'jsonResponseData'> {
  jsonResponseData?: JsonResponseData[];
}

// LogicOperation
export enum NumericOperations {
  GREATER_THAN = '>',
  LESS_THAN = '<',
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN_EQUALS = '>=',
  LESS_THAN_EQUALS = '<=',
}

export enum Checking {
  // array or string
  LENGTH = 'LENGTH',
  // string, boolean, number
  VALUE = 'VALUE',
  // array or string
  CONTAINS = 'CONTAINS',
}

export interface LogicStepConditional {
  stateDataKey: string;
  checking: Checking;
  operation: NumericOperations;
  expectedValue: string;
  targetStepId: string;
}

export interface ConditionalActivityStep extends StageBuilderStep {
  stepType: DiscussionStageStepType.CONDITIONAL;
  conditionals: LogicStepConditional[];
}

export enum AiServiceNames {
  AZURE = 'AZURE_OPEN_AI',
  OPEN_AI = 'OPEN_AI',
  GEMINI = 'GEMINI',
  ASK_SAGE = 'ASK_SAGE',
  ANTHROPIC = 'ANTHROPIC',
  CAMO_GPT = 'CAMO_GPT',
}

export interface ServiceModelInfo {
  name: string;
  maxTokens: number;
  supportsWebSearch: boolean;
  onlyAdminUse?: boolean;
  disabled?: boolean;
}


export interface Config {
  aiServiceModelConfigs: AiServiceModelConfigs[];
}

export type AiServiceModelConfigs = {
  serviceName: AiServiceNames;
  modelList: ServiceModelInfo[];
};

export interface Avatar {
    type: string;
    id: string;
    description: string;
    variant?: number;
    variants?: string[];
  }
  
  export interface Player {
    _id: string;
    googleId: string;
    email: string;
    userRole: UserRole;
    loginService: LoginService;
    lastLoginAt: Date;
    educationalRole?: EducationalRole;
    clientId: string;
    name: string;
    description: string;
    avatar: Avatar[];
  }
  
  export enum UserRole {
    USER = 'USER',
    CONTENT_MANAGER = 'CONTENT_MANAGER',
    ADMIN = 'ADMIN',
  }
  
  export enum EducationalRole {
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
  }
  
  export interface UserAccessToken {
    user: Player;
    accessToken: string;
    expirationDate: string;
  }
  
  export enum LoginService {
    GOOGLE = 'GOOGLE',
  }
  