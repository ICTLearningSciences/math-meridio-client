/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import SportsGame from "../game/sports";

export default function PhaserGame(): JSX.Element {
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [game, setGame] =
    React.useState<Phaser.Types.Core.GameConfig>(SportsGame);
  const [phaserGame, setPhaserGame] = React.useState<Phaser.Game>();

  // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
  React.useLayoutEffect(() => {
    if (game && gameContainerRef && !phaserGame) {
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
      pg.scene.start("Boot");
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
  }, [game, gameContainerRef]);

  return (
    <div
      id="game-container"
      ref={gameContainerRef}
      style={{
        height: window.innerHeight,
        width: window.innerWidth * (9 / 12),
        backgroundColor: "pink,",
      }}
    />
  );
}
