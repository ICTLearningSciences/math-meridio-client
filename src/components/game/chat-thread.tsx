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
  },
  chatItem: {
    position: 'relative',
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 30,
    marginBottom: 2,
    alignItems: 'center',
    fontFamily: 'Helvetica, Arial, sans-serif',
    maxWidth: '80%',
    textAlign: 'left',
    '&.PLAYER': {
      alignSelf: 'flex-end',
      backgroundColor: '#0084ff',
      borderBottomRightRadius: 5,
    },
    '&.SYSTEM': {
      alignSelf: 'flex-start',
      backgroundColor: '#e6e6e6',
      borderBottomLeftRadius: 5,
    },
  },
  chatIcon: {
    position: 'absolute',
    display: 'flex',
    width: 30,
    height: 30,
    right: -10,
    borderRadius: 30,
    backgroundColor: '#ccc',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
}));

export default function ChatThread(): JSX.Element {
  const { classes } = useStyles();
  const messages = useAppSelector(
    (state) => state.gameData.room?.gameData.chat || []
  );

  return (
    <div
      className={classes.chatThread}
      style={{ maxHeight: window.innerHeight - 80 }}
    >
      {messages.map((msg, idx) => {
        const msgStyles: Record<string, number> = {};
        if (idx > 0) {
          if (msg.sender !== messages[idx - 1].sender) {
            msgStyles.marginTop = 10;
          } else if (msg.sender === SenderType.PLAYER) {
            msgStyles.borderTopRightRadius = 5;
          } else {
            msgStyles.borderTopLeftRadius = 5;
          }
        }
        return (
          <ListItem
            key={`chat-msg-${idx}`}
            className={`${classes.chatItem} ${msg.sender}
              }`}
            style={msgStyles}
          >
            <Typography
              style={{
                color: msg.sender === SenderType.PLAYER ? 'white' : 'black',
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