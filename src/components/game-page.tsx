/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';

import SportsGame from '../game/basketball';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { ChatMessage } from '../store/slices/game';
import { TtsSpeak } from './tts';
import withAuthorizationOnly from '../wrap-with-authorization-only';
import { Grid } from '@mui/material';
import ChatThread from './game/chat-thread';
import ChatForm from './game/chat-form';

function PhaserGame(): JSX.Element {
  const dispatch = useAppDispatch();
  const chat = useAppSelector((state) => state.gameData.chat);
  const [ttsMessage, setTTSMessage] = React.useState<ChatMessage>();

  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [game, setGame] =
    React.useState<Phaser.Types.Core.GameConfig>(SportsGame);
  const [phaserGame, setPhaserGame] = React.useState<Phaser.Game>();

  React.useLayoutEffect(() => {
    if (gameContainerRef?.current && !phaserGame) {
      const config = {
        ...game,
        scale: {
          mode: Phaser.Scale.RESIZE,
          height: gameContainerRef.current.clientHeight!,
          width: gameContainerRef.current.clientWidth!,
        },
        parent: gameContainerRef.current as HTMLElement,
      };
      const pg = new Phaser.Game(config);
      pg.scene.start('AvatarCreator', {});
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
    <div>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{
          height: window.innerHeight,
          width: window.innerWidth * (9 / 12) - 15,
          backgroundColor: 'pink,',
        }}
      />
      <div style={{ display: 'none' }}>
        <TtsSpeak message={ttsMessage}>{ttsMessage?.message}</TtsSpeak>
      </div>
    </div>
  );
}

function GamePage(): JSX.Element {
  return (
    <Grid container xs={true} flexDirection="row">
      <Grid item xs={9}>
        <PhaserGame />
      </Grid>
      <Grid item xs={3} display="flex" flexDirection="column">
        <ChatThread />
        <ChatForm />
      </Grid>
    </Grid>
  );
}

export default withAuthorizationOnly(GamePage);
