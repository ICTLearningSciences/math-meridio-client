/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CurGameState } from '../../../components/discussion-stage-builder/types';
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
  groupId?: number;
  gameData: GameData;
}

export enum PlayerComputedState {
  NEVER_ACCESSED_ACTIVITY = 'NEVER_ACCESSED_ACTIVITY', // no heartebeat ever recorded
  PAUSED_BY_ADMIN = 'PAUSED_BY_ADMIN', // paused by admin
  REPORTED_AWAY_BY_OTHER_PLAYER = 'REPORTED_AWAY_BY_OTHER_PLAYER',
  REPORTED_AWAY_BY_FRONTEND_DETECTION = 'REPORTED_AWAY_BY_FRONTEND_DETECTION',
  INACTIVE = 'INACTIVE', // no heartbeat in the last 15 seconds
  ACTIVE = 'ACTIVE', // has active heartbeats in the last 15 seconds
}

export interface ReportedAwayStatus {
  isAway: boolean;
  reportedAwayAt?: Date;
  reportedBy?: 'STUDENT' | 'FRONTEND_SYSTEM';
}

export interface PlayerStatusData {
  lastHeartbeatAt?: Date;
  reportedAwayStatus: ReportedAwayStatus;
  pausedByAdmin: boolean;
  computedState: PlayerComputedState;
}

export type UserId = string;
export type PlayerStatusRecord = Record<UserId, PlayerStatusData>;

export interface GameData {
  curGameState: CurGameState;
  gameId: string;
  players: Player[];
  chat: ChatMessage[];
  globalStateData: GlobalStateData;
  playersStatusRecord: PlayerStatusRecord;
  playersGameStateData: PlayerStateData;
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
  gameStateData: GameStateData;
}
