/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import {
  AiServicesResponseTypes,
} from '../ai-services/ai-service-types';
import {
  DiscussionStage,
  IStage,
  StageBuilderStep,
} from '../components/discussion-stage-builder/types';
import {
  ChatMessage,
  GameData,
  GameStateData,
  GlobalStateData,
  PlayerStateData,
  SenderType,
} from '../store/slices/game';
import { GenericLlmRequest } from '../types';
import { CancelToken } from 'axios';
import { Subscriber } from '../store/slices/game/use-with-game-state';
import { Player } from '../store/slices/player';
import { DiscussionStageHandler } from './discussion-stage-handler';

interface UserResponseHandleState {
  responseNavigations: {
    response: string;
    jumpToStepId: string;
  }[];
}

function getDefaultUserResponseHandleState(): UserResponseHandleState {
  return {
    responseNavigations: [],
  };
}

export type CollectedDiscussionData = Record<
  string,
  string | number | boolean | string[]
>;

export interface GameStateHandlerArgs {
  sendMessage: (msg: ChatMessage) => void;
  setResponsePending: (pending: boolean) => void;
  executePrompt: (
    llmRequest: GenericLlmRequest,
    cancelToken?: CancelToken
  ) => Promise<AiServicesResponseTypes>;
  onDiscussionFinished?: (discussionData: CollectedDiscussionData) => void;
  updateRoomGameData(gameData: Partial<GameData>): void;
  defaultStageId?: string;
  stages?: DiscussionStage[];
  player: Player;
  game: Phaser.Types.Core.GameConfig;
  gameData: GameData;
}

export abstract class GameStateHandler implements Subscriber {
  abstract currentStage: IStage | undefined;
  abstract currentStep: StageBuilderStep | undefined;
  abstract discussionStageHandler: DiscussionStageHandler;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateData: CollectedDiscussionData;
  errorMessage: string | null = null;
  userResponseHandleState: UserResponseHandleState;
  stepIdsSinceLastInput: string[]; // used to prevent infinite loops, should never repeat a step until we've had some sort of user input.
  lastFailedStepId: string | null = null;
  sendMessage: (msg: ChatMessage) => void;
  onDiscussionFinished?: (discussionData: CollectedDiscussionData) => void;
  setResponsePending: (pending: boolean) => void; // let parent component know when we are waiting for an async response
  executePrompt: (
    llmRequest: GenericLlmRequest,
    cancelToken?: CancelToken
  ) => Promise<AiServicesResponseTypes>;
  stages: DiscussionStage[];

  player: Player;
  players: Player[] = [];
  chatLog: ChatMessage[] = [];
  acknowledgedChat: string[] = [];
  game: Phaser.Types.Core.GameConfig;
  globalStateData: GlobalStateData;
  playerStateData: PlayerStateData[];
  updateRoomGameData: (gameData: Partial<GameData>) => void;

  constructor(args: GameStateHandlerArgs) {
    const id = args.gameData.globalStateData.curStageId || args.defaultStageId;
    this.player = args.player;
    this.players = args.gameData.players;
    this.chatLog = args.gameData.chat;
    this.acknowledgedChat = args.gameData.chat.map((c) => c.id);
    this.game = args.game;
    this.globalStateData = args.gameData.globalStateData;
    this.playerStateData = args.gameData.playerStateData;
    this.stages = args.stages || [];

    this.stateData = {};
    this.stepIdsSinceLastInput = [];
    this.userResponseHandleState = getDefaultUserResponseHandleState();
    this.sendMessage = args.sendMessage;
    this.updateRoomGameData = args.updateRoomGameData;
    this.executePrompt = args.executePrompt;
    this.setResponsePending = args.setResponsePending;
    this.onDiscussionFinished = args.onDiscussionFinished;

    // bind functions to this
    this.onDiscussionFinished = this.onDiscussionFinished?.bind(this);
  }

  abstract initializeGame(): void;

  /** subscriber functions */

  newChatLogReceived(chatLog: ChatMessage[]) {
    this.chatLog = chatLog;
    this.discussionStageHandler.newChatLogReceived(chatLog);
    const newMessages = chatLog.filter(
      (c) =>
        !this.acknowledgedChat.includes(c.id) &&
        c.sender === SenderType.PLAYER &&
        c.senderId === this.player.clientId
    );
    if (newMessages.length === 0) {
      return;
    }
    for (const newMessage of newMessages) {
      // TODO: notify handlers of new message
      this.acknowledgedChat.push(newMessage.id);
    }
  }

  globalStateUpdated(newGlobalState: GlobalStateData): void {
    this.globalStateData = newGlobalState;
  }

  playerStateUpdated(newGameState: PlayerStateData[]): void {
    this.playerStateData = newGameState;
  }

  playersUpdated(players: Player[]): void {
    this.players = players;
  }

  /** */

  newPlayerStateData(newData: GameStateData[]): void {
    this.updateRoomGameData({
      playerStateData: [
        {
          player: this.player.clientId,
          animation: '',
          gameStateData: newData
        },
      ],
    });
  }
}
