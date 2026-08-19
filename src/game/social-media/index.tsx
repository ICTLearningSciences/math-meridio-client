/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Phaser from "phaser";
import type { Game } from "../types";
import { SimulationScene } from "./SimulationScene";

import { ProblemComponent } from "./problem";
import { SolutionComponent } from "./solution";
import { PlayerStrategy, SimulationComponent } from "./simulation";
import { ResultComponent } from "./results";
import type {
  GameData,
  GameStateData,
  PlayerStateData,
  Room,
} from "../../store/slices/game/types";
import type { Player } from "../../store/slices/player/types";

export const UNDERSTANDS_ALGORITHM_KEY = "understands_algorithm";
export const UNDERSTANDS_MULTIPLICATION_KEY = "understands_multiplication";
export const UNDERSTANDS_ADDITION_KEY = "understands_addition";
export const UNDERSTANDS_CONVERSION_RATE_KEY = "understands_conversion_rate";
export const UNDERSTANDS_VIDEO_REVENUE_KEY = "understands_video_revenue";
export const BEST_STRATEGY_FOUND_KEY = "best_strategy_found";

export const SHORT_DANCE_PERCENT_KEY = "vip_ticket_percent";
export const SHORT_DANCE_PRICE = 10;
export const SHORT_DANCE_CONVERSION_RATE = 0.2;

export const LONG_DANCE_PERCENT_KEY = "reserved_ticket_percent";
export const LONG_DANCE_PRICE = 100;
export const LONG_DANCE_CONVERSION_RATE = 0.5;

export const INSTRUCTIONAL_PERCENT_KEY = "general_admission_ticket_percent";
export const INSTRUCTIONAL_TICKET_PRICE = 250;
export const INSTRUCTIONAL_CONVERSION_RATE = 0.8;

export const TOTAL_NUMBER_OF_VIDEOS = 100;

const SocialMediaInfluencerGame: Game = {
  id: "social-media-influencer",
  name: "Social Media Influencer",
  problem: "",
  minProblem: "",
  config: {
    type: Phaser.CANVAS,
    backgroundColor: "#282c34",
    width: 1280,
    height: 720,
    scale: {
      // Fit to window
      mode: Phaser.Scale.FIT,
      // Center vertically and horizontally
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [SimulationScene],
  },
  showProblem: (minimize?: boolean) => {
    return <ProblemComponent minimize={minimize} />;
  },
  showSolution: (
    uiGameData: GameData,
    player: Player,
    updatePlayerStateData: (
      newPlayerStateData: GameStateData,
      playerId: string,
    ) => void,
    minimize?: boolean,
  ) => {
    return (
      <SolutionComponent
        uiGameData={uiGameData}
        player={player}
        updatePlayerStateData={updatePlayerStateData}
        minimize={minimize}
      />
    );
  },
  showSimulation: (game: Game) => {
    return <SimulationComponent game={game} />;
  },
  showPlayerStrategy: (
    player: Player,
    playersGameStateData: PlayerStateData,
    room: Room,
  ) => {
    return (
      <PlayerStrategy
        player={player}
        playersGameStateData={playersGameStateData}
        room={room}
      />
    );
  },
  showResult: (uiGameData: GameData) => {
    return <ResultComponent uiGameData={uiGameData} />;
  },
};

export default SocialMediaInfluencerGame;
