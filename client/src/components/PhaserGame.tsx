/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import SportsGame, { BasketballStateHandler } from "../game/basketball";
import { GameStateHandler } from "../classes/game-state/game-state-handler";
import { useAppDispatch } from "../store/hooks";
import { startGame } from "../store/slices/gameData";
import EventSystem from "../game/event-system";

export default function PhaserGame(): JSX.Element {
  const dispatch = useAppDispatch();
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [game, setGame] =
    React.useState<Phaser.Types.Core.GameConfig>(SportsGame);
  const [gameController, setGameController] = React.useState<GameStateHandler>(
    new BasketballStateHandler()
  );
  const [phaserGame, setPhaserGame] = React.useState<Phaser.Game>();

  // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
  React.useLayoutEffect(() => {
    if (gameContainerRef && !phaserGame) {
      const config = {
        ...game,
        scale: {
          mode: Phaser.Scale.RESIZE,
          height: gameContainerRef?.current?.clientHeight!,
          width: gameContainerRef?.current?.clientWidth!,
        },
        parent: gameContainerRef.current as HTMLElement,
      };
      const pg = new Phaser.Game(config);
      pg.scene.start("Preloader");
      dispatch(startGame(gameController));
      setPhaserGame(pg);
    }
    return () => {
      if (phaserGame) {
        phaserGame.destroy(true);
        setPhaserGame(undefined);
      }
      if (gameContainerRef.current?.children.length) {
        gameContainerRef.current.removeChild(
          gameContainerRef.current.children[0]
        );
      }
    };
  }, [gameContainerRef]);

  return (
    <div
      id="game-container"
      ref={gameContainerRef}
      style={{
        height: window.innerHeight,
        width: window.innerWidth * (9 / 12) - 15,
        backgroundColor: "pink,",
      }}
    />
  );
}
