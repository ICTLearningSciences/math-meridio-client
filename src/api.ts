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
  DiscussionStageStepType,
  PromptStageStepGql,
} from './components/discussion-stage-builder/types';
import { GenericLlmRequest } from './types';
import { Player } from './store/slices/player';
import { ChatMessage, GameData, Room } from './store/slices/game';

type OpenAiJobId = string;
export const LLM_API_ENDPOINT =
  process.env.REACT_APP_LLM_API_ENDPOINT || '/docs';
export async function asyncLlmRequest(
  llmRequest: GenericLlmRequest,
  cancelToken?: CancelToken
): Promise<OpenAiJobId> {
  const res = await execHttp<OpenAiJobId>(
    'POST',
    `${LLM_API_ENDPOINT}/generic_llm_request/`,
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

export async function asyncLlmRequestStatus(
  jobId: string,
  cancelToken?: CancelToken
): Promise<AiServicesJobStatusResponseTypes> {
  const res = await execHttp<AiServicesJobStatusResponseTypes>(
    'POST',
    `${LLM_API_ENDPOINT}/generic_llm_request_status/?jobId=${jobId}`,
    {
      dataPath: ['response'],
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
    }
  }
`;

export const fullRoomQueryData = `
  _id
  name
  gameData {
    gameId
    status
    players {
      clientId
      name
      avatar {
        id
        type
      }
      chatAvatar {
        id
        type
      }
    }
    chat {
      id
      sender
      senderId
      senderName
      message
    }
    globalStateData {
      curStageId
      curStepId
      playerState {
        player
        animation
        locationX
        locationY
      }
    }
    gameStateData {
      key
      value
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
        if (typeof _step.jsonResponseData === 'string') {
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
      dataPath: 'addOrUpdateDiscussionStage',
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
            clientId
            name
            description
            avatar {
              id
              type
              description
            }
            chatAvatar {
              id
              type
              description
            }
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

export async function addOrUpdatePlayer(player: Player): Promise<Player> {
  const data = await execGql<Player>(
    {
      query: `
        mutation AddOrUpdatePlayer($player: PlayerInput!) {
          addOrUpdatePlayer(player: $player) {
            clientId
            name
            description
            avatar {
              id
              type
              description
            }
            chatAvatar {
              id
              type
              description
            }
          }
        }`,
      variables: {
        player,
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
    }
  );
  return data;
}

export async function createAndJoinRoom(
  playerId: string,
  gameId: string
): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation CreateAndJoinRoom($playerId: String!, $gameId: String!) {
          createAndJoinRoom(playerId: $playerId, gameId: $gameId) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        playerId,
        gameId,
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
): Promise<boolean> {
  const data = await execGql<boolean>(
    {
      query: `
        mutation LeaveRoom($playerId: String!, $roomId: ID!) {
          leaveRoom(playerId: $playerId, roomId: $roomId)
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

export async function deleteRoom(roomId: string): Promise<boolean> {
  const data = await execGql<boolean>(
    {
      query: `
        mutation DeleteRoom($roomId: ID!) {
          deleteRoom(roomId: $roomId)
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

export async function updateRoomGameData(
  roomId: string,
  gameData: Partial<GameData>
): Promise<Room> {
  const data = await execGql<Room>(
    {
      query: `
        mutation UpdateRoomGameData($roomId: ID!, $gameData: RoomGameDataInputType!) {
          updateRoomGameData(roomId: $roomId, gameData: $gameData) {
            ${fullRoomQueryData}
          }
        }`,
      variables: {
        roomId,
        gameData,
      },
    },
    {
      dataPath: 'updateRoomGameData',
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
        mutation SendMessage($roomId: ID!, $msg: MessageInputType!) {
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