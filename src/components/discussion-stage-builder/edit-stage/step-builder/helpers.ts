/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { v4 as uuid } from "uuid";
import type {
  ConditionalActivityStep,
  EndOfPhaseReflectionStep,
  JsonResponseData,
  PromptStageStep,
  RequestUserInputStageStep,
  StartOfPhaseStep,
  SystemMessageStageStep,
} from "../../types";

export function getDefaultSystemMessage(): SystemMessageStageStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: "SYSTEM_MESSAGE",
    message: "",
    jumpToStepId: "",
  };
}

export function getDefaultStartOfPhase(): StartOfPhaseStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: "START_OF_PHASE",
    phaseTitle: "",
    jumpToStepId: "",
    learningObjectives: [],
  };
}

export function getDefaultRequestUserInputBuilder(): RequestUserInputStageStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: "REQUEST_USER_INPUT",
    message: "",
    saveResponseVariableName: "",
    disableFreeInput: false,
    predefinedResponses: [],
    requireInputType: "SINGLE_RESPONSE_REQUIRED",
    learningObjectives: [],
  };
}

export function getEmptyJsonResponseData(): JsonResponseData {
  return {
    clientId: uuid(),
    name: "",
    type: "string",
    isRequired: false,
    additionalInfo: "",
  };
}

export function defaultPromptBuilder(): PromptStageStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: "PROMPT",
    prompts: [
      {
        processPromptAs: "INDIVIDUALLY",
        promptText: "",
        responseFormat: "",
        outputDataType: "TEXT",
        jsonResponseData: [] as JsonResponseData[],
        customSystemRole: "",
        analyzeLearningObjectives: false,
        includeMessageContext: {
          type: "NONE",
          stepIds: [],
          includeMessagesFromOtherUsers: false,
        },
      },
    ],
    jumpToStepId: "",
  };
}

export function getDefaultEndOfPhaseReflection(): EndOfPhaseReflectionStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: "END_OF_PHASE_REFLECTION",
    parentStartOfPhaseStepId: "",
    skipReflectionCollection: false,
    message: "",
    questions: [""],
    jumpToStepId: "",
  };
}

export function getDefaultConditionalStep(): ConditionalActivityStep {
  return {
    stepId: uuid(),
    stepType: "CONDITIONAL",
    targetStepId: "",
    jumpToStepId: "",
    conditionalsToMeet: [],
    lastStep: false,
  };
}
