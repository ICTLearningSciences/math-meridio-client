/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Stack, Typography, Paper } from '@mui/material';
import { FadingText } from '../fading-text';

export function ProcessingIndicator(): JSX.Element {
  return (
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
          backgroundColor: 'text.secondary',
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
            strings={['Thinking...', 'Strategizing...', 'Analyzing...']}
          />
        </Typography>
      </Paper>
    </Stack>
  );
}
