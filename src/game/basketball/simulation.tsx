/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';

import { OverlayBox } from '../../components/overlay-box';
import { GameStateHandler } from '../../classes/game-state-handler';
import { useWithPhaserGame } from '../../hooks/use-with-phaser-game';
import { PlayerStateData } from '../../store/slices/game';
import EventSystem from '../event-system';

export function SimulationComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  // todo
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);
  const [simulation, setSimulation] = React.useState<PlayerStateData>();

  React.useEffect(() => {
    EventSystem.on('simulate', (sim: PlayerStateData) => setSimulation(sim));
  }, []);

  React.useEffect(() => {
    startPhaserGame(props.controller.game, props.controller, 'Simulation');
  }, [props.controller]);

  return (
    <>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{
          width: '100%',
          display: simulation ? '' : 'none',
        }}
      />
      {!simulation && (
        <OverlayBox message="Select a strategy first to see simulation" />
      )}
    </>
  );
}
