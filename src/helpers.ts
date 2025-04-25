/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { ChatMessage, SenderType } from './store/slices/game';
import { GameStateData } from './game/basketball/solution';
import axios from 'axios';
import { localStorageGet, SESSION_ID } from './store/local-storage';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function equals<T>(val1: T, val2: T): boolean {
  return JSON.stringify(val1) === JSON.stringify(val2);
}

export function chatLogToString(chatLog: ChatMessage[], userId?: string) {
  let chatLogString = '';
  const sessionId = localStorageGet(SESSION_ID);
  // Filter by sessionId if exists, also filter by userId if exists
  const sessionChatLog = chatLog.filter((msg) => {
    if (sessionId && msg.sessionId !== sessionId) {
      return false;
    }
    return true;
  });
  const userChatLog = sessionChatLog.filter((msg) => {
    if (msg.sender === SenderType.PLAYER && userId && msg.senderId !== userId) {
      return false;
    }
    return true;
  });
  for (let i = 0; i < userChatLog.length; i++) {
    const msg = userChatLog[i];
    chatLogString += `${msg.senderName || msg.sender}: ${msg.message}\n`;
  }
  return chatLogString;
}

export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
  } catch (e) {
    console.log(`Error parsing string: ${str}`);
    return false;
  }
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arrayNRandom(arr: any[], n: number): any[] {
  let len = arr.length;
  const result = new Array(n),
    taken = new Array(len);
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available');
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

export function randomInt(n: number): number {
  return Math.floor(Math.random() * n);
}

export function arrayGetRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[randomInt(arr.length)];
}

export function isEqual<T>(obj1: T, obj2: T): boolean {
  return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractErrorMessageFromError(err: any | unknown): string {
  if (err?.response?.data) {
    try {
      const error = JSON.stringify(err.response.data);
      return error;
    } catch (err) {
      console.error(err);
    }
  }
  if (err instanceof Error) {
    return err.message;
  } else if (axios.isAxiosError(err)) {
    return err.response?.data || err.message;
  } else {
    try {
      const error = JSON.stringify(err);
      return error;
    } catch (err) {
      return 'Cannot stringify error, unknown error structure';
    }
  }
}

export function didGameStateDataChange(
  prevGameStateData: GameStateData,
  newGameStateData: GameStateData
): boolean {
  return JSON.stringify(prevGameStateData) !== JSON.stringify(newGameStateData);
}
