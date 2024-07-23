/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import {
  AiServicesResponseTypes,
  extractServiceStepResponse,
} from '../ai-services/ai-service-types';
import {
  processPredefinedResponses,
  receivedExpectedData,
  recursivelyConvertExpectedDataToAiPromptString,
  recursiveUpdateAdditionalInfo,
  replaceStoredDataInString,
  sortMessagesByResponseWeight,
} from '../components/discussion-stage-builder/helpers';
import {
  DiscussionStage,
  DiscussionStageStep,
  DiscussionStageStepType,
  PredefinedResponse,
  PromptStageStep,
  RequestUserInputStageStep,
  SystemMessageStageStep,
} from '../components/discussion-stage-builder/types';
import {
  ChatMessage,
  GameData,
  GameStateData,
  GlobalStateData,
  MessageDisplayType,
  PlayerStateData,
  SenderType,
} from '../store/slices/game';
import { GenericLlmRequest, PromptOutputTypes, PromptRoles } from '../types';
import { CancelToken } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { OpenAiServiceModel } from './types';
import { chatLogToString, isJsonString } from '../helpers';
import { Subscriber } from '../store/slices/game/use-with-game-state';
import { Player } from '../store/slices/player';

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

export class GameStateHandler implements Subscriber {
  currentStage: DiscussionStage | undefined;
  currentStep: DiscussionStageStep | undefined;
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
    this.currentStage = args.stages?.find((s) => s.clientId === id);
    this.currentStep =
      this.getStepById(args.gameData.globalStateData.curStepId) ||
      this.currentStage?.flowsList[0].steps[0];
    this.player = args.player;
    this.players = args.gameData.players;
    this.chatLog = args.gameData.chat;
    this.acknowledgedChat = args.gameData.chat.map((c) => c.id);
    this.game = args.game;
    this.globalStateData = args.gameData.globalStateData;
    this.playerStateData = args.gameData.playerStateData;

    this.stateData = {};
    this.stepIdsSinceLastInput = [];
    this.userResponseHandleState = getDefaultUserResponseHandleState();
    this.sendMessage = args.sendMessage;
    this.updateRoomGameData = args.updateRoomGameData;
    this.executePrompt = args.executePrompt;
    this.setResponsePending = args.setResponsePending;
    this.onDiscussionFinished = args.onDiscussionFinished;

    // bind functions to this
    this.setCurrentDiscussion = this.setCurrentDiscussion.bind(this);
    this.initializeActivity = this.initializeActivity.bind(this);
    this.resetActivity = this.resetActivity.bind(this);
    this.handleStep = this.handleStep.bind(this);
    this.handleSystemMessageStep = this.handleSystemMessageStep.bind(this);
    this.handleRequestUserInputStep =
      this.handleRequestUserInputStep.bind(this);
    this.goToNextStep = this.goToNextStep.bind(this);
    this.handleNewUserMessage = this.handleNewUserMessage.bind(this);
    this.handlePromptStep = this.handlePromptStep.bind(this);
    this.getNextStep = this.getNextStep.bind(this);
    this.getStepById = this.getStepById.bind(this);
    this.addResponseNavigation = this.addResponseNavigation.bind(this);
    this.handleExtractMcqChoices = this.handleExtractMcqChoices.bind(this);
    this.onDiscussionFinished = this.onDiscussionFinished?.bind(this);
  }

  getStepById(stepId: string): DiscussionStageStep | undefined {
    if (
      !this.currentStage ||
      !this.currentStage.flowsList.length ||
      !this.currentStage.flowsList[0].steps.length
    ) {
      throw new Error('No discussion data found');
    }
    for (let i = 0; i < this.currentStage.flowsList.length; i++) {
      const flow = this.currentStage.flowsList[i];
      for (let j = 0; j < flow.steps.length; j++) {
        const step = flow.steps[j];
        if (step.stepId === stepId) {
          return step;
        }
      }
    }
    return undefined;
  }

  getNextStep(currentStep: DiscussionStageStep): DiscussionStageStep {
    if (!this.currentStage) {
      throw new Error('No activity data found');
    }
    if (currentStep.jumpToStepId) {
      const jumpStep = this.getStepById(currentStep.jumpToStepId);
      if (!jumpStep) {
        throw new Error(
          `Unable to find target step ${currentStep.jumpToStepId}, maybe you deleted it and forgot to update this step?`
        );
      }
      return jumpStep;
    } else {
      // go to next step in current flow
      const currentStepFlowList = this.currentStage.flowsList.find((flow) =>
        flow.steps.find((step) => step.stepId === currentStep.stepId)
      );

      if (!currentStepFlowList) {
        throw new Error(`Unable to find flow for step: ${currentStep.stepId}`);
      }

      const currentStepIndex = currentStepFlowList.steps.findIndex(
        (step) => step.stepId === currentStep.stepId
      );

      if (currentStepIndex === -1) {
        throw new Error(
          `Unable to find requested step: ${currentStep.stepId} in flow ${currentStepFlowList.name}`
        );
      }
      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex >= currentStepFlowList.steps.length) {
        throw new Error(
          'No next step found, maybe you forgot to add a jumpToStepId for the last step in a flow?'
        );
      } else {
        return currentStepFlowList.steps[nextStepIndex];
      }
    }
  }

  setCurrentDiscussion(currentDiscussion?: DiscussionStage) {
    this.currentStage = currentDiscussion;
  }

  initializeActivity() {
    if (
      !this.currentStage ||
      !this.currentStage.flowsList.length ||
      !this.currentStage.flowsList[0].steps.length
    ) {
      throw new Error('No built activity data found');
    }
    this.resetActivity();
  }

  resetActivity() {
    if (
      !this.currentStage ||
      !this.currentStage.flowsList.length ||
      !this.currentStage.flowsList[0].steps.length
    ) {
      throw new Error('No built activity data found');
    }
    this.currentStep = this.currentStage.flowsList[0].steps[0];
    this.stateData = {};
    this.stepIdsSinceLastInput = [];
    this.userResponseHandleState = getDefaultUserResponseHandleState();
    this.handleStep(this.currentStep);
  }

  async handleStep(step: DiscussionStageStep) {
    if (this.currentStep?.stepId !== step.stepId) {
      this.currentStep = step;
    }
    if (step.stepType === DiscussionStageStepType.REQUEST_USER_INPUT) {
      this.stepIdsSinceLastInput = [];
    }
    if (this.stepIdsSinceLastInput.includes(step.stepId)) {
      this.sendMessage({
        id: uuidv4(),
        message:
          'Oops! A loop was detected in this activity, we are halting the activity to prevent an infinite loop. Please contact the activity creator to fix this issue.',
        sender: SenderType.SYSTEM,
      });
      return;
    }
    this.stepIdsSinceLastInput.push(step.stepId);
    // work through steps until we get to a user message step, then wait to be notified of a user message
    // handle the step
    switch (step.stepType) {
      case DiscussionStageStepType.REQUEST_USER_INPUT:
        await this.handleRequestUserInputStep(
          step as RequestUserInputStageStep
        );
        break;
      case DiscussionStageStepType.SYSTEM_MESSAGE:
        await this.handleSystemMessageStep(step as SystemMessageStageStep);
        break;
      case DiscussionStageStepType.PROMPT:
        await this.handlePromptStep(step as PromptStageStep);
        break;
      default:
        throw new Error(`Unknown step type: ${step}`);
    }
    if (step.lastStep) {
      // todo
    }
  }

  async handleSystemMessageStep(step: SystemMessageStageStep) {
    this.sendMessage({
      id: uuidv4(),
      message: replaceStoredDataInString(step.message, this.stateData),
      sender: SenderType.SYSTEM,
    });
    await this.goToNextStep();
  }

  async handleRequestUserInputStep(step: RequestUserInputStageStep) {
    const processedPredefinedResponses = processPredefinedResponses(
      step.predefinedResponses,
      this.stateData
    );
    this.sendMessage({
      id: uuidv4(),
      message: replaceStoredDataInString(step.message, this.stateData),
      sender: SenderType.SYSTEM,
      displayType: MessageDisplayType.TEXT,
      disableUserInput: step.disableFreeInput,
      mcqChoices: this.handleExtractMcqChoices(processedPredefinedResponses),
    });
    // Will now wait for user input before progressing to next step
  }

  handleExtractMcqChoices(predefinedResponses: PredefinedResponse[]): string[] {
    const finalRes: string[] = [];
    for (let i = 0; i < predefinedResponses.length; i++) {
      const res = predefinedResponses[i];
      if (res.isArray) {
        const responsesArray = res.message.split(',');
        if (res.jumpToStepId) {
          for (let j = 0; j < responsesArray.length; j++) {
            this.addResponseNavigation(responsesArray[j], res.jumpToStepId);
          }
        }
        finalRes.push(...responsesArray);
      } else {
        const resString = replaceStoredDataInString(
          res.message,
          this.stateData
        );
        if (res.jumpToStepId) {
          this.addResponseNavigation(resString, res.jumpToStepId);
        }
        finalRes.push(resString);
      }
    }
    return sortMessagesByResponseWeight(finalRes, predefinedResponses);
  }

  addResponseNavigation(response: string, jumpToStepId: string) {
    this.userResponseHandleState.responseNavigations.push({
      response,
      jumpToStepId,
    });
  }

  getStoredArray(str: string): string[] {
    const regex = /{{(.*?)}}/g;
    const key = str.match(regex);
    if (key) {
      const keyName = key[0].slice(2, -2);
      if (Array.isArray(this.stateData[keyName])) {
        return this.stateData[keyName] as string[];
      }
    }
    return [str];
  }

  async goToNextStep() {
    if (!this.currentStep) {
      throw new Error('No current step found');
    }
    if (this.currentStep.lastStep) {
      if (this.onDiscussionFinished) {
        this.onDiscussionFinished(this.stateData);
      }
      return;
    }
    try {
      this.currentStep = this.getNextStep(this.currentStep);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.sendErrorMessage(err.message);
      return;
    }
    await this.handleStep(this.currentStep);
  }

  sendErrorMessage(message: string) {
    this.sendMessage({
      id: uuidv4(),
      message,
      sender: SenderType.SYSTEM,
      // disableUserInput: true,
    });
  }

  async handleNewUserMessage(message: string) {
    if (!this.currentStep) {
      throw new Error('No current step found');
    }
    if (
      this.currentStep.stepType !== DiscussionStageStepType.REQUEST_USER_INPUT
    ) {
      return;
    }
    const requestUserInputStep = this.currentStep as RequestUserInputStageStep;
    if (requestUserInputStep.predefinedResponses.length > 0) {
      const predefinedResponseMatch =
        requestUserInputStep.predefinedResponses.find(
          (response) => response.message === message
        );
      if (predefinedResponseMatch) {
        if (predefinedResponseMatch.jumpToStepId) {
          const jumpStep = this.getStepById(
            predefinedResponseMatch.jumpToStepId
          );
          if (!jumpStep) {
            this.sendErrorMessage(
              `Unable to find target step ${predefinedResponseMatch.jumpToStepId} for predefined input ${predefinedResponseMatch.message}, maybe you deleted it and forgot to update this step?`
            );
            return;
          }
          this.handleStep(jumpStep);
          return;
        }
      }
    }
    const userInputStep = this.currentStep as RequestUserInputStageStep;
    if (userInputStep.saveResponseVariableName) {
      this.stateData[userInputStep.saveResponseVariableName] = message;
    }
    if (this.userResponseHandleState.responseNavigations.length > 0) {
      for (
        let i = 0;
        i < this.userResponseHandleState.responseNavigations.length;
        i++
      ) {
        const responseNavigation =
          this.userResponseHandleState.responseNavigations[i];
        if (responseNavigation.response === message) {
          const jumpStep = this.getStepById(responseNavigation.jumpToStepId);
          if (!jumpStep) {
            this.sendErrorMessage(
              `Unable to find target step ${responseNavigation.jumpToStepId} for predefined input ${responseNavigation.response}, maybe you deleted it and forgot to update this step?`
            );
            return;
          }
          this.handleStep(jumpStep);
          return;
        }
      }
    }
    // reset user response handle state since we handled the user response
    this.userResponseHandleState = getDefaultUserResponseHandleState();
    await this.goToNextStep();
  }

  async handlePromptStep(step: PromptStageStep) {
    this.setResponsePending(true);
    // handle replacing promptText with stored data
    const promptText = replaceStoredDataInString(
      step.promptText,
      this.stateData
    );
    // handle replacing responseFormat with stored data
    const responseFormat = replaceStoredDataInString(
      step.responseFormat,
      this.stateData
    );
    // handle replacing customSystemRole with stored data
    const customSystemRole = replaceStoredDataInString(
      step.customSystemRole,
      this.stateData
    );

    const llmRequest: GenericLlmRequest = {
      prompts: [],
      outputDataType: step.outputDataType,
      targetAiServiceModel: OpenAiServiceModel,
      responseFormat: responseFormat,
      systemRole: customSystemRole,
    };

    if (step.includeChatLogContext) {
      llmRequest.prompts.push({
        promptText: `Current state of chat log between user and system: ${chatLogToString(
          this.chatLog
        )}`,
        promptRole: PromptRoles.USER,
      });
    }

    llmRequest.prompts.push({
      promptText: promptText,
      promptRole: PromptRoles.USER,
    });

    if (
      step.jsonResponseData &&
      step.outputDataType === PromptOutputTypes.JSON
    ) {
      llmRequest.responseFormat +=
        recursivelyConvertExpectedDataToAiPromptString(
          recursiveUpdateAdditionalInfo(step.jsonResponseData, this.stateData)
        );
    }

    // handle sending prompt

    const requestFunction = async () => {
      const _response = await this.executePrompt(llmRequest);
      const response = extractServiceStepResponse(_response, 0);

      if (step.outputDataType === PromptOutputTypes.JSON) {
        if (!isJsonString(response)) {
          throw new Error('Did not receive valid JSON data');
        }
        if (step.jsonResponseData) {
          if (!receivedExpectedData(step.jsonResponseData, response)) {
            this.errorMessage = 'Did not receive expected JSON data';
            throw new Error('Did not receive expected JSON data');
          }
        }
        const resData = JSON.parse(response);
        this.stateData = { ...this.stateData, ...resData };
      } else {
        // is a text response
        this.sendMessage({
          id: uuidv4(),
          message: response,
          sender: SenderType.SYSTEM,
          displayType: MessageDisplayType.TEXT,
        });
      }
    };

    // try request function 3 times
    let counter = 0;
    let success = false;
    while (counter < 3) {
      try {
        await requestFunction();
        success = true;
        console.log('breaking');
        break;
      } catch (err) {
        counter++;
      }
    }
    if (!success) {
      this.sendErrorMessage('AI Service request failed');
      this.lastFailedStepId = step.stepId;
      this.setResponsePending(false);
      return;
    }

    this.setResponsePending(false);
    await this.goToNextStep();
  }

  /** subscriber functions */

  newChatLogReceived(chatLog: ChatMessage[]) {
    this.chatLog = chatLog;
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
      this.handleNewUserMessage(newMessage.message);
      this.acknowledgedChat.push(newMessage.id);
    }
  }

  globalStateUpdated(newGlobalState: GlobalStateData): void {
    this.globalStateData = newGlobalState;
  }

  playerStateUpdated(newGameState: PlayerStateData[]): void {
    this.playerStateData = newGameState;
  }

  /** */

  updatePlayerStateVariable(updated: GameStateData): void {
    this.updateRoomGameData({
      playerStateData: [
        {
          player: this.player.clientId,
          animation: '',
          gameStateData: [updated],
        },
      ],
    });
  }
}
