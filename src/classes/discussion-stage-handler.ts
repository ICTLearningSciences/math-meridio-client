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
  receivedExpectedData,
  recursivelyConvertExpectedDataToAiPromptString,
  recursiveUpdateAdditionalInfo,
  replaceStoredDataInString,
} from '../components/discussion-stage-builder/helpers';
import {
  Checking,
  ConditionalActivityStep,
  DiscussionStageStep,
  DiscussionStageStepType,
  PromptStageStep,
  RequestUserInputStageStep,
  SystemMessageStageStep,
} from '../components/discussion-stage-builder/types';
import {
  CollectedDiscussionData,
  DiscussionCurrentStage,
  GenericLlmRequest,
  PromptOutputTypes,
  PromptRoles,
  TargetAiModelServiceType,
} from '../types';
import { CancelToken } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { chatLogToString, isJsonString } from '../helpers';
import {
  ChatMessage,
  SenderType,
  MessageDisplayType,
  GlobalStateData,
  PlayerStateData,
  GameStateData,
} from '../store/slices/game/types';
import { Player } from '../store/slices/player/types';
import { SESSION_ID } from '../store/local-storage';
import { localStorageGet } from '../store/local-storage';
import { StepResponseTracking } from './authority/state-modifier-helpers';

export class DiscussionStageHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateData: CollectedDiscussionData;
  playerStateData: PlayerStateData[];
  chatLog: ChatMessage[] = [];
  playerId: string;
  errorMessage: string | null = null;
  targetAiServiceModel: TargetAiModelServiceType;
  sendMessage: (msg: ChatMessage) => void;
  setResponsePending: (pending: boolean) => void; // let parent component know when we are waiting for an async response
  executePrompt: (
    llmRequest: GenericLlmRequest,
    cancelToken?: CancelToken
  ) => Promise<AiServicesResponseTypes>;
  stepIdsSinceLastInput: string[]; // used to prevent infinite loops, should never repeat a step until we've had some sort of user input.
  lastFailedStepId: string | null = null;
  onDiscussionFinished?: (discussionData: CollectedDiscussionData) => void;
  newPlayerStateData?: (data: GameStateData[], playerId: string) => void;
  exitEarlyCondition?: (data: CollectedDiscussionData) => boolean;
  updateRoomStageStepId: (stageId: string, stepId: string) => void;
  globalStateData: GlobalStateData;
  stepResponseTracking: Record<string, StepResponseTracking> = {};
  onWaitingForPlayers?: (waitingForPlayerIds: string[]) => void;

  getStepById(
    discussionStage: DiscussionCurrentStage,
    stepId: string
  ): DiscussionStageStep | undefined {
    if (
      !discussionStage ||
      !discussionStage.stage ||
      !discussionStage.stage.flowsList ||
      discussionStage.stage.flowsList.length === 0 ||
      discussionStage.stage.flowsList[0].steps.length === 0
    ) {
      throw new Error('No discussion data found');
    }
    for (let i = 0; i < discussionStage.stage.flowsList.length; i++) {
      const flow = discussionStage.stage.flowsList[i];
      for (let j = 0; j < flow.steps.length; j++) {
        const step = flow.steps[j];
        if (step.stepId === stepId) {
          return step;
        }
      }
    }
    return undefined;
  }

  getNextStep(
    discussionStage: DiscussionCurrentStage,
    currentStep: DiscussionStageStep
  ): void {
    // if (currentStep.stepType === DiscussionStageStepType.CONDITIONAL) {
    //   const nextStep = this.getNextStepFromConditional(
    //     discussionStage,
    //     currentStep as ConditionalActivityStep
    //   );
    //   if (nextStep) {
    //     return nextStep;
    //   }
    // }
    // if (currentStep.jumpToStepId) {
    //   const jumpStep = this.getStepById(
    //     discussionStage,
    //     currentStep.jumpToStepId
    //   );
    //   if (!jumpStep) {
    //     throw new Error(
    //       `Unable to find target step ${currentStep.jumpToStepId}, maybe you deleted it and forgot to update this step?`
    //     );
    //   }
    //   return jumpStep;
    // } else {
    //   // go to next step in current flow
    //   const currentStepFlowList = discussionStage.stage.flowsList.find((flow) =>
    //     flow.steps.find((step) => step.stepId === currentStep.stepId)
    //   );
    //   if (!currentStepFlowList) {
    //     throw new Error(`Unable to find flow for step: ${currentStep.stepId}`);
    //   }
    //   const currentStepIndex = currentStepFlowList.steps.findIndex(
    //     (step) => step.stepId === currentStep.stepId
    //   );
    //   if (currentStepIndex === -1) {
    //     throw new Error(
    //       `Unable to find requested step: ${currentStep.stepId} in flow ${currentStepFlowList.name}`
    //     );
    //   }
    //   const nextStepIndex = currentStepIndex + 1;
    //   if (nextStepIndex >= currentStepFlowList.steps.length) {
    //     throw new Error(
    //       'No next step found, maybe you forgot to add a jumpToStepId for the last step in a flow?'
    //     );
    //   } else {
    //     return currentStepFlowList.steps[nextStepIndex];
    //   }
    // }
  }

  constructor(
    playerId: string,
    globalStateData: GlobalStateData,
    playerStateData: PlayerStateData[],
    sendMessage: (msg: ChatMessage) => void,
    setResponsePending: (pending: boolean) => void,
    executePrompt: (
      llmRequest: GenericLlmRequest,
      cancelToken?: CancelToken
    ) => Promise<AiServicesResponseTypes>,
    updateRoomStageStepId: (stageId: string, stepId: string) => void,
    targetAiServiceModel: TargetAiModelServiceType,
    onDiscussionFinished?: (discussionData: CollectedDiscussionData) => void,
    newPlayerStateData?: (data: GameStateData[], playerId: string) => void,
    exitEarlyCondition?: (data: CollectedDiscussionData) => boolean,
    onWaitingForPlayers?: (waitingForPlayerIds: string[]) => void
  ) {
    this.globalStateData = globalStateData;
    this.playerStateData = playerStateData;
    this.stateData = {};
    this.stepIdsSinceLastInput = [];
    this.sendMessage = sendMessage;
    this.executePrompt = executePrompt;
    this.setResponsePending = setResponsePending;
    this.onDiscussionFinished = onDiscussionFinished;
    this.newPlayerStateData = newPlayerStateData;
    this.exitEarlyCondition = exitEarlyCondition;
    this.playerId = playerId;
    this.updateRoomStageStepId = updateRoomStageStepId;
    this.targetAiServiceModel = targetAiServiceModel;
    this.onWaitingForPlayers = onWaitingForPlayers;
    this.stepResponseTracking = {};
    // bind functions to this
    this.exitEarlyCondition = this.exitEarlyCondition?.bind(this);
    this.newPlayerStateData = this.newPlayerStateData?.bind(this);
    this.onWaitingForPlayers = this.onWaitingForPlayers?.bind(this);
    this.executeDiscussionStageStep =
      this.executeDiscussionStageStep.bind(this);
    this.handleStep = this.handleStep.bind(this);
    this.handleNewUserMessage = this.handleNewUserMessage.bind(this);
    this.onDiscussionFinished = this.onDiscussionFinished?.bind(this);
    this.updateRoomStageStepId = this.updateRoomStageStepId.bind(this);
    this.updateRoomWithNextStep = this.updateRoomWithNextStep.bind(this);
    this.newChatLogReceived = this.newChatLogReceived.bind(this);
    this.handleSystemMessageStep = this.handleSystemMessageStep.bind(this);
    this.handleRequestUserInputStep =
      this.handleRequestUserInputStep.bind(this);
    this.handlePromptStep = this.handlePromptStep.bind(this);
    this.getNextStep = this.getNextStep.bind(this);
    this.getStepById = this.getStepById.bind(this);
  }

  /**
   * executes the discussionStageStep, returns the next step to handle
   */
  async executeDiscussionStageStep(
    discussionStage: DiscussionCurrentStage,
    stepId: string
  ) {
    // if (
    //   discussionStage.stage.flowsList.length === 0 ||
    //   discussionStage.stage.flowsList[0].steps.length === 0
    // ) {
    //   throw new Error('No built activity data found');
    // }
    // const curStep = this.getStepById(discussionStage, stepId);
    // if (!curStep) {
    //   throw new Error('No initial step found');
    // }
    // this.stepIdsSinceLastInput = [];
    // return await this.handleStep(discussionStage, curStep);
  }

  async handleStep(
    discussionStage: DiscussionCurrentStage,
    step: DiscussionStageStep
  ) {
    // if (step.stepType === DiscussionStageStepType.REQUEST_USER_INPUT) {
    //   this.stepIdsSinceLastInput = [];
    // }
    // const sessionId = localStorageGet(SESSION_ID);
    // if (this.stepIdsSinceLastInput.includes(step.stepId)) {
    //   this.sendMessage({
    //     id: uuidv4(),
    //     message:
    //       'Oops! A loop was detected in this activity, we are halting the activity to prevent an infinite loop. Please contact the activity creator to fix this issue.',
    //     sender: SenderType.SYSTEM,
    //     sessionId: sessionId as string,
    //   });
    //   return;
    // }
    // if (this.exitEarlyCondition && this.exitEarlyCondition(this.stateData)) {
    //   if (this.onDiscussionFinished) {
    //     this.onDiscussionFinished(this.stateData);
    //   }
    //   return;
    // }
    // this.stepIdsSinceLastInput.push(step.stepId);
    // // work through steps until we get to a user message step, then wait to be notified of a user message
    // // handle the step
    // switch (step.stepType) {
    //   case DiscussionStageStepType.REQUEST_USER_INPUT:
    //     return await this.handleRequestUserInputStep(
    //       discussionStage,
    //       step as RequestUserInputStageStep
    //     );
    //   case DiscussionStageStepType.SYSTEM_MESSAGE:
    //     return await this.handleSystemMessageStep(
    //       discussionStage,
    //       step as SystemMessageStageStep
    //     );
    //   case DiscussionStageStepType.PROMPT:
    //     return await this.handlePromptStep(
    //       discussionStage,
    //       step as PromptStageStep
    //     );
    //   case DiscussionStageStepType.CONDITIONAL:
    //     // A conditional step is just an extra condition to determine the next step
    //     // So we can just call updateRoomWithNextStep with the step, where it will determine the next step based on the conditional
    //     return await this.updateRoomWithNextStep(discussionStage, step);
    //   default:
    //     throw new Error(`Unknown step type: ${step}`);
    // }
  }

  async updateRoomWithNextStep(
    discussionStage: DiscussionCurrentStage,
    step: DiscussionStageStep
  ) {
    // if (step.lastStep) {
    //   if (this.onDiscussionFinished) {
    //     this.onDiscussionFinished(this.stateData);
    //   }
    //   return;
    // }
    // try {
    //   const nextStep = this.getNextStep(discussionStage, step);
    //   if (nextStep) {
    //     this.updateRoomStageStepId(discussionStage.id, nextStep.stepId);
    //   }
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // } catch (err: any) {
    //   this.sendErrorMessage(err.message);
    //   return;
    // }
  }

  getNextStepFromConditional(
    discussionStage: DiscussionCurrentStage,
    step: ConditionalActivityStep
  ) {
    return step;
    // this.setResponsePending(true);
    // this.stateData = {
    //   ...this.stateData,
    // };
    // const conditionals = step.conditionals.map((c) => ({
    //   ...c,
    //   expectedValue: replaceStoredDataInString(c.expectedValue, this.stateData),
    // }));
    // this.setResponsePending(false);
    // for (let i = 0; i < conditionals.length; i++) {
    //   const condition = conditionals[i];
    //   let stateValue = this.stateData[condition.stateDataKey];
    //   if (!stateValue) {
    //     this.sendErrorMessage(
    //       `An error occured during this activity. Could not find state value ${condition.stateDataKey}.`
    //     );
    //     return;
    //   }

    //   if (
    //     typeof stateValue === 'string' &&
    //     ['false', 'true', 'False', 'True'].includes(stateValue)
    //   ) {
    //     if (stateValue === 'false' || stateValue === 'False') {
    //       stateValue = false;
    //     } else {
    //       stateValue = true;
    //     }
    //   }

    //   if (condition.checking === Checking.VALUE) {
    //     const expression = `${String(stateValue)} ${condition.operation} ${
    //       condition.expectedValue
    //     }`;
    //     const conditionTrue = new Function(`return ${expression};`)();
    //     if (conditionTrue) {
    //       const step = this.getStepById(
    //         discussionStage,
    //         condition.targetStepId
    //       );
    //       if (!step) {
    //         this.sendErrorMessage(
    //           `An error occured during this activity. Could not find step: ${condition.targetStepId}`
    //         );
    //         return;
    //       }
    //       return step;
    //     }
    //   } else if (condition.checking === Checking.LENGTH) {
    //     if (!Array.isArray(stateValue) && typeof stateValue !== 'string') {
    //       this.sendErrorMessage(
    //         `Expected a string or array for state value ${
    //           condition.stateDataKey
    //         }, but got ${typeof stateValue}`
    //       );
    //       return;
    //     }
    //     const expression = `${stateValue.length} ${condition.operation} ${condition.expectedValue}`;
    //     const conditionTrue = new Function(`return ${expression};`)();
    //     if (conditionTrue) {
    //       const step = this.getStepById(
    //         discussionStage,
    //         condition.targetStepId
    //       );
    //       if (!step) {
    //         this.sendErrorMessage(
    //           `An error occured during this activity. Could not find step: ${condition.targetStepId}`
    //         );
    //         return;
    //       }
    //       return step;
    //     }
    //   } else {
    //     // Checking if array or string contains value
    //     const conditionTrue = Array.isArray(stateValue)
    //       ? stateValue.find((a) => String(a) === condition.expectedValue)
    //       : (stateValue as string).includes(String(condition.expectedValue));
    //     if (conditionTrue) {
    //       const step = this.getStepById(
    //         discussionStage,
    //         condition.targetStepId
    //       );
    //       if (!step) {
    //         this.sendErrorMessage(
    //           `An error occured during this activity. Could not find step: ${condition.targetStepId}`
    //         );
    //         return;
    //       }
    //       return step;
    //     }
    //   }
    // }
    // return undefined;
  }

  async handleSystemMessageStep(
    discussionStage: DiscussionCurrentStage,
    step: SystemMessageStageStep
  ) {
    // // wait 1 second
    // this.setResponsePending(true);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // const sessionId = localStorageGet(SESSION_ID);
    // this.sendMessage({
    //   id: uuidv4(),
    //   message: replaceStoredDataInString(step.message, this.stateData),
    //   sender: SenderType.SYSTEM,
    //   sessionId: sessionId as string,
    // });
    // this.setResponsePending(false);
    // return this.updateRoomWithNextStep(discussionStage, step);
  }

  async handleRequestUserInputStep(
    discussionStage: DiscussionCurrentStage,
    step: RequestUserInputStageStep
  ) {
    // // Initialize multi-user response tracking if required
    // // Only initialize if we haven't already received all responses for this step
    // if (step.requireAllUserInputs) {
    //   console.log('DSH: initializing response tracking for step', step.stepId);
    //   const existingTracking = this.stepResponseTracking[step.stepId];
    //   if (!existingTracking || !existingTracking.allResponsesReceivedOnce) {
    //     const allPlayerIds = this.playerStateData.map((p) => p.player);
    //     console.log('DSH: all player ids', allPlayerIds);
    //     this.initializeResponseTracking(step.stepId, allPlayerIds);
    //   }
    // }
    // // wait 1 second
    // this.setResponsePending(true);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // const sessionId = localStorageGet(SESSION_ID);
    // this.sendMessage({
    //   id: uuidv4(),
    //   message: replaceStoredDataInString(step.message, this.stateData),
    //   sender: SenderType.SYSTEM,
    //   displayType: MessageDisplayType.TEXT,
    //   disableUserInput: step.disableFreeInput,
    //   mcqChoices: [],
    //   sessionId: sessionId as string,
    // });
    // this.setResponsePending(false);
    // // Will now wait for user input before progressing to next step
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

  sendErrorMessage(message: string) {
    // const sessionId = localStorageGet(SESSION_ID);
    // this.sendMessage({
    //   id: uuidv4(),
    //   message,
    //   sender: SenderType.SYSTEM,
    //   sessionId: sessionId as string,
    //   // disableUserInput: true,
    // });
  }

  async handleNewUserMessage(
    curStage: DiscussionCurrentStage,
    curStep: DiscussionStageStep,
    message: string
  ) {
    // check the user's message for profanity
    // const isProfane = await checkProfanity(message);
    // if (isProfane) {
    //   this.sendMessage({
    //     id: uuidv4(),
    //     message:
    //       'Your message contains prohibited language. Please revise your input.',
    //     sender: SenderType.SYSTEM,
    // //   });
    // //   return;
    // // }
    // console.log('handling new user message', message);
    // if (!curStep) {
    //   throw new Error('No current step found');
    // }
    // if (!curStage) {
    //   throw new Error('No current discussion found');
    // }
    // if (curStep.stepType !== DiscussionStageStepType.REQUEST_USER_INPUT) {
    //   console.log('step is not a request user input step, skipping');
    //   return;
    // }
    // const userInputStep = curStep as RequestUserInputStageStep;
    // if (userInputStep.saveResponseVariableName) {
    //   this.stateData[userInputStep.saveResponseVariableName] = message;
    //   this.newPlayerStateData &&
    //     this.newPlayerStateData(
    //       convertCollectedDataToGSData({
    //         [userInputStep.saveResponseVariableName]: message,
    //       }),
    //       this.playerId
    //     );
    // }
    // return this.updateRoomWithNextStep(curStage, curStep);
  }

  newChatLogReceived(
    curStage: DiscussionCurrentStage,
    curStep: DiscussionStageStep,
    chatLog: ChatMessage[]
  ) {
    // console.log('DSH: new chat log received', chatLog);
    // this.chatLog = chatLog;
    // if (chatLog.length === 0) {
    //   return;
    // }
    // console.log('DSH: new chat log received', chatLog.length);
    // const newMessage = chatLog[chatLog.length - 1];
    // if (newMessage.sender === SenderType.PLAYER) {
    //   console.log('DSH: new chat log received', newMessage.message);
    //   // Check if we're waiting for multiple user responses
    //   if (this.isWaitingForMultiUserResponses(curStep)) {
    //     // Record this player's response
    //     const senderId = newMessage.senderId;
    //     if (senderId) {
    //       this.recordPlayerResponse(
    //         curStep.stepId,
    //         senderId,
    //         newMessage.message
    //       );
    //       // Check if all players have responded
    //       if (this.allPlayersResponded(curStep.stepId)) {
    //         // Aggregate all messages and proceed
    //         const aggregatedMessage = this.getAggregatedMessages(
    //           curStep.stepId
    //         );
    //         this.markAllResponsesReceived(curStep.stepId);
    //         this.handleNewUserMessage(curStage, curStep, aggregatedMessage);
    //       }
    //       // If not all players have responded yet, just wait
    //     }
    //   } else {
    //     // Normal single-user flow
    //     this.handleNewUserMessage(curStage, curStep, newMessage.message);
    //   }
    // }
  }

  async handlePromptStep(
    curStage: DiscussionCurrentStage,
    curStep: PromptStageStep
  ) {
    // this.setResponsePending(true);
    // // handle replacing promptText with stored data
    // const promptText = replaceStoredDataInString(
    //   curStep.promptText,
    //   this.stateData
    // );
    // // handle replacing responseFormat with stored data
    // const responseFormat = replaceStoredDataInString(
    //   curStep.responseFormat,
    //   this.stateData
    // );
    // // handle replacing customSystemRole with stored data
    // const customSystemRole = replaceStoredDataInString(
    //   curStep.customSystemRole,
    //   this.stateData
    // );
    // const llmRequest: GenericLlmRequest = {
    //   prompts: [],
    //   outputDataType: curStep.outputDataType,
    //   targetAiServiceModel: this.targetAiServiceModel,
    //   responseFormat: responseFormat,
    //   systemRole: customSystemRole,
    // };
    // if (curStep.includeChatLogContext) {
    //   llmRequest.prompts.push({
    //     promptText: `Current state of chat log between user and system: ${chatLogToString(
    //       this.chatLog
    //     )}`,
    //     promptRole: PromptRoles.SYSTEM,
    //   });
    // }
    // llmRequest.prompts.push({
    //   promptText: promptText,
    //   promptRole: PromptRoles.SYSTEM,
    // });
    // if (
    //   curStep.jsonResponseData &&
    //   curStep.outputDataType === PromptOutputTypes.JSON
    // ) {
    //   llmRequest.responseFormat +=
    //     recursivelyConvertExpectedDataToAiPromptString(
    //       recursiveUpdateAdditionalInfo(
    //         curStep.jsonResponseData,
    //         this.stateData
    //       )
    //     );
    // }
    // // handle sending prompt
    // const requestFunction = async () => {
    //   const _response = await this.executePrompt(llmRequest);
    //   const response = extractServiceStepResponse(_response, 0);
    //   if (curStep.outputDataType === PromptOutputTypes.JSON) {
    //     if (!isJsonString(response)) {
    //       throw new Error('Did not receive valid JSON data');
    //     }
    //     if (curStep.jsonResponseData) {
    //       if (!receivedExpectedData(curStep.jsonResponseData, response)) {
    //         this.errorMessage = 'Did not receive expected JSON data';
    //         throw new Error('Did not receive expected JSON data');
    //       }
    //     }
    //     const resData = JSON.parse(response);
    //     this.stateData = { ...this.stateData, ...resData };
    //     this.newPlayerStateData &&
    //       this.newPlayerStateData(
    //         convertCollectedDataToGSData(resData),
    //         this.playerId
    //       );
    //   } else {
    //     // is a text response
    //     const sessionId = localStorageGet(SESSION_ID);
    //     this.sendMessage({
    //       id: uuidv4(),
    //       message: response,
    //       isPromptResponse: true,
    //       sender: SenderType.SYSTEM,
    //       displayType: MessageDisplayType.TEXT,
    //       sessionId: sessionId as string,
    //     });
    //   }
    // };
    // // try request function 3 times
    // let counter = 0;
    // let success = false;
    // while (counter < 3) {
    //   try {
    //     await requestFunction();
    //     success = true;
    //     break;
    //   } catch (err) {
    //     counter++;
    //   }
    // }
    // if (!success) {
    //   this.sendErrorMessage('AI Service request failed');
    //   this.lastFailedStepId = curStep.stepId;
    //   this.setResponsePending(false);
    //   return;
    // }
    // this.setResponsePending(false);
    // return this.updateRoomWithNextStep(curStage, curStep);
  }

  simulationEnded(): void {
    return;
  }

  globalStateUpdated(newState: GlobalStateData): void {
    console.log('DSH: global state updated', newState);
    // this.globalStateData = newState;
    return;
  }

  playerStateUpdated(
    curStage: DiscussionCurrentStage,
    curStep: DiscussionStageStep,
    newState: PlayerStateData[]
  ): void {
    // console.log('DSH: player state updated', curStage, curStep, newState);
    // this.playerStateData = newState;
    // // Check if we're waiting for multi-user responses
    // if (this.isWaitingForMultiUserResponses(curStep)) {
    //   const tracking = this.stepResponseTracking[curStep.stepId];
    //   const currentPlayerIds = newState.map((p) => p.player);
    //   // Find players who left (were in tracking but no longer in playerStateData)
    //   const removedPlayers = tracking.requiredPlayerIds.filter(
    //     (playerId) => !currentPlayerIds.includes(playerId)
    //   );
    //   // Remove each departed player from tracking
    //   for (const playerId of removedPlayers) {
    //     this.removePlayerFromTracking(curStep.stepId, playerId);
    //   }
    //   // Check if all remaining players have responded
    //   if (
    //     removedPlayers.length > 0 &&
    //     this.allPlayersResponded(curStep.stepId)
    //   ) {
    //     const aggregatedMessage = this.getAggregatedMessages(curStep.stepId);
    //     this.markAllResponsesReceived(curStep.stepId);
    //     this.handleNewUserMessage(curStage, curStep, aggregatedMessage);
    //   }
    // }
  }

  playersUpdated(newState: Player[]): void {
    console.log('DSH: players updated', newState);
    return;
  }
}
