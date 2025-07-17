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
import { SenderType } from '../../store/slices/game';
import { FadingText } from '../fading-text';
import React from 'react';
import AvatarSprite from '../avatar-sprite';

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
  responsePending: boolean;
}): JSX.Element {
  const { responsePending } = props;
  const { classes } = useStyles();
  const { player } = useAppSelector((state) => state.playerData);
  const messages = useAppSelector(
    (state) => state.gameData.room?.gameData.chat || []
  );

  const players = useAppSelector(
    (state) => state.gameData.room?.gameData.players
  );

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

  players?.forEach((iterPlayer: { clientId: string }) => {
    GetMyColor(iterPlayer.clientId, iterPlayer.clientId == player?.clientId);
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
            msg.sender === SenderType.PLAYER &&
            msg.senderId === player?.clientId;

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
                    ? msg.senderId === player?.clientId
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
                      player={players?.find((p) => p.clientId === msg.senderId)}
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
        {responsePending && (
          <Stack
            direction="row-reverse"
            key={`fading-text`}
            sx={{ p: 1 }}
            spacing={2}
            justifyContent="right"
          >
            <Paper
              square
              elevation={0}
              sx={{
                p: 3,
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                backgroundColor: PlayerColors.Grey,
                paddingLeft: '5%',
                paddingRight: '10%',
                clipPath:
                  'polygon(0% 0%, 100% 0%, calc(100% - 1em) calc(0% + 1em), calc(100% - 1em) 100%, 0% 100%, 0% 0%)',
                borderBottomLeftRadius: '1em',
                borderTopLeftRadius: '1em',
              }}
            >
              {' '}
              <Typography color={'white'}>
                <FadingText
                  strings={['Thinking...', 'Dribbling...', 'Analyzing...']}
                />
              </Typography>
            </Paper>
          </Stack>
        )}
      </Stack>
    </div>
  );
}
