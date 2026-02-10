/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CancelToken } from 'axios';
import { AiServicesJobStatusResponseTypes } from './ai-services/ai-service-types';
import { execGql, execHttp } from './api-helpers';
import {
  DiscussionStage,
  DiscussionStageGQL,
  DiscussionStageStepType,
  PromptStageStepGql,
} from './components/discussion-stage-builder/types';
import { Connection, GenericLlmRequest } from './types';
import { Player } from './store/slices/player/types';
import { ChatMessage, GameData, Room } from './store/slices/game';
import { extractErrorMessageFromError } from './helpers';
import { Config } from './store/slices/config';
import { userDataQuery } from './store/slices/player/api';
import { ACCESS_TOKEN_KEY, localStorageGet } from './store/local-storage';

type OpenAiJobId = string;
export const LLM_API_ENDPOINT =
  process.env.REACT_APP_LLM_API_ENDPOINT || '/docs';
export async function asyncLlmRequest(
  llmRequest: GenericLlmRequest,
  cancelToken?: CancelToken
): Promise<OpenAiJobId> {
  const res = await execHttp<OpenAiJobId>(
    'POST',
    `${LLM_API_ENDPOINT}/generic_llm_request/?api-version=2025-03-01-preview`,
    {
      dataPath: ['response', 'jobId'],
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

// MODIFIED

// export async function asyncLlmRequestStatus(
//   jobId: string,
//   cancelToken?: CancelToken
// ): Promise<AiServicesJobStatusResponseTypes> {
//   const res = await execHttp<AiServicesJobStatusResponseTypes>(
//     'POST',
//     `${LLM_API_ENDPOINT}/generic_llm_request_status/?jobId=${jobId}`,
//     {
//       dataPath: ['response'],
//       axiosConfig: {
//         cancelToken: cancelToken,
//       },
//     }
//   );
//   return res;
// }

// export async function asyncLlmRequestStatus(
//   jobId: string,
//   cancelToken?: CancelToken
// ): Promise<AiServicesJobStatusResponseTypes> {
//   let res: AiServicesJobStatusResponseTypes;
//   do {
//     try {
//       res = await execHttp<AiServicesJobStatusResponseTypes>(
//         'POST',
//         `${LLM_API_ENDPOINT}/generic_llm_request_status/?jobId=${jobId}&api-version=2025-03-01-preview`,
//         {
//           dataPath: ['response'],
//           axiosConfig: { cancelToken: cancelToken },
//         }
//       );
//     } catch (e: any) {
//       // Instead of logging to console, update an element or alert the user.
//       const resultElement = document.getElementById('result');
//       if (resultElement) {
//         resultElement.textContent =
//           "Error during job status polling: " + e.message;
//       } else {
//         alert("Error during job status polling: " + e.message);
//       }
//       throw e; // or return an error object if you want to handle it gracefully
//     }

//     // Update the webpage with the current result.
//     const resultElement = document.getElementById('result');
//     if (resultElement) {
//       resultElement.textContent = JSON.stringify(res, null, 2);
//     } else {
//       alert("Result: " + JSON.stringify(res, null, 2));
//     }

//     // Wait 2 seconds before polling again if the job is still in progress.
//     if (res.jobStatus === "IN_PROGRESS") {
//       await new Promise(resolve => setTimeout(resolve, 2000));
//     }
//   } while (res.jobStatus === "IN_PROGRESS");

//   return res;
// }

export async function asyncLlmRequestStatus(
  jobId: string,
  cancelToken?: CancelToken
): Promise<AiServicesJobStatusResponseTypes> {
  let res: AiServicesJobStatusResponseTypes;
  do {
    try {
      res = await execHttp<AiServicesJobStatusResponseTypes>(
        'POST',
        `${LLM_API_ENDPOINT}/generic_llm_request_status/?jobId=${jobId}&api-version=2025-03-01-preview`,
        {
          dataPath: ['response'],
          axiosConfig: { cancelToken: cancelToken },
        }
      );
    } catch (e) {
      console.error(
        'Error during job status polling:',
        extractErrorMessageFromError(e)
      );
      throw e;
    }

    // Wait 2 seconds before polling again if the job is still in progress.
    if (res.jobStatus === 'IN_PROGRESS') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } while (res.jobStatus === 'IN_PROGRESS');

  return res;
}

// MODIFIED END

export const fullDiscussionStageQueryData = `
  _id
  clientId
  title
  stageType
  description
  flowsList {
    clientId
    name
    steps {
      ... on SystemMessageStageStepType {
          lastStep
          stepId
          stepType
          jumpToStepId
          message
      }

      ... on RequestUserInputStageStepType {
          lastStep
          stepId
          stepType
          jumpToStepId
          message
          saveResponseVariableName
          disableFreeInput
          requireAllUserInputs
          predefinedResponses{
              clientId
              message
              isArray
              jumpToStepId
              responseWeight
          }
      }

      ... on PromptStageStepType {
          lastStep
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

                                ... on ConditionalActivityStepType {
                              stepId
                              stepType
                              lastStep
                              jumpToStepId
                              conditionals{
                                  stateDataKey
                                  checking
                                  operation
                                  expectedValue
                                  targetStepId
                              }
                          }
    }
  }
`;

export const fullRoomQueryData = `
  _id
  name
  classId
  gameData {
    gameId
    players {
      ${userDataQuery}
    }
    chat {
      id
      message
      sender
      senderId
      senderName
      displayType
      disableUserInput
      mcqChoices
      sessionId
    }
    globalStateData {
      curStageId
      curStepId
      roomOwnerId
      discussionDataStringified
      gameStateData {
        key
        value
      }
    }
    playerStateData {
      player
      animation
      gameStateData {
        key
        value
      }
    }
  }
`;

export function convertDiscussionStageToGQl(
  stage: DiscussionStage
): DiscussionStageGQL {
  const copy: DiscussionStageGQL = JSON.parse(JSON.stringify(stage));
  copy.flowsList.forEach((flow) => {
    flow.steps.forEach((step) => {
      if (step.stepType === DiscussionStageStepType.PROMPT) {
        const _step = step as PromptStageStepGql;
        if (_step.jsonResponseData) {
          _step.jsonResponseData = JSON.stringify(_step.jsonResponseData);
        }
      }
    });
  });
  return copy;
}

export function convertGqlToDiscussionStage(
  stage: DiscussionStageGQL
): DiscussionStage {
  const copy: DiscussionStage = JSON.parse(JSON.stringify(stage));
  copy.flowsList.forEach((flow) => {
    flow.steps.forEach((step) => {
      if (step.stepType === DiscussionStageStepType.PROMPT) {
        const _step = step as PromptStageStepGql;
        if (typeof _step.jsonResponseData === 'string') {
          _step.jsonResponseData = JSON.parse(_step.jsonResponseData as string);
        }
      }
    });
  });
  return copy;
}

export async function addOrUpdateDiscussionStage(
  stage: DiscussionStage,
  password: string
): Promise<DiscussionStage> {
  const res = await execGql<DiscussionStageGQL>(
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
      dataPath: 'addOrUpdateDiscussionStage',
      accessToken: password,
    }
  );
  return convertGqlToDiscussionStage(res);
}

export async function fetchDiscussionStages(): Promise<DiscussionStage[]> {
  const res = await execGql<DiscussionStageGQL[]>(
    {
      query: `query FetchDiscussionStages{
        fetchDiscussionStages {
          ${fullDiscussionStageQueryData}
        }
      }`,
    },
    {
      dataPath: 'fetchDiscussionStages',
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
            ${userDataQuery}
          }
        }`,
      variables: {
        id,
      },
    },
    {
      dataPath: 'fetchPlayer',
    }
  );
  return data;
}

export const fetchPlayersMutation = `
    query FetchPlayers($filter: String!, $limit: Int) {
      fetchPlayers(filter: $filter, limit: $limit) {
        edges {
          node {
            ${userDataQuery}
          }
        }
      }
    }
  `;

export async function fetchPlayers(ids: string[]): Promise<Player[]> {
  const data = await execGql<Connection<Player>>({
    query: fetchPlayersMutation,
    variables: { filter: JSON.stringify({ _id: { in: ids } }), limit: 9999 },
  });
  return data.edges.map((edge) => edge.node);
}

export async function addOrUpdatePlayer(
  playerId: string,
  playerFieldsToUpdate: Partial<Player>
): Promise<Player> {
  const data = await execGql<Player>(
    {
      query: `
        mutation AddOrUpdatePlayer($playerId: String!, $playerFieldsToUpdate: PlayerInput!) {
          addOrUpdatePlayer(playerId: $playerId, playerFieldsToUpdate: $playerFieldsToUpdate) {
            ${userDataQuery}
          }
        }`,
      variables: {
        playerId: playerId,
        playerFieldsToUpdate: playerFieldsToUpdate,
      },
    },
    {
      dataPath: 'addOrUpdatePlayer',
    }
  );
  return data;
}

export async function fetchRooms(game: string): Promise<Room[]> {
  const data = await execGql<Room[]>(
    {
      query: `
        query FetchRooms($game: String!) {
          fetchRooms(game: $game) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        game,
      },
    },
    {
      dataPath: 'fetchRooms',
    }
  );
  return data;
}

export async function fetchRoom(roomId: string): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const data = await execGql<Room>(
    {
      query: `
        query FetchRoom($roomId: ID!) {
          fetchRoom(roomId: $roomId) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        roomId,
      },
    },
    {
      dataPath: 'fetchRoom',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}

export async function createAndJoinRoom(
  playerId: string,
  gameId: string,
  gameName: string,
  persistTruthGlobalStateData: string[],
  classId: string
): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation CreateAndJoinRoom($playerId: String!, $gameId: String!, $gameName: String!, $persistTruthGlobalStateData: [String], $classId: String) {
          createAndJoinRoom(playerId: $playerId, gameId: $gameId, gameName: $gameName, persistTruthGlobalStateData: $persistTruthGlobalStateData, classId: $classId) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        playerId,
        gameId,
        gameName,
        persistTruthGlobalStateData,
        classId,
      },
    },
    {
      dataPath: 'createAndJoinRoom',
    }
  );
  return data;
}

export async function joinRoom(
  playerId: string,
  roomId: string
): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation JoinRoom($playerId: String!, $roomId: ID!) {
          joinRoom(playerId: $playerId, roomId: $roomId) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        playerId,
        roomId,
      },
    },
    {
      dataPath: 'joinRoom',
    }
  );
  return data;
}

export async function renameRoom(name: string, roomId: string): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation RenameRoom($name: String!, $roomId: ID!) {
          renameRoom(name: $name, roomId: $roomId) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        name,
        roomId,
      },
    },
    {
      dataPath: 'renameRoom',
    }
  );
  return data;
}

export async function leaveRoom(
  playerId: string,
  roomId: string
): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation LeaveRoom($playerId: String!, $roomId: ID!) {
          leaveRoom(playerId: $playerId, roomId: $roomId) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        playerId,
        roomId,
      },
    },
    {
      dataPath: 'leaveRoom',
    }
  );
  return data;
}

export async function deleteRoom(roomId: string): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation DeleteRoom($roomId: ID!) {
          deleteRoom(roomId: $roomId){
            _id
            deletedRoom
          }
        }`,
      variables: {
        roomId,
      },
    },
    {
      dataPath: 'deleteRoom',
    }
  );
  return data;
}

export async function updateRoom(
  roomId: string,
  gameData: Partial<GameData>
): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation UpdateRoom($roomId: ID!, $gameData: GameDataInput!) {
          updateRoom(roomId: $roomId, gameData: $gameData) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        roomId,
        gameData,
      },
    },
    {
      dataPath: 'updateRoom',
    }
  );
  return data;
}

export async function sendMessage(
  roomId: string,
  msg: ChatMessage
): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation SendMessage($roomId: ID!, $msg: ChatMessageInput!) {
          sendMessage(roomId: $roomId, msg: $msg) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        roomId,
        msg,
      },
    },
    {
      dataPath: 'sendMessage',
    }
  );
  return data;
}

export async function fetchAbeConfig(): Promise<Config> {
  const abeEndpoint =
    process.env.REACT_APP_ABE_GQL_ENDPOINT || '/graphql/graphql';
  const data = await execGql<Config>(
    {
      query: `
        query FetchConfig {
          fetchConfig {
            aiServiceModelConfigs{
              serviceName
              modelList{
                name
                maxTokens
                supportsWebSearch
              }
            }
          }
        }`,
    },
    {
      dataPath: 'fetchConfig',
      gqlEndpoint: abeEndpoint,
    }
  );
  return data;
}
