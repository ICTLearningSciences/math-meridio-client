/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Player } from '../player/types';

export enum SenderType {
  PLAYER = 'PLAYER',
  SYSTEM = 'SYSTEM',
}

export enum MessageDisplayType {
  TEXT = 'TEXT',
  PENDING_MESSAGE = 'PENDING_MESSAGE',
}

export interface ChatMessage {
  messageId: string;
  sender: SenderType;
  message: string;
  senderId?: string;
  sessionId: string;
  senderName?: string;
  displayType?: MessageDisplayType;
  disableUserInput?: boolean;
  mcqChoices?: string[];
}

export enum RoomPhase {
  PROCESSING = 'PROCESSING',
  NO_ACTIVE_PROCESSING = 'NO_ACTIVE_PROCESSING',
}

export interface Room {
  _id: string;
  name: string;
  phase: RoomPhase;
  classId?: string;
  gameData: GameData;
}

export interface GameData {
  gameId: string;
  players: Player[];
  chat: ChatMessage[];
  globalStateData: GlobalStateData;
  playerStateData: PlayerStateData;
}

export interface GameDataGQL extends Omit<GameData, 'players'> {
  players: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GameStateData = Record<string, any>;

export type PlayerStateData = Record<string, GameStateData>;

export interface GlobalStateData {
  curStageId: string;
  curStepId: string;
  roomOwnerId: string;
  discussionDataStringified: string;
  gameStateData: GameStateData;
}
