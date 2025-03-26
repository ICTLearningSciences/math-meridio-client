import React from 'react';
import { GameStateHandler } from '../../classes/game-state-handler';
import { useWithPhaserGame } from '../../hooks/use-with-phaser-game';

export function SimulationComponent(props: { controller: GameStateHandler }): JSX.Element {
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);

  React.useEffect(() => {
    // Start the Phaser scene named 'SoccerGame'
    startPhaserGame(props.controller.game, props.controller, 'SoccerGame');
  }, [props.controller]);

  return (
    <div
      id="game-container"
      ref={gameContainerRef}
      style={{ height: window.innerHeight / 2 - 150 }}
    />
  );
}
