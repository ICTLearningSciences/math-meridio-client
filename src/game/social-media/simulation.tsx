/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";

import { useWithPhaserGame } from "../../hooks/use-with-phaser-game";
import type { GameStateData, Room } from "../../store/slices/game/types";
import EventSystem from "../event-system";
import { Typography } from "@mui/material";
import type { SocialMediaSimulationData } from "./SimulationScene";
import {
  SHORT_DANCE_PERCENT_KEY,
  LONG_DANCE_PERCENT_KEY,
  INSTRUCTIONAL_PERCENT_KEY,
  TOTAL_NUMBER_OF_VIDEOS,
  INSTRUCTIONAL_CONVERSION_RATE,
  SHORT_DANCE_CONVERSION_RATE,
  LONG_DANCE_CONVERSION_RATE,
  INSTRUCTIONAL_TICKET_PRICE,
  SHORT_DANCE_PRICE,
  LONG_DANCE_PRICE,
} from ".";
import type { Player } from "../../store/slices/player/types";
import type { Game } from "../types";
import { viewGameRoomSimulation } from "../../hooks/game-room-api";
import { useWithPlayer } from "../../store/slices/player/use-with-player-state";

export function PlayerStrategy(props: {
  playersGameStateData: GameStateData;
  player: Player;
  room: Room;
}): React.ReactNode {
  const psd = props.playersGameStateData;
  const vipTicketsUpForSale = psd[SHORT_DANCE_PERCENT_KEY] || 0;
  const reservedTicketsUpForSale = psd[LONG_DANCE_PERCENT_KEY] || 0;
  const generalAdmissionTicketsUpForSale = psd[INSTRUCTIONAL_PERCENT_KEY] || 0;
  const { player } = useWithPlayer();

  const canSimulate = Boolean(
    parseInt(vipTicketsUpForSale) +
      parseInt(reservedTicketsUpForSale) +
      parseInt(generalAdmissionTicketsUpForSale) ===
    TOTAL_NUMBER_OF_VIDEOS,
  );

  function simulate(): void {
    if (!canSimulate) return;
    const simData: SocialMediaSimulationData = {
      player: props.player._id,
      playerAvatar: props.player,
      danceShorts: generalAdmissionTicketsUpForSale,
      danceShortsViewed: Math.round(
        generalAdmissionTicketsUpForSale * INSTRUCTIONAL_CONVERSION_RATE,
      ),
      danceLongs: reservedTicketsUpForSale,
      danceLongsViewed: Math.round(
        reservedTicketsUpForSale * LONG_DANCE_CONVERSION_RATE,
      ),
      instructionals: vipTicketsUpForSale,
      instructionalsViewed: Math.round(
        vipTicketsUpForSale * SHORT_DANCE_CONVERSION_RATE,
      ),
      totalProfit: 0,
    };
    simData.totalProfit =
      simData.danceShortsViewed * INSTRUCTIONAL_TICKET_PRICE +
      simData.instructionalsViewed * SHORT_DANCE_PRICE +
      simData.danceLongsViewed * LONG_DANCE_PRICE;
    EventSystem.emit("destroy");
    EventSystem.emit("simulate", simData);
    viewGameRoomSimulation(props.room._id);
  }

  return (
    <div
      onClick={simulate}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography style={{ fontWeight: "bold" }}>
        {player?._id === props.player?._id ? "My " : `${props.player?.name}'s`}{" "}
        strategy:
      </Typography>
      <Typography>
        {vipTicketsUpForSale} vip, {reservedTicketsUpForSale} reserved,{" "}
        {generalAdmissionTicketsUpForSale} general admission
      </Typography>
    </div>
  );
}

export function SimulationComponent(props: { game: Game }): React.ReactNode {
  const { game } = props;
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);

  React.useEffect(() => {
    startPhaserGame(game.config, "Simulation");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.config]);

  return (
    <>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{ height: "100%" }}
      />
    </>
  );
}
