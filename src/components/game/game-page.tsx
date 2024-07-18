/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';

import withAuthorizationOnly from '../../wrap-with-authorization-only';
import { Grid } from '@mui/material';
import ChatThread from './chat-thread';
import ChatForm from './chat-form';

function GamePage(): JSX.Element {
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Grid container xs={true} flexDirection="row">
      <Grid item xs={9}>
        <div
          id="game-container"
          ref={gameContainerRef}
          style={{
            height: window.innerHeight,
            width: window.innerWidth * (9 / 12),
            backgroundColor: 'pink,',
          }}
        />
      </Grid>
      <Grid item xs={3} display="flex" flexDirection="column">
        <ChatThread />
        <ChatForm />
      </Grid>
    </Grid>
  );
}

export default withAuthorizationOnly(GamePage);
