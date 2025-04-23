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
    const msg: ChatMessage = {
      id: uuid(),
      sender: SenderType.PLAYER,
      senderId: player?.clientId,
      senderName: player?.name,
      message: input,
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
