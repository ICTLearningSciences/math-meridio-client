/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { AiServicesResponseTypes } from '../ai-services/ai-service-types';
import {
  DiscussionStage,
  DiscussionStageStep,
  isDiscussionStage,
  IStage,
} from '../components/discussion-stage-builder/types';
import {
  ChatMessage,
  GameData,
  GameStateData,
  GlobalStateData,
  PlayerStateData,
  SenderType,
} from '../store/slices/game';
import { GenericLlmRequest, TargetAiModelServiceType } from '../types';
import { CancelToken } from 'axios';
import { Subscriber } from '../store/slices/game/use-with-game-state';
import { Player } from '../store/slices/player/types';
import { DiscussionStageHandler } from './discussion-stage-handler';
import { CurrentStage, DiscussionCurrentStage } from '../game/basketball';
import { getFirstStepId } from '../helpers';

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
  updateRoomGameData: (gameData: Partial<GameData>) => void;
  defaultStageId?: string;
  stages?: DiscussionStage[];
  player: Player;
  game: Phaser.Types.Core.GameConfig;
  gameData: GameData;
  viewedSimulation: (playerId: string) => void;
  targetAiServiceModel: TargetAiModelServiceType;
  onWaitingForPlayers: (waitingForPlayerIds: string[]) => void;
}

export abstract class GameStateHandler implements Subscriber {
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
  dbDiscussionStages: DiscussionStage[];
  stageList: CurrentStage<IStage>[] = [];
  viewedSimulation: (playerId: string) => void;
  onWaitingForPlayers: (waitingForPlayerIds: string[]) => void;
  player: Player;
  players: Player[] = [];
  chatLog: ChatMessage[] = [];
  acknowledgedChat: string[] = [];
  game: Phaser.Types.Core.GameConfig;
  globalStateData: GlobalStateData;
  playerStateData: PlayerStateData[];
  updateRoomGameData: (gameData: Partial<GameData>) => void;

  constructor(args: GameStateHandlerArgs) {
    this.player = args.player;
    this.players = args.gameData.players;
    this.chatLog = args.gameData.chat;
    this.acknowledgedChat = args.gameData.chat.map((c) => c.id);
    this.game = args.game;
    this.globalStateData = args.gameData.globalStateData;
    this.playerStateData = args.gameData.playerStateData;
    this.dbDiscussionStages = args.stages || [];

    this.stateData = {};
    this.stepIdsSinceLastInput = [];
    this.userResponseHandleState = getDefaultUserResponseHandleState();
    this.sendMessage = args.sendMessage;
    this.updateRoomGameData = args.updateRoomGameData;
    this.executePrompt = args.executePrompt;
    this.setResponsePending = args.setResponsePending;
    this.onDiscussionFinished = args.onDiscussionFinished;
    this.viewedSimulation = args.viewedSimulation;
    this.onWaitingForPlayers = args.onWaitingForPlayers;
    // bind functions to this
    this.onDiscussionFinished = this.onDiscussionFinished?.bind(this);
  }

  initializeGame(): void {
    // Setting the stage should trigger global state update
    this.setInitialStage();
  }

  /** subscriber functions */

  newChatLogReceived(chatLog: ChatMessage[]) {
    this.chatLog = chatLog;
    const newMessages = chatLog.filter(
      (c) =>
        !this.acknowledgedChat.includes(c.id) && c.sender === SenderType.PLAYER
    );
    if (newMessages.length === 0) {
      return;
    }
    const curStage = this.getCurrentStage();
    if (curStage?.stage && isDiscussionStage(curStage.stage)) {
      const curStep = this.getCurrentDiscussionStageStep();
      if (!curStep) {
        throw new Error('Current step not found');
      }
      this.discussionStageHandler.newChatLogReceived(
        curStage as DiscussionCurrentStage,
        curStep,
        chatLog
      );
    }
    for (const newMessage of newMessages) {
      // TODO: notify handlers of new message
      this.acknowledgedChat.push(newMessage.id);
    }
  }

  getCurrentStage(): CurrentStage<IStage> | undefined {
    return this.stageList.find((s) => s.id === this.globalStateData.curStageId);
  }

  getCurrentDiscussionStageStep(): DiscussionStageStep | undefined {
    const curStage = this.getCurrentStage();
    if (!curStage) {
      return undefined;
    }
    if (isDiscussionStage(curStage.stage)) {
      const curFlow = (curStage.stage as DiscussionStage).flowsList.find((f) =>
        f.steps.find((s) => s.stepId === this.globalStateData.curStepId)
      );
      if (!curFlow) {
        return undefined;
      }
      const curStep = curFlow.steps.find(
        (s) => s.stepId === this.globalStateData.curStepId
      );
      if (!curStep) {
        return undefined;
      }
      return curStep;
    } else {
      throw new Error('Current stage is not a discussion stage');
    }
  }

  async globalStateUpdated(newGlobalState: GlobalStateData): Promise<void> {
    const oldGlobalState = JSON.parse(JSON.stringify(this.globalStateData));
    this.globalStateData = newGlobalState;
    if (this.newStageOrStep(oldGlobalState, newGlobalState)) {
      const newStage = this.stageList.find(
        (s) => s.id === newGlobalState.curStageId
      );
      if (!newStage) {
        throw new Error(`Unable to find stage ${newGlobalState.curStageId}`);
      }
      if (newStage.beforeStart) {
        newStage.beforeStart();
      }
      if (isDiscussionStage(newStage.stage)) {
        this.discussionStageHandler.onDiscussionFinished =
          newStage.onStageFinished;
        await this.discussionStageHandler.executeDiscussionStageStep(
          newStage as CurrentStage<DiscussionStage>,
          newGlobalState.curStepId
        );
      } else {
        // Is a simulation stage, must wait for simulationEnded to be emitted
      }
    }
  }

  newStageOrStep(
    oldGlobalState: GlobalStateData,
    newGlobalState: GlobalStateData
  ): boolean {
    return (
      oldGlobalState.curStageId !== newGlobalState.curStageId ||
      oldGlobalState.curStepId !== newGlobalState.curStepId
    );
  }

  playerStateUpdated(newGameState: PlayerStateData[]): void {
    this.playerStateData = newGameState;
    const curStage = this.getCurrentStage();
    const curStep = this.getCurrentDiscussionStageStep();
    if (curStage && curStep && isDiscussionStage(curStage.stage)) {
      this.discussionStageHandler.playerStateUpdated(
        curStage as DiscussionCurrentStage,
        curStep,
        newGameState
      );
    }
  }

  playersUpdated(players: Player[]): void {
    this.players = players;
  }

  newPlayerStateData(newData: GameStateData[], playerId: string): void {
    this.updateRoomGameData({
      playerStateData: [
        {
          player: playerId,
          animation: '',
          gameStateData: newData,
        },
      ],
      globalStateData: {
        gameStateData: newData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }

  updateStageByStageListId(newStageListId: string) {
    const newStage = this.stageList.find((s) => s.id === newStageListId);
    if (!newStage) {
      throw new Error('missing stage');
    }
    const newStepId = getFirstStepId(newStage.stage);
    this.updateRoomStageStepId(newStage.id, newStepId);
  }

  updateRoomStageStepId(stageId: string, stepId: string) {
    if (this.player._id !== this.globalStateData.roomOwnerId) {
      return;
    }
    this.updateRoomGameData({
      globalStateData: {
        curStageId: stageId,
        curStepId: stepId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }

  setInitialStage() {
    if (this.globalStateData.curStageId && this.globalStateData.curStepId) {
      // first stage already set, or joined a game with a stage already set
      this.returnToStage();
      return;
    }
    const firstStage = this.stageList[0];
    const stageId: string = firstStage.id;
    const stepId: string = isDiscussionStage(firstStage.stage)
      ? (firstStage.stage as DiscussionStage).flowsList[0].steps[0].stepId
      : firstStage.stage.clientId;
    if (
      stageId !== this.globalStateData.curStageId ||
      stepId !== this.globalStateData.curStepId
    ) {
      this.updateRoomStageStepId(stageId, stepId);
    }
  }

  returnToStage(): void {
    const curStage = this.getCurrentStage();
    const curStep = this.getCurrentDiscussionStageStep();
    if (curStage && curStep && isDiscussionStage(curStage.stage)) {
      console.log('returning to step', curStep);
      this.discussionStageHandler.onDiscussionFinished =
        curStage.onStageFinished;
      this.discussionStageHandler.executeDiscussionStageStep(
        curStage as CurrentStage<DiscussionStage>,
        curStep.stepId
      );
    }
  }

  simulationEnded(): void {
    const curStage = this.getCurrentStage();
    if (curStage?.stage.stageType === 'simulation') {
      this.viewedSimulation(this.player._id);
    }
  }
}
