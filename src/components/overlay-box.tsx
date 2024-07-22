/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Typography } from '@mui/material';

export function OverlayBox(props: {
  message: string;
  styles?: Record<string, any>;
}): JSX.Element {
  return (
    <div
      className="column center-div"
      style={{
        position: 'relative',
        top: 0,
        left: '50%',
        transform: 'translate(-50%, 50%)',
        width: 300,
        height: 60,
        backgroundColor: 'white',
        textAlign: 'center',
        border: '1px solid lightgrey',
        padding: '20px',
        boxShadow: '-5px 5px 10px 0px rgba(0,0,0,0.75)',
        ...props.styles,
      }}
    >
      <Typography>{props.message}</Typography>
    </div>
  );
}
