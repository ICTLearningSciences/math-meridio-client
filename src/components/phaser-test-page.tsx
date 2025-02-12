/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useWithPhaserGame } from '../hooks/use-with-phaser-game';
import { useAppSelector } from '../store/hooks';
import BasketballGame from '../game/basketball';
import withAuthorizationOnly from '../wrap-with-authorization-only';
import EventSystem from '../game/event-system';

// need change after soccer game is designed.
function PhaserTestPage(): JSX.Element {
  const { player } = useAppSelector((state) => state.playerData);
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);

  React.useEffect(() => {
    startPhaserGame(BasketballGame.config, undefined, 'Simulation');
    EventSystem.on('sceneCreated', sceneCreated);
  }, []);

  function sceneCreated() {
    EventSystem.emit('simulate', {
      player: player?.clientId,

      outsideShots: 2,
      midShots: 2,
      insideShots: 2,

      outsidePoints: 3,
      midPoints: 2,
      insidePoints: 2,

      outsidePercent: 0.25,
      midPercent: 0.5,
      insidePercent: 0.75,
    });
  }

  return (
    <>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{
          height: window.innerHeight - 100,
          width: window.innerWidth,
        }}
      />
    </>
  );
}

export default withAuthorizationOnly(PhaserTestPage);
