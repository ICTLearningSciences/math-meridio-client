/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../../store/hooks';
import { ListItem, Typography } from '@mui/material';
import { SenderType } from '../../store/slices/game';

const useStyles = makeStyles()(() => ({
  chatThread: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'auto',
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  chatItem: {
    position: 'relative',
    flexDirection: 'row',
    borderRadius: 30,
    alignItems: 'center',
    fontFamily: 'Helvetica, Arial, sans-serif',
    maxWidth: '80%',
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

export default function ChatThread(): JSX.Element {
  const { classes } = useStyles();
  const { player } = useAppSelector((state) => state.playerData);
  const messages = useAppSelector(
    (state) => state.gameData.room?.gameData.chat || []
  );

  React.useEffect(() => {
    const objDiv = document.getElementById('chat-thread');
    if (objDiv) {
      objDiv.scroll({
        top: objDiv.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  return (
    <div
      id="chat-thread"
      className={classes.chatThread}
      style={{ maxHeight: window.innerHeight - 80 }}
    >
      {messages.map((msg, idx) => {
        const msgStyles: Record<string, number> = {};
        if (idx > 0) {
          if (msg.senderId !== messages[idx - 1].senderId) {
            msgStyles.marginTop = 10;
          } else if (msg.senderId === player?.clientId) {
            msgStyles.borderTopRightRadius = 5;
          } else {
            msgStyles.borderTopLeftRadius = 5;
          }
        }
        const myMessage =
          msg.sender === SenderType.PLAYER && msg.senderId === player?.clientId;
        return (
          <ListItem
            key={`chat-msg-${idx}`}
            className={`${classes.chatItem} ${myMessage ? 'mine' : 'other'} ${
              msg.sender
            }`}
            style={msgStyles}
          >
            <Typography
              style={{
                position: 'absolute',
                fontSize: 12,
                bottom: -15,
                right: myMessage ? 20 : undefined,
                left: myMessage ? undefined : 20,
              }}
            >
              {msg.senderName}
            </Typography>
            <Typography
              style={{
                color:
                  msg.sender === SenderType.PLAYER &&
                  msg.senderId === player?.clientId
                    ? 'white'
                    : 'black',
              }}
            >
              {msg.message}
            </Typography>
          </ListItem>
        );
      })}
    </div>
  );
}
