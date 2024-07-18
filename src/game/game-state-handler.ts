/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  DiscussionStage,
  StageBuilderStep,
} from '../components/discussion-stage-builder/types';
import { ChatMessage, GlobalStateData } from '../store/slices/game';
import { Subscriber } from '../store/slices/game/use-with-game-state';
import { Player } from '../store/slices/player';

export interface GameStateHandlerArgs {
  sendMessage: (msg: ChatMessage) => void;
  globalStateData: GlobalStateData;
  player: Player;
}

export abstract class GameStateHandler implements Subscriber {
  currentStage: DiscussionStage | undefined;
  currentStep: StageBuilderStep | undefined;

  myPlayer: Player;
  players: Player[] = [];
  chatLog: ChatMessage[] = [];
  sendMessage: (msg: ChatMessage) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameStateData: Record<string, any> = {};
  globalStateData: GlobalStateData;

  constructor(args: GameStateHandlerArgs) {
    this.sendMessage = args.sendMessage;
    this.globalStateData = args.globalStateData;
    this.myPlayer = args.player;
  }

  newChatLogReceived(chatLog: ChatMessage[]): void {
    this.chatLog = chatLog;
  }

  globalStateUpdated(newGlobalState: GlobalStateData): void {
    // subscribe this function to the redux states global state data
    this.globalStateData = newGlobalState;
  }

  gameStateUpdated(newGameState: Record<string, any>): void {
    // subscribe this function to the redux states global state data
    this.gameStateData = newGameState;
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
}
