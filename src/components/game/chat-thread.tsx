/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../../store/hooks';
import {
  Avatar,
  AvatarProps,
  Box,
  Paper,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { GameData, SenderType } from '../../store/slices/game/types';
import React from 'react';
import AvatarSprite from '../avatar-sprite';
import {
  CurGameState,
  RequireInputType,
} from '../discussion-stage-builder/types';
import WaitingForPlayers from './waiting-for-players';
import { Player } from '../../store/slices/player/types';
import { ProcessingIndicator } from './processing-indicator';
import { useAnimatedMessages } from './use-animated-messages';

const useStyles = makeStyles()(() => ({
  chatThread: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'auto',
    spacing: 3,
  },
  chatItem: {
    position: 'relative',
    flexDirection: 'row',
    borderRadius: 30,
    alignItems: 'center',
    fontFamily: 'Helvetica, Arial, sans-serif',
    textAlign: 'left',
    '&.mine': {
      alignSelf: 'flex-end',
      backgroundColor: '#0084ff',
      borderBottomRightRadius: 5,
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        right: -15,
        bottom: -15,
        transform: 'rotate(270deg)',
        borderStyle: 'solid',
        borderWidth: '30px 0 0 30px',
        borderColor: '#0084ff transparent',
        borderRadius: '0 0 40px 0',
      },
    },
    '&.other': {
      alignSelf: 'flex-start',
      backgroundColor: '#e6e6e6',
      borderBottomLeftRadius: 5,
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: 0,
        bottom: -5,
        transform: 'rotate(-140deg)',
        borderStyle: 'solid',
        borderWidth: '30px 0 0 30px',
        borderColor: '#e6e6e6 transparent',
        borderRadius: '0 0 40px 0',
      },
      '&.PLAYER': {
        backgroundColor: '#d2eafe',
        '&:after': {
          borderColor: '#d2eafe transparent',
        },
      },
    },
  },
}));

export default function ChatThread(props: {
  roomIsProcessing: boolean;
  requestUserInputPhaseData: CurGameState;
  uiGameData: GameData;
}): JSX.Element {
  const { roomIsProcessing, requestUserInputPhaseData, uiGameData } = props;
  const { classes } = useStyles();
  const { player } = useAppSelector((state) => state.playerData);
  const allMessages = uiGameData.chat || [];
  const { displayedMessages, isAnimating } = useAnimatedMessages(allMessages);
  const messages = displayedMessages;
  const players = uiGameData.players;
  const playersBeingWaitedFor =
    requestUserInputPhaseData.playersLeftToRespond.reduce((acc, id) => {
      const player = players?.find((p) => p._id === id);
      if (player) {
        acc.push(player);
      }
      return acc;
    }, [] as Player[]);
  const isInRequestUserInputState =
    requestUserInputPhaseData.curState ===
      RequireInputType.ALL_USER_RESPONSES_REQUIRED_IN_ORDER ||
    requestUserInputPhaseData.curState ===
      RequireInputType.SINGLE_RESPONSE_REQUIRED ||
    requestUserInputPhaseData.curState ===
      RequireInputType.ALL_USER_RESPONSES_REQUIRED_FREE_FOR_ALL;

  enum PlayerColors {
    Blue = 'info.main',
    Green = 'success.main',
    Orange = 'warning.main',
    Lavender = 'secondary.main',
    Grey = 'text.secondary',
    Red = 'error.main',
  }

  const playerColorMap: Map<string, string> = new Map([]);

  const usedColors: Map<string, boolean> = new Map([
    [PlayerColors.Green, false],
    [PlayerColors.Lavender, false],
    [PlayerColors.Orange, false],
  ]);
  //setting only 3 colors as we have 4 players max. Blue is reserved for Self and Grey is for System.

  const GetUnusedColor = (): string => {
    let retColor = PlayerColors.Red.toString();
    for (const myKey of usedColors.keys()) {
      if (usedColors.get(myKey) == false) {
        usedColors.set(myKey, true);
        retColor = myKey;
        break;
      }
    }
    return retColor;
  };
  const GetMyColor = (id: string, isPlayer: boolean): string => {
    if (id != '') {
      if (!(id in playerColorMap)) {
        if (isPlayer) {
          playerColorMap.set(id, PlayerColors.Blue);
        } else {
          const unusedColor = GetUnusedColor();
          playerColorMap.set(id, unusedColor);
        }
      }
      return playerColorMap.get(id) as string;
    }

    return PlayerColors.Red;
  };

  const BorderedAvatar = styled(Avatar)`
    border: 3px solid lightseagreen;
  `;

  const stringAvatar = (name: string, id: string): AvatarProps => {
    if (!name) {
      return {
        alt: 'System',

        sx: {
          bgcolor: 'text.secondary',
        },
        children: 'S',
      };
    }
    if (name.split(' ').length > 1) {
      return {
        alt: name,
        sx: {
          bgcolor: playerColorMap.get(id),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
      };
    } else {
      return {
        alt: name,
        sx: {
          bgcolor: playerColorMap.get(id),
        },
        children: `${name.split(' ')[0][0]}`,
      };
    }
  };

  players?.forEach((iterPlayer: { _id: string }) => {
    GetMyColor(iterPlayer._id, iterPlayer._id == player?._id);
  });
  React.useEffect(() => {
    const objDiv = document.getElementById('chat-thread');
    if (objDiv) {
      objDiv.scroll({
        top: objDiv.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  let prevMessageOwner = '';
  let currMessageOwner = '';
  let skipAvatar = false;
  return (
    <div
      id="chat-thread"
      className={classes.chatThread}
      style={{
        backgroundColor: PlayerColors.Grey,
        maxHeight: window.innerHeight - 100,
      }}
    >
      <Stack direction="column">
        {messages.map((msg, idx) => {
          const myMessage =
            msg.sender === SenderType.PLAYER && msg.senderId === player?._id;

          if (msg.sender == SenderType.SYSTEM) {
            currMessageOwner = 'System';
          } else {
            currMessageOwner = msg.senderId ?? '';
          }
          if (prevMessageOwner == currMessageOwner) {
            skipAvatar = true;
          } else {
            skipAvatar = false;
            prevMessageOwner = currMessageOwner;
          }
          const bubbleColor =
            msg.sender === SenderType.PLAYER
              ? playerColorMap.get(msg.senderId ?? '')
              : PlayerColors.Grey;

          return (
            <Stack key={`chat-msg-container-${idx}`} direction="column">
              {!skipAvatar && (
                <Typography
                  color="teal"
                  textAlign={myMessage ? 'left' : 'right'}
                >
                  {msg.sender === SenderType.PLAYER
                    ? msg.senderId === player?._id
                      ? 'You'
                      : msg.senderName
                    : 'System'}
                </Typography>
              )}

              <Stack
                p={1}
                direction={myMessage ? 'row' : 'row-reverse'}
                justifyContent={myMessage ? 'left' : 'right'}
              >
                {!skipAvatar &&
                  (msg.sender === SenderType.PLAYER ? (
                    <AvatarSprite
                      player={players?.find((p) => p._id === msg.senderId)}
                      bgColor={bubbleColor}
                    />
                  ) : (
                    <BorderedAvatar
                      {...stringAvatar(
                        msg.senderName ?? '',
                        msg.senderId ?? ''
                      )}
                    ></BorderedAvatar>
                  ))}
                {skipAvatar && (
                  <Box
                    width={46}
                    sx={{
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                  ></Box>
                )}
                <Paper
                  square
                  elevation={0}
                  sx={{
                    p: 3,
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    backgroundColor: bubbleColor,
                    paddingLeft: myMessage ? '10%' : '5%',
                    paddingRight: myMessage ? '5%' : '10%',
                    clipPath: myMessage
                      ? 'polygon(0% 0%, 100% 0%, 100% 100%, calc(0% + 1em) 100%, calc(0% + 1em) calc(0% + 1em), 0% 0%)'
                      : 'polygon(0% 0%, 100% 0%, calc(100% - 1em) calc(0% + 1em), calc(100% - 1em) 100%, 0% 100%, 0% 0%)',
                    borderBottomLeftRadius: myMessage ? 0 : '1em',
                    borderTopLeftRadius: myMessage ? 0 : '1em',
                    borderBottomRightRadius: myMessage ? '1em' : 0,
                    borderTopRightRadius: myMessage ? '1em' : 0,
                  }}
                >
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      margin: 0,
                      fontFamily: 'inherit',
                    }}
                  >
                    <Typography color={'white'}>{msg.message}</Typography>
                  </pre>
                </Paper>
              </Stack>
            </Stack>
          );
        })}
        {(roomIsProcessing || isAnimating) && <ProcessingIndicator />}
        <WaitingForPlayers
          numPlayersInRoom={players?.length || 0}
          playersBeingWaitedFor={playersBeingWaitedFor || []}
          currentPlayerId={player?._id}
          isInRequestUserInputState={isInRequestUserInputState}
          requestUserInputPhaseData={requestUserInputPhaseData}
          roomIsProcessing={roomIsProcessing}
        />
      </Stack>
    </div>
  );
}
