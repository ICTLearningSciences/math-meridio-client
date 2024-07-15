/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { v4 as uuid } from 'uuid';

import { jsonLlmRequest } from '../classes/game-state/api-helpers';
import {
  OpenAiServiceModel,
  pickAvatarSchema,
} from '../classes/game-state/types';
import SportsGame from '../game/basketball';
import EventSystem from '../game/event-system';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { ChatMessage, SenderType, sendMessage } from '../store/slices/gameData';
import { AVATAR_HEADS } from '../store/slices/playerData';
import { GenericLlmRequest, PromptOutputTypes, PromptRoles } from '../types';
import { TtsSpeak } from './tts';

export default function PhaserGame(): JSX.Element {
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

      // hard-coded, move to game manager
      EventSystem.on('sceneCreated', sceneCreated);
      EventSystem.on('systemMessageStart', systemMessageStart);
      EventSystem.on('avatarSelected', avatarSelected);
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

  // let's hard-code literally everything for now.......
  const [username, setUsername] = React.useState<string>();
  const [description, setDescription] = React.useState<string>();
  const [avatar, setAvatar] = React.useState<string>();
  React.useEffect(() => {
    if (chat.length === 0) return;
    const lastMessage = chat[chat.length - 1];
    if (lastMessage.sender === SenderType.SYSTEM) {
      console.log("");
    } else if (lastMessage.sender === SenderType.PLAYER) {
      EventSystem.emit('addChatMessage', lastMessage);
      if (!username) {
        EventSystem.emit('setPlayername', lastMessage.message);
        addMessage(
          SenderType.SYSTEM,
          `It's nice to meet you, ${lastMessage.message}`
        );
        addMessage(
          SenderType.SYSTEM,
          'What would you like your avatar to look like?'
        );
        setUsername(lastMessage.message);
      } else if (!avatar) {
        try {
          requestAvatar(lastMessage.message);
          setDescription(lastMessage.message);
        } catch (err) {
          addMessage(
            SenderType.SYSTEM,
            `Sorry, I didn't understand that. Try something else.`
          );
        }
      } else {
        // use AI to parse for actual responses...
        if (lastMessage.message === 'yes') {
          console.log("");
        } else if (lastMessage.message === 'no') {
          addMessage(
            SenderType.SYSTEM,
            'What would you like your avatar to look like?'
          );
          EventSystem.emit('showAvatars', []);
          setAvatar(undefined);
        }
      }
    }
  }, [chat]);
  function sceneCreated(scene: string) {
    if (scene === 'AvatarCreator') {
      addMessage(SenderType.SYSTEM, 'Welcome to Math Meridio!');
      addMessage(SenderType.SYSTEM, 'What would you like to be called?');
      // addMessage(
      //   PromptRoles.ASSISSANT,
      //   'Use the chat button or box to respond:'
      // );
    }
  }
  function systemMessageStart(msg: ChatMessage) {
    setTTSMessage(msg);
  }
  function addMessage(sender: SenderType, message: string) {
    const msg = {
      id: uuid(),
      sender: sender,
      message: message,
    };
    dispatch(sendMessage(msg));
    if (sender === SenderType.SYSTEM) {
      EventSystem.emit('addSystemMessage', msg);
    } else {
      EventSystem.emit('addChatMessage', msg);
    }
  }
  async function requestAvatar(desc: string): Promise<void> {
    addMessage(SenderType.SYSTEM, 'Fetching your avatar results...');
    EventSystem.emit('loadingAvatars', true);
    const request: GenericLlmRequest = {
      prompts: [
        {
          promptText: JSON.stringify(AVATAR_HEADS),
          promptRole: PromptRoles.USER,
        },
        {
          promptText:
            'Based on the following description, choose five items to add from the list of items above, provide just the id of the item to add.',
          promptRole: PromptRoles.USER,
        },
        {
          promptText: desc,
          promptRole: PromptRoles.USER,
        },
      ],
      targetAiServiceModel: OpenAiServiceModel,
      outputDataType: PromptOutputTypes.JSON,
      responseFormat: `
          Please only respond in JSON.
          Validate that your response is in valid JSON.
          Respond in this format:
            [{
                "id": "string" // the id of the item
            }]
        `,
    };
    const res = await jsonLlmRequest<{ id: string }[]>(
      request,
      pickAvatarSchema
    );
    EventSystem.emit('loadingAvatars', false);
    addMessage(
      SenderType.SYSTEM,
      'Select an avatar base or try describing your avatar again:'
    );
    EventSystem.emit(
      'showAvatars',
      res.map((a) => a.id)
    );
  }
  function avatarSelected(avatar: string) {
    console.log('avatarselected: ', avatar);
    setAvatar(avatar);
    addMessage(
      SenderType.SYSTEM,
      `Is this how you would like your avatar to look?`
    );
  }
  // end hard-coding

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
