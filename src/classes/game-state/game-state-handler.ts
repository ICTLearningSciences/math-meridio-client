/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  DiscussionStage,
  SimulationStage,
  StageBuilderStep,
} from '../../components/discussion-stage-builder/types';
import { ChatLogSubscriber, UseWithChat } from '../../hooks/use-with-chat';
import { ChatMessage, SenderType } from '../../store/slices/game';
import { Player } from '../../store/slices/player';

export interface GlobalStateData {
  player: Player;
}

export abstract class GameStateHandler implements ChatLogSubscriber {
  currentStage?: DiscussionStage;
  currentStep?: StageBuilderStep;
  globalStateData: GlobalStateData;
  stages: DiscussionStage[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameStateData: Record<string, any> = {};
  chatLog: ChatMessage[] = [];
  players: Player[] = [];

  sendMessage: (msg: ChatMessage) => void;

  constructor(sendMessage: (msg: ChatMessage) => void, player: Player) {
    this.sendMessage = sendMessage;
    this.stages = [];
    this.globalStateData = {
      player,
    };
  }

  newChatLogReceived(chatLog: ChatMessage[]): void {
    this.chatLog = chatLog;
  }

  startGame(): void {
    // todo
  }

  resetGame(): void {
    // todo
  }

  setStage(stage: DiscussionStage): void {
    this.currentStage = stage;
    this.currentStep = stage.flowsList[0].steps[0];
  }

  nextStage(): void {
    // todo
  }

  globalStateUpdated(newGlobalState: GlobalStateData): void {
    // subscribe this function to the redux states global state data
    this.globalStateData = newGlobalState;
  }
}
