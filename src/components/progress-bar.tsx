/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { LinearProgress, Typography } from '@mui/material';

export default function ProgressBar(props: {
  value: number;
  size?: 'large';
}): JSX.Element {
  if (props.size === 'large') {
    return (
      <div>
        <LinearProgress
          variant="determinate"
          value={props.value}
          style={{ height: 30, borderRadius: 40 }}
          sx={{
            backgroundColor: 'rgb(217, 217, 217)',
            '& .MuiLinearProgress-bar': {
              backgroundImage: 'linear-gradient(to right, yellow, orange)',
              borderTopRightRadius: 40,
              borderBottomRightRadius: 40,
            },
          }}
        />
        <div
          className="row"
          style={{ justifyContent: 'space-between', marginTop: 10 }}
        >
          <Typography style={{ color: 'gray' }}>PHASE 1</Typography>
          <Typography style={{ color: 'gray' }}>PHASE 2</Typography>
          <Typography style={{ color: 'gray' }}>PHASE 3</Typography>
          <Typography style={{ color: 'gray' }}>PHASE 4</Typography>
          <Typography style={{ color: 'gray' }}>PHASE 5</Typography>
          <Typography style={{ color: 'gray' }}>PHASE 6</Typography>
        </div>
      </div>
    );
  }
  return (
    <LinearProgress
      variant="determinate"
      value={props.value}
      style={{ height: 15, borderRadius: 40 }}
      sx={{
        backgroundColor: 'rgb(217, 217, 217)',
        '& .MuiLinearProgress-bar': {
          backgroundImage: 'linear-gradient(to right, yellow, orange)',
          borderTopRightRadius: 40,
          borderBottomRightRadius: 40,
        },
      }}
    />
  );
}
