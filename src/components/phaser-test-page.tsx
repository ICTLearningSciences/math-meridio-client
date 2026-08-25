/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useWithPhaserGame } from "../hooks/use-with-phaser-game";
import { useAppSelector } from "../store/hooks";
import { GAMES, type GameType } from "../game/types";
import BasketballGame from "../game/basketball";
import ConcertGame from "../game/concert-ticket-sales";
import SocialMediaGame from "../game/social-media";
import EventSystem from "../game/event-system";
import { DropdownButton, OutlinedButton } from "./button";
import { getRandomNumber } from "../helpers";
import { Typography } from "@mui/material";

const GAME_CONFIGS: Record<GameType, Phaser.Types.Core.GameConfig> = {
  basketball: BasketballGame.config,
  "concert-ticket-sales": ConcertGame.config,
  "social-media-influencer": SocialMediaGame.config,
};

export default function PhaserTestPage(): React.ReactNode {
  const { player } = useAppSelector((state) => state.playerData);
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [gameType, setGameType] = React.useState<GameType>();
  const { phaserGame, startPhaserGame, destroyPhaserGame } =
    useWithPhaserGame(gameContainerRef);

  function runGame() {
    if (gameType === "basketball") runBasketball();
    else if (gameType === "concert-ticket-sales") runConcert();
    else if (gameType === "social-media-influencer") runSocialMedia();
  }

  function closeGame(): void {
    if (phaserGame) {
      destroyPhaserGame(phaserGame);
      setGameType(undefined);
    }
  }

  function runBasketball(): void {
    const outsideShots = getRandomNumber(10, 50);
    const midShots = getRandomNumber(10, 50);
    const insideShots = 100 - outsideShots - midShots;
    EventSystem.emit("simulate", {
      player: player?._id,
      playerAvatar: player,
      outsideShots,
      outsidePoints: 3,
      outsidePercent: 0.25,
      midShots,
      midPoints: 2,
      midPercent: 0.5,
      insideShots,
      insidePoints: 2,
      insidePercent: 0.75,
    });
  }

  function runConcert(): void {
    const vipTicketsUpForSale = getRandomNumber(0, 50);
    const reservedTicketsUpForSale = getRandomNumber(0, 50);
    const generalAdmissionTicketsUpForSale =
      100 - vipTicketsUpForSale - reservedTicketsUpForSale;
    EventSystem.emit("simulate", {
      player: player?._id,
      playerAvatar: player,
      vipTicketsUpForSale,
      reservedTicketsUpForSale,
      generalAdmissionTicketsUpForSale,
    });
  }

  function runSocialMedia(): void {
    const danceShorts = getRandomNumber(0, 50);
    const musicVideos = getRandomNumber(0, 50);
    const techVideos = 100 - danceShorts - musicVideos;
    EventSystem.emit("simulate", {
      player: player?._id,
      playerAvatar: player,
      danceShorts,
      musicVideos,
      techVideos,
    });
  }

  React.useEffect(() => {
    if (gameType) {
      startPhaserGame(GAME_CONFIGS[gameType], "Simulation");
      EventSystem.on("sceneCreated", runGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType]);

  return (
    <>
      <div className="row center-div">
        {gameType ? (
          <OutlinedButton onClick={closeGame}>Close</OutlinedButton>
        ) : (
          <DropdownButton
            label={GAMES.find((g) => g.id === gameType)?.name || "Select Game"}
            value={gameType}
            items={GAMES.map((g) => g.id)}
            onSelect={(id: string) => setGameType(id as GameType)}
            renderItem={(id) => {
              return (
                <Typography>{GAMES.find((g) => g.id === id)?.name}</Typography>
              );
            }}
          />
        )}
      </div>
      {gameType && (
        <div
          id="game-container"
          ref={gameContainerRef}
          style={{
            height: window.innerHeight - 200,
            width: window.innerWidth,
          }}
        />
      )}
    </>
  );
}
