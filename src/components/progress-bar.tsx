/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { LinearProgress, Typography } from '@mui/material';
import { PhaseProgression } from '../store/slices/game/types';

export default function ProgressBar(props: {
  phases: PhaseProgression;
  size?: 'large';
}): JSX.Element {
  const { phases } = props;
  const phase = phases.phasesCompleted.length;
  const value = !phases.totalPhases ? 0 : (phase / phases.totalPhases) * 100;

  if (props.size === 'large') {
    return (
      <div>
        <LinearProgress
          variant="determinate"
          value={value}
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
          style={{ justifyContent: 'space-evenly', marginTop: 10 }}
        >
          {Array.from({ length: phases.totalPhases }, (_, index) => (
            <Typography
              key={index}
              style={{ color: phase > index ? 'orange' : 'gray' }}
            >
              PHASE {index + 1}
            </Typography>
          ))}
        </div>
      </div>
    );
  }
  return (
    <LinearProgress
      variant="determinate"
      value={value}
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
