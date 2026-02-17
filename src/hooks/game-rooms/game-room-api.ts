/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fullRoomQueryData } from '../../api';
import { execGql } from '../../api-helpers';
import {
  localStorageGet,
  ACCESS_TOKEN_KEY,
  SESSION_ID,
} from '../../store/local-storage';
import { GameStateData, Room } from '../../store/slices/game/types';

export const createNewGameRoomMutation = `
  mutation CreateNewGameRoom($gameId: String!, $classId: String) {
    createNewGameRoom(gameId: $gameId, classId: $classId) {
      ${fullRoomQueryData}
    }
  }
`;

export async function createNewGameRoom(
  gameId: string,
  gameName: string,
  classId?: string
): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const data = await execGql<Room>(
    {
      query: createNewGameRoomMutation,
      variables: {
        gameId,
        gameName,
        classId,
      },
    },
    {
      dataPath: 'createNewGameRoom',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}

export const pingGameRoomProcessMutation = `
  mutation PingGameRoomProcess($roomId: String!, $sessionId: String!) {
    pingGameRoomProcess(roomId: $roomId, sessionId: $sessionId) {
      ${fullRoomQueryData}
    }
  }
`;

export async function pingGameRoomProcess(roomId: string): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const sessionId = localStorageGet<string>(SESSION_ID) || '';
  const data = await execGql<Room>(
    {
      query: pingGameRoomProcessMutation,
      variables: { roomId, sessionId },
    },
    {
      dataPath: 'pingGameRoomProcess',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}

export const sendMessageToGameRoomMutation = `
  mutation SendMessageToGameRoom($roomId: ID!, $message: String!, $sessionId: String!) {
    sendMessageToGameRoom(roomId: $roomId, message: $message, sessionId: $sessionId) {
      ${fullRoomQueryData}
    }
  }
`;

export async function sendMessageToGameRoom(
  roomId: string,
  message: string
): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const sessionId = localStorageGet<string>(SESSION_ID) || '';
  const data = await execGql<Room>(
    {
      query: sendMessageToGameRoomMutation,
      variables: { roomId, message, sessionId },
    },
    {
      dataPath: 'sendMessageToGameRoom',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}

export const leaveGameRoomMutation = `
  mutation LeaveGameRoom($roomId: String!) {
    leaveGameRoom(roomId: $roomId) {
      ${fullRoomQueryData}
    }
  }
`;

export async function leaveGameRoom(roomId: string): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const data = await execGql<Room>(
    {
      query: leaveGameRoomMutation,
      variables: { roomId },
    },
    {
      dataPath: 'leaveGameRoom',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}

export const joinGameRoomMutation = `
  mutation JoinGameRoom($roomId: String!) {
    joinGameRoom(roomId: $roomId) {
       ${fullRoomQueryData}
    }
  }
`;

export async function joinGameRoom(roomId: string): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const data = await execGql<Room>(
    {
      query: joinGameRoomMutation,
      variables: { roomId },
    },
    {
      dataPath: 'joinGameRoom',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}

export const viewGameRoomSimulationMutation = `
  mutation ViewGameRoomSimulation($roomId: String!) {
    viewGameRoomSimulation(roomId: $roomId) {
       ${fullRoomQueryData}
    }
  }
`;

export async function viewGameRoomSimulation(roomId: string): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const data = await execGql<Room>(
    {
      query: viewGameRoomSimulationMutation,
      variables: { roomId },
    },
    {
      dataPath: 'viewGameRoomSimulation',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}

const updatePlayerGameStateDataMutation = `
  mutation UpdatePlayerGameStateData($roomId: String!, $playerId: String!, $newPlayerGameStateData: JSON!) {
    updatePlayerGameStateData(roomId: $roomId, playerId: $playerId, newPlayerGameStateData: $newPlayerGameStateData) {
      ${fullRoomQueryData}
    }
  }
`;

export async function updatePlayerGameStateData(
  roomId: string,
  playerId: string,
  newPlayerGameStateData: GameStateData
): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  const data = await execGql<Room>(
    {
      query: updatePlayerGameStateDataMutation,
      variables: { roomId, playerId, newPlayerGameStateData },
    },
    {
      dataPath: 'updatePlayerGameStateData',
      accessToken: accessToken || undefined,
    }
  );
  return data;
}
