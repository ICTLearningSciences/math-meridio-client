/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { v4 as uuid } from 'uuid';
import {
  ChatMessage,
  SenderType,
  sendMessage as _sendMessage,
} from '../store/slices/game';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export abstract class ChatLogSubscriber {
  abstract newChatLogReceived(chatLog: ChatMessage[]): void;
}

export interface UseWithChat {
  ttsMessage: ChatMessage | undefined;
  playTTSMessage: (msg: ChatMessage) => void;
  sendMessage: (sender: SenderType, message: string) => void;
  addNewSubscriber: (subscriber: ChatLogSubscriber) => void;
  removeAllSubscribers: () => void;
}

export function useWithChat(): UseWithChat {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.gameData.chat);
  const [subscribers, setSubscribers] = React.useState<ChatLogSubscriber[]>([]);
  const [ttsMessage, setTTSMessage] = React.useState<ChatMessage>();

  React.useEffect(() => {
    for (let i = 0; i < subscribers.length; i++) {
      const newChatLogFunction = subscribers[i].newChatLogReceived.bind(
        subscribers[i]
      );
      newChatLogFunction(messages);
    }
  }, [messages]);

  function playTTSMessage(msg: ChatMessage): void {
    setTTSMessage(msg);
  }

  function sendMessage(sender: SenderType, message: string): void {
    const msg = {
      id: uuid(),
      sender: sender,
      message: message,
    };
    dispatch(_sendMessage(msg));
  }

  function addNewSubscriber(subscriber: ChatLogSubscriber) {
    setSubscribers([...subscribers, subscriber]);
  }

  function removeAllSubscribers() {
    setSubscribers([]);
  }

  return {
    ttsMessage,
    playTTSMessage,
    sendMessage,
    addNewSubscriber,
    removeAllSubscribers,
  };
}
