/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { IconButton, Button } from '@mui/material';
import { useState } from 'react';
import { DiscussionStageStepType } from '../types';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { RowDiv } from '../../../styled-components';

export function AddNewDiscussionStageButton(props: {
  insertNewStageStep: (stepType: DiscussionStageStepType) => void;
}): JSX.Element {
  const options = Object.values(DiscussionStageStepType);
  const [displayOptions, setDisplayOptions] = useState<boolean>(false);
  return (
    <div
      style={{
        width: 'fit-content',
      }}
    >
      {!displayOptions && (
        <IconButton onClick={() => setDisplayOptions(true)}>
          <AddCircleIcon />
        </IconButton>
      )}

      {displayOptions && (
        <RowDiv>
          {options.map((option, i) => {
            return (
              <Button
                key={i}
                variant="outlined"
                style={{
                  fontSize: 10,
                  marginRight: 5,
                }}
                onClick={() => {
                  props.insertNewStageStep(option);
                  setDisplayOptions(false);
                }}
              >
                {option}
              </Button>
            );
          })}
          <IconButton onClick={() => setDisplayOptions(false)}>
            <CloseIcon />
          </IconButton>
        </RowDiv>
      )}
    </div>
  );
}
