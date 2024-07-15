/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Button, IconButton } from '@mui/material';
import { FlowStepSelector } from './flow-step-selector';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { ColumnDiv, RowDiv, ColumnCenterDiv } from '../../../styled-components';
import { DiscussionStageStep, FlowItem } from '../types';
export function JumpToAlternateStep(props: {
  step: DiscussionStageStep;
  flowsList: FlowItem[];
  onNewStepSelected: (stepId: string) => void;
}): JSX.Element {
  const { step, flowsList, onNewStepSelected } = props;
  const [displayStepSelector, setDisplayStepSelector] = useState<boolean>(
    Boolean(step.jumpToStepId) && step.jumpToStepId !== ''
  );
  return (
    <ColumnDiv>
      {!displayStepSelector && (
        <RowDiv>
          <span style={{ color: 'grey' }}>Jump to alternate step?</span>
          <Button
            onClick={() => {
              setDisplayStepSelector(true);
            }}
          >
            Yes
          </Button>
        </RowDiv>
      )}

      {displayStepSelector && (
        <ColumnCenterDiv
          style={{
            width: '80%',
            border: '1px solid black',
            padding: 10,
            alignSelf: 'center',
            position: 'relative',
          }}
        >
          <IconButton
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
            }}
            onClick={() => {
              setDisplayStepSelector(false);
              onNewStepSelected('');
            }}
          >
            <CloseIcon />
          </IconButton>
          <span style={{ fontWeight: 'bold' }}>Custom Step Jump</span>
          <FlowStepSelector
            flowsList={flowsList}
            rowOrColumn="row"
            disableStepsList={[step.stepId]}
            currentJumpToStepId={step.jumpToStepId}
            width="fit-content"
            onStepSelected={(stepId) => {
              onNewStepSelected(stepId);
            }}
          />
        </ColumnCenterDiv>
      )}
    </ColumnDiv>
  );
}
