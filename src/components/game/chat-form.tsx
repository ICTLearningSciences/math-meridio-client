/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { v4 as uuid } from 'uuid';
import {
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { Mic, MicOutlined, Send } from '@mui/icons-material';

import { useAppSelector } from '../../store/hooks';
import { ChatMessage, SenderType } from '../../store/slices/game';
import { useWithGame } from '../../store/slices/game/use-with-game-state';
import { SESSION_ID } from '../../store/local-storage';
import { localStorageGet } from '../../store/local-storage';

// MODIFIED
function containsBadWords(text: string): boolean {
  const bannedWords = ['swear1', 'swear2', 'swear3', 'swear'];
  const lowerCase = text.toLowerCase();
  return bannedWords.some((word) => lowerCase.includes(word));
}

// async function checkProfanity(message: string): Promise<boolean> {
//   try {
//     const response = await fetch("http://localhost:5001/check_profanity", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message })
//     });
//     const data = await response.json();
//     return data.is_profane;
//   } catch (error) {
//     console.error("Error checking profanity:", error);
//     // In case of error, decide whether to allow the message or block it.
//     return false;
//   }
// }

// /**
//  * Checks if a given message contains profanity/offensive language
//  * by using the OpenAI Chat API.
//  *
//  * The prompt instructs the model to answer with a single word:
//  * "Yes" if profanity is present and "No" if not.
//  *
//  * @param message - The message to be checked.
//  * @returns A promise that resolves to true if profanity is detected.
//  */
// async function checkProfanity(message: string): Promise<boolean> {
//   const prompt = `Check if the following text contains any profanity or offensive language. Answer with a single word: 'Yes' if it does, and 'No' if it does not.

// Text: "${message}"

// Answer:`;

//   try {
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Make sure to set REACT_APP_OPENAI_API_KEY in your environment variables.
//         'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: 'gpt-3.5-turbo',
//         messages: [{ role: 'user', content: prompt }],
//         max_tokens: 5,
//         temperature: 0,
//       }),
//     });
//     const data = await response.json();
//     if (!response.ok) {
//       console.error('OpenAI API error:', data);
//       return false;
//     }
//     const answer = data.choices[0].message.content.trim().toLowerCase();
//     return answer.startsWith('yes');
//   } catch (error) {
//     console.error('Error checking profanity:', error);
//     // In case of error, you may choose to allow the message.
//     return false;
//   }
// }

// END OF MODIFICATION

export default function ChatForm(props: {
  sendMessage?: (msg: ChatMessage) => void;
}): JSX.Element {
  const [input, setInput] = React.useState<string>('');
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();
  const { sendMessage } = useWithGame();
  const { player } = useAppSelector((state) => state.playerData);

  React.useEffect(() => {
    if (listening) {
      setInput(transcript);
    }
  }, [transcript]);

  function onSend(): void {
    const sessionId = localStorageGet(SESSION_ID);
    const msg: ChatMessage = {
      id: uuid(),
      sender: SenderType.PLAYER,
      senderId: player?.clientId,
      senderName: player?.name,
      message: input,
      sessionId: sessionId as string,
    };
    if (props.sendMessage) {
      props.sendMessage(msg);
    } else {
      sendMessage(msg);
    }
    setInput('');
  }

  function onKeyPress(
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void {
    if (e.key === 'Enter') {
      onSend();
      e.preventDefault();
    }
  }

  function onToggleSTT() {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      resetTranscript();
      SpeechRecognition.startListening();
    }
  }

  return (
    <div className="row" style={{ width: '100%' }}>
      <FormControl variant="outlined" style={{ flex: 1 }}>
        <InputLabel>Chat:</InputLabel>
        <OutlinedInput
          label="Chat:"
          type="text"
          value={input}
          disabled={listening}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => onKeyPress(e)}
          style={{ backgroundColor: 'white' }}
          multiline
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                type="submit"
                color="primary"
                edge="end"
                onClick={onSend}
              >
                <Send />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
      <Fab
        color={listening ? 'primary' : 'inherit'}
        onClick={onToggleSTT}
        disabled={!browserSupportsSpeechRecognition}
        style={{ marginLeft: 10 }}
      >
        {listening ? <Mic /> : <MicOutlined />}
      </Fab>
    </div>
  );
}
