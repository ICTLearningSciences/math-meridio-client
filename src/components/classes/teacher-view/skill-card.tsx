/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Person } from '@mui/icons-material';
import { Typography } from '@mui/material';

export default function SkillCard(props: {
  name: string;
  numMet: number;
  numTotal: number;
}): JSX.Element {
  const percentMet = props.numMet / props.numTotal;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'space-between',
      }}
    >
      <Typography>{props.name}</Typography>
      {props.numTotal === 1 ? (
        <div className="row center-div spacing">
          <Typography
            color={
              percentMet === 1
                ? 'success'
                : percentMet < 0.5
                ? 'error'
                : undefined
            }
          >
            {props.numMet === 1 ? 'Met' : 'Not met'}
          </Typography>
        </div>
      ) : (
        <div
          className="row center-div spacing"
          color={
            percentMet === 1 ? 'green' : percentMet < 0.5 ? 'red' : undefined
          }
        >
          <Person fontSize="small" />
          <Typography>
            {props.numMet} / {props.numTotal}
          </Typography>
        </div>
      )}
    </div>
  );
}
