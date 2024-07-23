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
  convertCollectedDataToGSData,
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
import { GenericLlmRequest, PromptOutputTypes, PromptRoles } from '../types';
import { CancelToken } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { chatLogToString, isJsonString } from '../helpers';
import { AzureServiceModel, OpenAiServiceModel } from './types';
import {
  ChatMessage,
  SenderType,
  MessageDisplayType,
  GlobalStateData,
  PlayerStateData,
  GameStateData,
} from '../store/slices/game';
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

export class DiscussionStageHandler implements Subscriber {
  currentDiscussion: DiscussionStage | undefined;
  curStep: DiscussionStageStep | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateData: CollectedDiscussionData;
  chatLog: ChatMessage[] = [];
  errorMessage: string | null = null;
  sendMessage: (msg: ChatMessage) => void;
  setResponsePending: (pending: boolean) => void; // let parent component know when we are waiting for an async response
  executePrompt: (
    llmRequest: GenericLlmRequest,
    cancelToken?: CancelToken
  ) => Promise<AiServicesResponseTypes>;
  userResponseHandleState: UserResponseHandleState;
  stepIdsSinceLastInput: string[]; // used to prevent infinite loops, should never repeat a step until we've had some sort of user input.
  lastFailedStepId: string | null = null;
  onDiscussionFinished?: (discussionData: CollectedDiscussionData) => void;
  newPlayerStateData?: (data: GameStateData[]) => void;

  getStepById(stepId: string): DiscussionStageStep | undefined {
    if (
      !this.currentDiscussion ||
      !this.currentDiscussion.flowsList.length ||
      !this.currentDiscussion.flowsList[0].steps.length
    ) {
      throw new Error('No discussion data found');
    }
    for (let i = 0; i < this.currentDiscussion.flowsList.length; i++) {
      const flow = this.currentDiscussion.flowsList[i];
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
    if (!this.currentDiscussion) {
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
      const currentStepFlowList = this.currentDiscussion.flowsList.find(
        (flow) => flow.steps.find((step) => step.stepId === currentStep.stepId)
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

  constructor(
    sendMessage: (msg: ChatMessage) => void,
    setResponsePending: (pending: boolean) => void,
    executePrompt: (
      llmRequest: GenericLlmRequest,
      cancelToken?: CancelToken
    ) => Promise<AiServicesResponseTypes>,
    onDiscussionFinished?: (discussionData: CollectedDiscussionData) => void,
    currentDiscussion?: DiscussionStage,
    newPlayerStateData?: (data: GameStateData[]) => void
  ) {
    this.currentDiscussion = currentDiscussion;
    this.stateData = {};
    this.stepIdsSinceLastInput = [];
    this.userResponseHandleState = getDefaultUserResponseHandleState();
    this.sendMessage = sendMessage;
    this.executePrompt = executePrompt;
    this.setResponsePending = setResponsePending;
    this.onDiscussionFinished = onDiscussionFinished;
    this.newPlayerStateData = newPlayerStateData;

    // bind functions to this
    this.newPlayerStateData = this.newPlayerStateData?.bind(this);
    this.setCurrentDiscussion = this.setCurrentDiscussion.bind(this);
    this.initializeActivity = this.initializeActivity.bind(this);
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

  setCurrentDiscussion(currentDiscussion?: DiscussionStage, stepId?: string) {
    this.currentDiscussion = currentDiscussion;
    if (stepId) {
      this.curStep = this.getStepById(stepId || '');
    }
  }

  initializeActivity() {
    console.log(this.currentDiscussion);
    if (
      !this.currentDiscussion ||
      !this.currentDiscussion.flowsList.length ||
      !this.currentDiscussion.flowsList[0].steps.length
    ) {
      throw new Error('No built activity data found');
    }
    this.curStep = this.currentDiscussion.flowsList[0].steps[0];
    this.stepIdsSinceLastInput = [];
    this.userResponseHandleState = getDefaultUserResponseHandleState();
    this.handleStep(this.curStep);
  }

  async handleStep(step: DiscussionStageStep) {
    if (this.curStep?.stepId !== step.stepId) {
      this.curStep = step;
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
  }

  async handleSystemMessageStep(step: SystemMessageStageStep) {
    // wait 1 second
    this.setResponsePending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.sendMessage({
      id: uuidv4(),
      message: replaceStoredDataInString(step.message, this.stateData),
      sender: SenderType.SYSTEM,
    });
    this.setResponsePending(false);
    await this.goToNextStep();
  }

  async handleRequestUserInputStep(step: RequestUserInputStageStep) {
    const processedPredefinedResponses = processPredefinedResponses(
      step.predefinedResponses,
      this.stateData
    );
    // wait 1 second
    this.setResponsePending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.sendMessage({
      id: uuidv4(),
      message: replaceStoredDataInString(step.message, this.stateData),
      sender: SenderType.SYSTEM,
      displayType: MessageDisplayType.TEXT,
      disableUserInput: step.disableFreeInput,
      mcqChoices: this.handleExtractMcqChoices(processedPredefinedResponses),
    });
    this.setResponsePending(false);
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

  getStoredArray(str: string) {
    const regex = /{{(.*?)}}/g;
    const key = str.match(regex);
    if (key) {
      const keyName = key[0].slice(2, -2);
      if (Array.isArray(this.stateData[keyName])) {
        return this.stateData[keyName];
      }
    }
    return [str];
  }

  async goToNextStep() {
    if (!this.curStep) {
      throw new Error('No current step found');
    }
    if (this.curStep.lastStep) {
      if (this.onDiscussionFinished) {
        this.onDiscussionFinished(this.stateData);
      }
      return;
    }
    try {
      this.curStep = this.getNextStep(this.curStep);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.sendErrorMessage(err.message);
      return;
    }
    await this.handleStep(this.curStep);
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
    if (!this.curStep) {
      throw new Error('No current step found');
    }
    if (this.curStep.stepType !== DiscussionStageStepType.REQUEST_USER_INPUT) {
      return;
    }
    console.log('handling new user message for step', this.curStep);
    const requestUserInputStep = this.curStep as RequestUserInputStageStep;
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
    const userInputStep = this.curStep as RequestUserInputStageStep;
    if (userInputStep.saveResponseVariableName) {
      this.stateData[userInputStep.saveResponseVariableName] = message;
      this.newPlayerStateData &&
        this.newPlayerStateData(convertCollectedDataToGSData(this.stateData));
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

  newChatLogReceived(chatLog: ChatMessage[]) {
    this.chatLog = chatLog;
    if (chatLog.length === 0) {
      return;
    }
    const newMessage = chatLog[chatLog.length - 1];
    if (newMessage.sender === SenderType.PLAYER) {
      this.handleNewUserMessage(newMessage.message);
    }
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
      targetAiServiceModel: AzureServiceModel,
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
        this.newPlayerStateData &&
          this.newPlayerStateData(convertCollectedDataToGSData(this.stateData));
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

  globalStateUpdated(newState: GlobalStateData): void {
    console.log('global state updated');
  }

  playerStateUpdated(newState: PlayerStateData[]): void {
    console.log('player state updated');
  }

  playersUpdated(newState: Player[]): void {
    console.log('players updated');
  }
}
