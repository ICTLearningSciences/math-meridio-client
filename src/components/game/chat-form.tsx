/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import {
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Mic, MicOutlined, Send } from '@mui/icons-material';
import { GameData } from '../../store/slices/game/types';
import { useAppSelector } from '../../store/hooks';

export const MAX_MESSAGE_LENGTH = 500;

export default function ChatForm(props: {
  uiGameData?: GameData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage: (msg: string) => Promise<any>;
  isMyTurn: boolean;
  isPaused?: boolean;
  isTeacher?: boolean;
  phasesCompleted?: boolean;
  disabled?: boolean;
}): JSX.Element {
  const [input, setInput] = React.useState<string>('');
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();
  const { sendMessage, isMyTurn, isPaused } = props;
  const player = useAppSelector((state) => state.playerData.player);

  React.useEffect(() => {
    if (listening) {
      setInput(transcript);
    }
  }, [transcript]);

  async function onSend(): Promise<void> {
    if (input.trim() === '' || input.length > MAX_MESSAGE_LENGTH || isSending) {
      return;
    }
    try {
      setIsSending(true);
      await sendMessage(input);
      setInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  }

  function onKeyPress(
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    isMyTurn: boolean
  ): void {
    if (e.key === 'Enter') {
      if (isMyTurn) {
        onSend();
      }
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
    <div style={{ width: '100%' }}>
      {isPaused && (
        <Typography
          variant="body2"
          color="error"
          sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}
        >
          You have been paused by your instructor.
        </Typography>
      )}
      <div className="row" style={{ width: '100%' }}>
        <FormControl
          variant="outlined"
          style={{ flex: 1 }}
          disabled={isSending || props.disabled}
        >
          <InputLabel>
            {props.phasesCompleted
              ? 'You have completed the final phase of this activity.'
              : 'Chat:'}
          </InputLabel>
          <OutlinedInput
            data-cy="chat-input"
            label={
              props.phasesCompleted
                ? 'You have completed the final phase of this activity.'
                : 'Chat:'
            }
            type="text"
            value={input}
            disabled={
              listening ||
              isPaused ||
              isSending ||
              props.phasesCompleted ||
              props.disabled
            }
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => onKeyPress(e, isMyTurn)}
            style={{
              backgroundColor: 'white',
              animation:
                props.uiGameData?.curGameState?.playersLeftToRespond?.includes(
                  player?._id || ''
                ) &&
                !isPaused &&
                !props.phasesCompleted &&
                !isSending &&
                !props.isTeacher
                  ? 'blink 1s ease-in-out 0s infinite reverse'
                  : '',
            }}
            multiline
            inputProps={{ maxLength: MAX_MESSAGE_LENGTH }}
            startAdornment={
              input.length > MAX_MESSAGE_LENGTH * 0.75 && (
                <InputAdornment position="start">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    margin={0}
                    padding={0}
                  >
                    {input.length}/{MAX_MESSAGE_LENGTH}
                  </Typography>
                </InputAdornment>
              )
            }
            endAdornment={
              isSending ? (
                <CircularProgress size={20} color="primary" />
              ) : (
                <InputAdornment position="end">
                  <IconButton
                    data-cy="send-message-button"
                    type="submit"
                    color="primary"
                    edge="end"
                    onClick={onSend}
                    disabled={
                      input.length > MAX_MESSAGE_LENGTH ||
                      !isMyTurn ||
                      isPaused ||
                      isSending ||
                      props.phasesCompleted ||
                      props.disabled
                    }
                  >
                    <Send />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </FormControl>
        <Fab
          color={listening ? 'primary' : 'inherit'}
          onClick={onToggleSTT}
          disabled={
            !browserSupportsSpeechRecognition ||
            isPaused ||
            props.phasesCompleted ||
            props.disabled
          }
          style={{ marginLeft: 10 }}
        >
          {listening ? <Mic /> : <MicOutlined />}
        </Fab>
        <style>{`
            @keyframes blink {
                 0% { background: white; }
                 100% { background: lightyellow; }
            }
        `}</style>
      </div>
    </div>
  );
}
