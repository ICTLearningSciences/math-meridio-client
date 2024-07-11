/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CancelToken } from "axios";
import { AiServicesJobStatusResponseTypes } from "./ai-services/ai-service-types";
import { execGql, execHttp } from "./api-helpers";
import {
  DiscussionStage,
  DiscussionStageStepType,
  PromptStageStepGql,
} from "./components/discussion-stage-builder/types";
import { GenericLlmRequest, Player } from "./types";

type OpenAiJobId = string;
export const LLM_API_ENDPOINT = process.env.GATSBY_LLM_API_ENDPOINT || "/docs";
export async function asyncLlmRequest(
  llmRequest: GenericLlmRequest,
  cancelToken?: CancelToken
): Promise<OpenAiJobId> {
  const res = await execHttp<OpenAiJobId>(
    "POST",
    `${LLM_API_ENDPOINT}/generic_llm_request/`,
    {
      dataPath: ["response", "jobId"],
      axiosConfig: {
        data: {
          llmRequest,
        },
        cancelToken: cancelToken,
      },
    }
  );
  return res;
}

export async function asyncLlmRequestStatus(
  jobId: string,
  cancelToken?: CancelToken
): Promise<AiServicesJobStatusResponseTypes> {
  const res = await execHttp<AiServicesJobStatusResponseTypes>(
    "POST",
    `${LLM_API_ENDPOINT}/generic_llm_request_status/?jobId=${jobId}`,
    {
      dataPath: ["response"],
      axiosConfig: {
        cancelToken: cancelToken,
      },
    }
  );
  return res;
}

export const fullDiscussionStageQueryData = `
                      _id
                      clientId
                      title
                      stageType
                      description
                      flowsList{
                        clientId
                        name
                        steps{
                          ... on SystemMessageStageStepType {
                              stepId
                              stepType
                              jumpToStepId
                              message
                          }

                          ... on RequestUserInputStageStepType {
                              stepId
                              stepType
                              jumpToStepId
                              message
                              saveResponseVariableName
                              disableFreeInput
                              predefinedResponses{
                                  clientId
                                  message
                                  isArray
                                  jumpToStepId
                                  responseWeight
                              }
                          }

                          ... on PromptStageStepType{
                              stepId
                              stepType
                              jumpToStepId
                              promptText
                              responseFormat
                              includeChatLogContext
                              outputDataType
                              jsonResponseData
                              customSystemRole
                          }
                      }
                      }
`;

export function convertDiscussionStageToGQl(
  stage: DiscussionStage
): DiscussionStage {
  const copy: DiscussionStage = JSON.parse(JSON.stringify(stage));
  copy.flowsList.forEach((flow) => {
    flow.steps.forEach((step) => {
      if (step.stepType === DiscussionStageStepType.PROMPT) {
        const _step: PromptStageStepGql = step as PromptStageStepGql;
        if (_step.jsonResponseData) {
          _step.jsonResponseData = JSON.stringify(_step.jsonResponseData);
        }
      }
    });
  });
  return copy;
}

export function convertGqlToDiscussionStage(
  stage: DiscussionStage
): DiscussionStage {
  const copy: DiscussionStage = JSON.parse(JSON.stringify(stage));
  copy.flowsList.forEach((flow) => {
    flow.steps.forEach((step) => {
      if (step.stepType === DiscussionStageStepType.PROMPT) {
        const _step: PromptStageStepGql = step as PromptStageStepGql;
        if (typeof _step.jsonResponseData === "string") {
          _step.jsonResponseData = JSON.parse(_step.jsonResponseData as string);
        }
      }
    });
  });
  return copy;
}

export async function addOrUpdateDiscussionStage(
  stage: DiscussionStage
): Promise<DiscussionStage> {
  const res = await execGql<DiscussionStage>(
    {
      query: `mutation AddOrUpdateDiscussionStage($stage: DiscussionStageInputType!) {
        addOrUpdateDiscussionStage(stage: $stage) {
            ${fullDiscussionStageQueryData}
            }
       }`,
      variables: {
        stage: convertDiscussionStageToGQl(stage),
      },
    },
    {
      dataPath: "addOrUpdateDiscussionStage",
    }
  );
  return convertGqlToDiscussionStage(res);
}

export async function fetchDiscussionStages(): Promise<DiscussionStage[]> {
  const res = await execGql<DiscussionStage[]>(
    {
      query: `query FetchDiscussionStages{
        fetchDiscussionStages { 
            ${fullDiscussionStageQueryData}
        }
}`,
    },
    {
      dataPath: "fetchDiscussionStages",
    }
  );
  return res.map(convertGqlToDiscussionStage);
}

export async function fetchPlayer(id: string): Promise<Player> {
  const data = await execGql<Player>(
    {
      query: `
        query FetchPlayer($id: String!) {
          fetchPlayer(id: $id) {
            clientId
            name
            avatar
            description
          }
        }`,
      variables: {
        id,
      },
    },
    {
      dataPath: "fetchPlayer",
    }
  );
  return data;
}

export async function addOrUpdatePlayer(player: Player): Promise<Player> {
  const data = await execGql<Player>(
    {
      query: `
        mutation AddOrUpdatePlayer($player: PlayerInput!) {
          addOrUpdatePlayer(player: $player) {
            clientId
            name
            avatar
            description
          }
        }`,
      variables: {
        player,
      },
    },
    {
      dataPath: "addOrUpdatePlayer",
    }
  );
  return data;
}
