/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { execGql } from './api-helpers';
import { ACCESS_TOKEN_KEY, localStorageGet } from './store/local-storage';
import { RoomHeartBeat } from './store/slices/educational-data/types';
import { GameData, GameDataGQL } from './store/slices/game';
import { Connection } from './types';

const submitProcessedActionsMutation = `
  mutation SubmitProcessedActions($processedActionIds: [String]) {
    submitProcessedActions(processedActionIds: $processedActionIds)
  }
`;

export async function notifyOfProcessedActions(
  processedActionIds: string[]
): Promise<void> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return execGql<void>(
    {
      query: submitProcessedActionsMutation,
      variables: {
        processedActionIds,
      },
    },
    { accessToken: accessToken || undefined }
  );
}

const submitRoomActionMutation = `
  mutation SubmitRoomAction($roomId: String!, $actionType: String!, $payload: String!, $actionSentAt: Date!) {
    submitRoomAction(roomId: $roomId, actionType: $actionType, payload: $payload, actionSentAt: $actionSentAt)
  }
`;

export enum RoomActionType {
  SEND_MESSAGE = 'SEND_MESSAGE',
  LEAVE_ROOM = 'LEAVE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  UPDATE_ROOM = 'UPDATE_ROOM',
  VIEW_SIMULATION = 'VIEW_SIMULATION',
}

export interface RoomActionQueueEntry {
  _id: string;
  roomId: string;
  playerId: string;
  actionType: RoomActionType;
  payload: string;
  actionSentAt: Date;
  processedAt: Date | null;
  source: 'local' | 'cloud';
}

export async function submitRoomAction(
  roomId: string,
  actionType: RoomActionType,
  payload: string,
  actionSentAt: Date
): Promise<void> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return execGql<void>(
    {
      query: submitRoomActionMutation,
      variables: { roomId, actionType, payload, actionSentAt },
    },
    { accessToken: accessToken || undefined }
  );
}

export const roomActionQueueEntryQueryData = `
  actionId
  roomId
  playerId
  actionType
  payload
  actionSentAt
  processedAt
`;

const fetchRoomActionsMutation = `
  query FetchRoomActions($filter: String!, $limit: Int) {
          fetchRoomActions(filter: $filter, limit: $limit) {
            edges {
              node {
                ${roomActionQueueEntryQueryData}
              }
            }
          }
        }
`;

export async function fetchRoomActions(
  roomId: string
): Promise<RoomActionQueueEntry[]> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const filter = encodeURI(
    JSON.stringify({ roomId: roomId, processedAt: null })
  );
  const data = await execGql<Connection<RoomActionQueueEntry>>(
    { query: fetchRoomActionsMutation, variables: { filter, limit: 9999 } },
    { accessToken: accessToken || undefined, dataPath: 'fetchRoomActions' }
  );

  return data.edges.map((edge) => edge.node);
}

const syncRoomDataMutation = `
  mutation SyncRoomData($roomId: ID!, $gameData: GameDataInputType!) {
    syncRoomData(roomId: $roomId, gameData: $gameData) {
      _id
      name
      gameData {
        gameId
        players {
          _id
        }
        chat {
          message
        }
        globalStateData {
          curStageId
          curStepId
          roomOwnerId
        }
        playerStateData {
          player
          animation
        }
      }
    }
  }
`;

export async function syncRoomData(
  roomId: string,
  gameData: GameData
): Promise<void> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);

  const gqlPreparedGameData: GameDataGQL = {
    ...gameData,
    players: gameData.players.map((p) => p._id),
  };
  return execGql<void>(
    {
      query: syncRoomDataMutation,
      variables: { roomId, gameData: gqlPreparedGameData },
    },
    { accessToken: accessToken || undefined }
  );
}

export const heartbeatQueryData = `
  roomId
  userId
  lastHeartBeatAt
`;

const roomHeartBeatMutation = `
  mutation RoomHeartBeat($roomId: ID!) {
    roomHeartBeat(roomId: $roomId) {
      ${heartbeatQueryData}
    }
  }
`;

export async function roomHeartBeat(roomId: string): Promise<void> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return execGql<void>(
    { query: roomHeartBeatMutation, variables: { roomId } },
    { accessToken: accessToken || undefined }
  );
}

const fetchRoomHeartBeatsMutation = `query FetchRoomHeartbeats($filter: String!, limit: Int) {
          fetchRoomHeartbeats(filter: $filter, limit: $limit) {
            edges {
              node {
                ${heartbeatQueryData}
              }
            }
          }
        }`;

export async function fetchRoomHeartBeats(
  roomId: string
): Promise<RoomHeartBeat[]> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const filter = encodeURI(JSON.stringify({ roomId: roomId }));
  const data = await execGql<Connection<RoomHeartBeat>>(
    { query: fetchRoomHeartBeatsMutation, variables: { filter, limit: 9999 } },
    { accessToken: accessToken || undefined, dataPath: 'fetchRoomHeartbeats' }
  );
  return data.edges.map((edge) => edge.node);
}

const fetchRoomHeartBeatsAndActionsMutation = `
  query FetchRoomHeartBeatsAndActions($heartBeatFilter: String!, $actionFilter: String!, $limit: Int) {
          fetchRoomHeartbeats(filter: $heartBeatFilter, limit: $limit) {
            edges {
              node {
                ${heartbeatQueryData}
              }
            }
          }
          fetchRoomActions(filter: $actionFilter, limit: $limit) {
            edges {
              node {
                ${roomActionQueueEntryQueryData}
              }
            }
          }
  }
`;

export interface RoomHeartBeatsAndActions {
  heartBeats: RoomHeartBeat[];
  actions: RoomActionQueueEntry[];
}

export async function fetchRoomHeartBeatsAndActions(
  roomId: string
): Promise<RoomHeartBeatsAndActions> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const heartBeatFilter = encodeURI(JSON.stringify({ roomId: roomId }));
  const actionFilter = encodeURI(
    JSON.stringify({ roomId: roomId, processedAt: null })
  );
  const data = await execGql<{
    heartBeats: Connection<RoomHeartBeat>;
    actions: Connection<RoomActionQueueEntry>;
  }>(
    {
      query: fetchRoomHeartBeatsAndActionsMutation,
      variables: { heartBeatFilter, actionFilter, limit: 9999 },
    },
    {
      accessToken: accessToken || undefined,
      dataPath: 'fetchRoomHeartBeatsAndActions',
    }
  );
  return {
    heartBeats: data.heartBeats.edges.map((edge) => edge.node),
    actions: data.actions.edges.map((edge) => edge.node),
  };
}
