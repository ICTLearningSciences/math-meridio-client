/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { v4 as uuid } from 'uuid';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { RoundedBorderDiv, TopLeftText } from '../../../../styled-components';
import { CheckBoxInput, InputField } from '../../shared/input-components';
import { JumpToAlternateStep } from '../../shared/jump-to-alternate-step';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  DiscussionStage,
  DiscussionStageStepType,
  FlowItem,
  SystemMessageStageStep,
} from '../../types';
export function getDefaultSystemMessage(): SystemMessageStageStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: DiscussionStageStepType.SYSTEM_MESSAGE,
    message: '',
    jumpToStepId: '',
  };
}
export function SystemMessageStepBuilder(props: {
  step: SystemMessageStageStep;
  updateLocalStage: React.Dispatch<React.SetStateAction<DiscussionStage>>;
  updateStep: (step: SystemMessageStageStep) => void;
  deleteStep: () => void;
  flowsList: FlowItem[];
  stepIndex: number;
  width?: string;
  height?: string;
}): JSX.Element {
  const { step, stepIndex, updateLocalStage } = props;
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  function updateField(field: string, value: string | boolean) {
    updateLocalStage((prevValue) => {
      return {
        ...prevValue,
        flowsList: prevValue.flowsList.map((f) => {
          return {
            ...f,
            steps: f.steps.map((s) => {
              if (s.stepId === step.stepId) {
                return {
                  ...s,
                  [field]: value,
                };
              }
              return s;
            }),
          };
        }),
      };
    });
  }

  return (
    <RoundedBorderDiv
      style={{
        width: props.width || '100%',
        height: props.height || '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: 10,
      }}
    >
      <TopLeftText>{`Step ${stepIndex + 1}`}</TopLeftText>
      <IconButton
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
        }}
        onClick={props.deleteStep}
      >
        <Delete />
      </IconButton>
      <IconButton
        style={{
          width: 'fit-content',
          position: 'absolute',
          left: 10,
          top: 40,
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      </IconButton>
      <h4 style={{ alignSelf: 'center' }}>System Message</h4>
      <Collapse in={!collapsed}>
        <InputField
          label="Message"
          value={step.message}
          onChange={(e) => {
            updateField('message', e);
          }}
        />

        <CheckBoxInput
          label="Is final step (discussion finished)?"
          value={step.lastStep}
          onChange={(e) => {
            updateField('lastStep', e);
          }}
        />
        <JumpToAlternateStep
          step={step}
          flowsList={props.flowsList}
          onNewStepSelected={(stepId) => {
            updateField('jumpToStepId', stepId);
          }}
        />
      </Collapse>
    </RoundedBorderDiv>
  );
}
