/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useWithPhaserGame } from '../hooks/use-with-phaser-game';
import { useAppSelector } from '../store/hooks';
import BasketballGame from '../game/basketball';
import ConcertGame from '../game/concert-ticket-sales';
import withAuthorizationOnly from '../wrap-with-authorization-only';
import EventSystem from '../game/event-system';

function PhaserTestPage(): JSX.Element {
  const { player } = useAppSelector((state) => state.playerData);
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [game] = React.useState<string>('concert');
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);

  React.useEffect(() => {
    if (game === 'basketball') {
      startPhaserGame(BasketballGame.config, undefined, 'Simulation');
    } else {
      startPhaserGame(ConcertGame.config, undefined, 'Simulation');
    }
    EventSystem.on('sceneCreated', sceneCreated);
  }, []);

  function sceneCreated() {
    if (game === 'basketball') {
      EventSystem.emit('simulate', {
        player: player?.clientId,
        playerAvatar: player,
        insideShots: 10,
        midShots: 10,
        outsideShots: 80,
        insidePoints: 2,
        midPoints: 2,
        outsidePoints: 3,
        insidePercent: 0.75,
        midPercent: 0.5,
        outsidePercent: 0.25,
      });
    } else {
      EventSystem.emit('simulate', {
        player: player?.clientId,
        playerAvatar: player,
        generalAdmissionTicketsUpForSale: 40,
        reservedTicketsUpForSale: 30,
        vipTicketsUpForSale: 30,
        generalAdmissionTicketsSold: 5,
        reservedTicketsSold: 5,
        vipTicketsSold: 80,
      });
    }
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
