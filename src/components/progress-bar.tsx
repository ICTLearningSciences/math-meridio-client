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
  const large = props.size === 'large';
  const phasesCompleted = phases.phasesCompleted.length;
  const value = !phases.startingPhaseStepsOrdered.length
    ? 0
    : (phasesCompleted / phases.startingPhaseStepsOrdered.length) * 100;

  return (
    <div style={{ position: 'relative' }}>
      <LinearProgress
        variant="determinate"
        value={value}
        style={{ height: large ? 30 : 15, borderRadius: 40 }}
        sx={{
          backgroundColor: 'rgb(217, 217, 217)',
          '& .MuiLinearProgress-bar': {
            backgroundImage: 'linear-gradient(to right, yellow, orange)',
            borderTopRightRadius: 40,
            borderBottomRightRadius: 40,
          },
        }}
      />
      {large && (
        <Typography
          fontSize={12}
          style={{
            color: 'white',
            position: 'absolute',
            left: 10,
            top: '20%',
          }}
        >
          OVERALL PROGRESS:
        </Typography>
      )}
      <div
        className="row"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '15%',
          justifyContent: 'space-evenly',
        }}
      >
        {Array.from(
          { length: phases.startingPhaseStepsOrdered.length },
          (_, index) => (
            <Typography
              key={index}
              fontSize={large ? 14 : 8}
              style={{
                color: phasesCompleted > index ? 'white' : 'rgb(180, 180, 180)',
              }}
            >
              PHASE {index + 1}
            </Typography>
          )
        )}
      </div>
    </div>
  );
}
