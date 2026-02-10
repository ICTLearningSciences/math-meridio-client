/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';

import { GameStateHandler } from '../../classes/abstract-game-data';
import { useWithPhaserGame } from '../../hooks/use-with-phaser-game';
import { PlayerStateData } from '../../store/slices/game';
import EventSystem from '../event-system';
import { Typography } from '@mui/material';
import { BasketballSimulationData } from './SimulationScene';
import {
  INSIDE_SHOT_PERCENT,
  MID_SHOT_PERCENT,
  OUTSIDE_SHOT_PERCENT,
  NUMBER_OF_SHOTS,
  OUTSIDE_SHOT_SUCCESS_VALUE,
  INSIDE_SHOT_SUCCESS_VALUE,
  MID_SHOT_SUCCESS_VALUE,
  OUTSIDE_SHOT_POINTS_VALUE,
  INSIDE_SHOT_POINTS_VALUE,
  MID_SHOT_POINTS_VALUE,
} from './solution';

export function PlayerStrategy(props: {
  data: PlayerStateData;
  controller: GameStateHandler;
}): JSX.Element {
  const psd = props.data;
  const controller = props.controller;
  const player = controller.players.find((p) => p._id === psd.player);
  const insideShots =
    psd.gameStateData.find((d) => d.key === INSIDE_SHOT_PERCENT)?.value || 0;
  const midShots =
    psd.gameStateData.find((d) => d.key === MID_SHOT_PERCENT)?.value || 0;
  const outsideShots =
    psd.gameStateData.find((d) => d.key === OUTSIDE_SHOT_PERCENT)?.value || 0;

  const canSimulate = Boolean(
    parseInt(insideShots) + parseInt(midShots) + parseInt(outsideShots) ===
      NUMBER_OF_SHOTS
  );

  function simulate(): void {
    if (!canSimulate) return;
    const simData: BasketballSimulationData = {
      player: psd.player,
      outsideShots: outsideShots,
      midShots: midShots,
      insideShots: insideShots,
      outsideShotsMade: Math.round(outsideShots * OUTSIDE_SHOT_SUCCESS_VALUE),
      insideShotsMade: Math.round(insideShots * INSIDE_SHOT_SUCCESS_VALUE),
      midShotsMade: Math.round(midShots * MID_SHOT_SUCCESS_VALUE),
      totalPoints: 0,
    };
    simData.totalPoints =
      simData.outsideShotsMade * OUTSIDE_SHOT_POINTS_VALUE +
      simData.insideShotsMade * INSIDE_SHOT_POINTS_VALUE +
      simData.midShotsMade * MID_SHOT_POINTS_VALUE;
    EventSystem.emit('simulate', simData);
  }

  return (
    <div
      onClick={simulate}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography style={{ fontWeight: 'bold' }}>
        {player?.name}&apos;s strategy:
      </Typography>
      <Typography>
        {insideShots} inside, {midShots} mid, {outsideShots} 3-pointers
      </Typography>
    </div>
  );
}

export function SimulationComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);

  React.useEffect(() => {
    startPhaserGame(props.controller.game, props.controller, 'Simulation');
  }, [props.controller]);

  return (
    <>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{ height: window.innerHeight / 2 - 150 }}
      />
    </>
  );
}
