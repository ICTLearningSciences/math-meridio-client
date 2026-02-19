/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useState, useEffect, useRef } from 'react';
import { ChatMessage, SenderType } from '../../store/slices/game/types';

export function useAnimatedMessages(messages: ChatMessage[]) {
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    // Don't restart animation if messages reference hasn't changed (just a re-render)
    if (previousMessagesRef.current === messages) {
      return;
    }

    const wasAnimating = animationIntervalRef.current !== null;
    const previousLength = previousMessagesRef.current.length;
    previousMessagesRef.current = messages;

    // Clear any ongoing animation
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    // If new messages arrived while animating, display all instantly
    if (wasAnimating) {
      setDisplayedMessages(messages);
      setIsAnimating(false);
      return;
    }

    if (messages.length === 0) {
      setDisplayedMessages([]);
      setIsAnimating(false);
      return;
    }

    const lastMessage = messages[messages.length - 1];

    // If last message is from a player, display all instantly
    if (lastMessage.sender === SenderType.PLAYER) {
      setDisplayedMessages(messages);
      setIsAnimating(false);
      return;
    }

    // Last message is from system
    // Find all consecutive system messages at the end (up to most recent user message)
    let systemMessageStartIndex = messages.length - 1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === SenderType.SYSTEM) {
        systemMessageStartIndex = i;
      } else {
        break;
      }
    }

    // Start animating from where we left off
    // If we had previously displayed some messages, continue from there
    // Otherwise, start from before the system messages
    const startIndex = Math.max(previousLength, systemMessageStartIndex);

    // If all messages were already displayed, just show everything
    if (startIndex >= messages.length) {
      setDisplayedMessages(messages);
      setIsAnimating(false);
      return;
    }

    // Start animation from the start index, showing one new message per second
    setIsAnimating(true);
    setDisplayedMessages(messages.slice(0, startIndex));

    let currentIndex = startIndex;
    animationIntervalRef.current = setInterval(() => {
      currentIndex++;
      setDisplayedMessages(messages.slice(0, currentIndex));

      if (currentIndex >= messages.length) {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }
        setIsAnimating(false);
      }
    }, 1000);

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [messages]);

  return { displayedMessages, isAnimating };
}
