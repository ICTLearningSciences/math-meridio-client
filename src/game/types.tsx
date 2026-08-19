/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import BasketballGame from "./basketball";
import ConcertTicketSalesGame from "./concert-ticket-sales";
import SocialMediaInfluencerGame from "./social-media";
import type { GameData, GameStateData, Room } from "../store/slices/game/types";
import type { Player } from "../store/slices/player/types";

export type GameType =
  "basketball" | "concert-ticket-sales" | "social-media-influencer";

export interface Game {
  id: GameType;
  name: string;
  problem: string;
  minProblem?: string;
  config: Phaser.Types.Core.GameConfig;
  showProblem: (minimize?: boolean) => React.ReactNode;
  showSolution: (
    uiGameData: GameData,
    player: Player,
    updatePlayerStateData: (
      newPlayerStateData: GameStateData,
      playerId: string,
    ) => void,
    minimize?: boolean,
  ) => React.ReactNode;
  showSimulation: (game: Game) => React.ReactNode;
  showPlayerStrategy: (
    player: Player,
    playersGameStateData: GameStateData,
    room: Room,
  ) => React.ReactNode;
  showResult: (uiGameData: GameData) => React.ReactNode;
}

export const GAMES: Game[] = [
  BasketballGame,
  ConcertTicketSalesGame,
  SocialMediaInfluencerGame,
];
