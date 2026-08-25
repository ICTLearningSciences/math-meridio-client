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

export const DANCE_PERCENT_KEY = "dance_shorts_count";
export const DANCE_PRICE = 10;
export const DANCE_CONVERSION_RATE = 200000;

export const MUSIC_PERCENT_KEY = "music_videos_count";
export const MUSIC_PRICE = 100;
export const MUSIC_CONVERSION_RATE = 16000;

export const TECH_PERCENT_KEY = "tech_videos_count";
export const TECH_PRICE = 250;
export const TECH_CONVERSION_RATE = 8000;

export const TOTAL_NUMBER_OF_VIDEOS = 100;
export const VIDEO_SUCCESS_RATE = 0.05;

const SocialMediaInfluencerGame: Game = {
  id: "social-media-influencer",
  name: "Social Media Influencer",
  problem:
    "You're trying to build a social media empire, but it has been a hard road. There are a lot of creators and only 5% of your videos get many views, no matter what type you make. However, different kinds of videos are worth different amounts of money.\n\nYouTube pays only $10 / 100k views of short videos, but it's easiest for those to go viral to over 100k's of views. Music videos pay more ($100 / 100k views), but a big hit only gets 15k views. Tech videos pay the most ($250 / 100k views) but you're lucky to get 10k people to watch.\n\nHow many videos of each type should we record to make the most money?",
  minProblem:
    "To make the most money, how many videos should be Dance Shorts ($10 / 100k views), versus Music Videos ($100 / 100k views), or Tech Repair ($250 / 100k views) videos?",
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
