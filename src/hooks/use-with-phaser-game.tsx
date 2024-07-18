/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { GameStateHandler } from '../game/game-state-handler';
import EventSystem from '../game/event-system';
import { useAppSelector } from '../store/hooks';

export function useWithPhaserGame(
  gameContainerRef: React.MutableRefObject<HTMLDivElement | null>
) {
  const { player } = useAppSelector((state) => state.playerData);
  const [game, setGame] = useState<Phaser.Types.Core.GameConfig>();
  const [scene, setScene] = useState<string>();
  const [controller, setController] = useState<GameStateHandler>();
  const [phaserGame, setPhaserGame] = useState<Phaser.Game>();

  const hasGame = Boolean(gameContainerRef.current?.firstChild);

  useEffect(() => {
    if (!game || phaserGame || hasGame) {
      return;
    }
    const config = {
      ...game,
      type: Phaser.CANVAS,
      backgroundColor: '#282c34',
      width: 1280,
      height: 720,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      parent: gameContainerRef.current as HTMLElement,
    };
    const pg = new Phaser.Game(config);
    pg.scene.start(scene || 'Boot', controller || { player });
    setPhaserGame(pg);
    // listeners
    EventSystem.on('sceneCreated', onSceneStarted);
    // deconstructor
    return () => {
      destroyPhaserGame();
    };
  }, [game]);

  function startPhaserGame(
    game: Phaser.Types.Core.GameConfig,
    controller?: GameStateHandler,
    scene?: string
  ): void {
    if (phaserGame) {
      destroyPhaserGame();
    }
    setController(controller);
    setScene(scene);
    setGame(game);
  }

  function startPhaserScene(scene: string): void {
    if (!phaserGame || !game) return;
    setScene(scene);
    phaserGame.scene.start(scene, controller);
  }

  function destroyPhaserGame(): void {
    if (phaserGame) {
      phaserGame.destroy(false);
      setGame(undefined);
      setPhaserGame(undefined);
    }
    if (
      gameContainerRef.current &&
      gameContainerRef.current.children.length > 0
    ) {
      gameContainerRef.current.removeChild(
        gameContainerRef.current.children[0]
      );
    }
  }

  /** */

  function onSceneStarted(scene: string): void {
    setScene(scene);
  }

  return {
    game,
    scene,
    controller,
    phaserGame,
    hasGame,
    startPhaserGame,
    startPhaserScene,
    destroyPhaserGame,
  };
}
