/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  RequestUserInputStepBuilder,
  getDefaultRequestUserInputBuilder,
} from './step-builder/request-user-input-step-builder';
import {
  PromptStepBuilder,
  defaultPromptBuilder,
} from './step-builder/prompt-step-builder';
import { InputField } from '../shared/input-components';
import { AddNewDiscussionStageButton } from '../shared/add-new-stage-button';
import { Button } from '@mui/material';
import {
  SystemMessageStepBuilder,
  getDefaultSystemMessage,
} from './step-builder/system-message-step-builder';
import {
  DiscussionStage,
  DiscussionStageStep,
  DiscussionStageStepType,
  FlowItem,
  SystemMessageStageStep,
} from '../types';
import { ColumnDiv } from '../../../styled-components';
import {
  ConditionalStepBuilder,
  getDefaultConditionalStep,
} from './step-builder/conditional-step-builder';
export function FlowStepsBuilderTab(props: {
  flow: FlowItem;
  flowsList: FlowItem[];
  updateLocalStage: React.Dispatch<React.SetStateAction<DiscussionStage>>;
  updateStep: (step: DiscussionStageStep, flowClientId: string) => void;
  deleteStep: (stepId: string, flowClientId: string) => void;
  setPreviewPromptId: (id: string) => void;
}) {
  const { flow, flowsList, updateLocalStage, setPreviewPromptId } = props;

  function renderActivityStep(step: DiscussionStageStep, i: number) {
    switch (step.stepType) {
      case DiscussionStageStepType.SYSTEM_MESSAGE:
        return (
          <SystemMessageStepBuilder
            key={i}
            stepIndex={i}
            step={step as SystemMessageStageStep}
            updateLocalStage={updateLocalStage}
            updateStep={(step) => props.updateStep(step, flow.clientId)}
            deleteStep={() => props.deleteStep(step.stepId, flow.clientId)}
            flowsList={flowsList}
          />
        );
      case DiscussionStageStepType.REQUEST_USER_INPUT:
        return (
          <RequestUserInputStepBuilder
            key={i}
            stepIndex={i}
            step={step}
            updateLocalStage={updateLocalStage}
            deleteStep={() => props.deleteStep(step.stepId, flow.clientId)}
            flowsList={flowsList}
          />
        );
      case DiscussionStageStepType.PROMPT:
        return (
          <PromptStepBuilder
            key={i}
            stepIndex={i}
            step={step}
            deleteStep={() => props.deleteStep(step.stepId, flow.clientId)}
            updateLocalStage={updateLocalStage}
            flowsList={flowsList}
            previewed={false}
            startPreview={() => setPreviewPromptId(step.stepId)}
            stopPreview={() => setPreviewPromptId('')}
          />
        );
      case DiscussionStageStepType.CONDITIONAL:
        return (
          <ConditionalStepBuilder
            step={step}
            updateLocalActivity={updateLocalStage}
            deleteStep={() => props.deleteStep(step.stepId, flow.clientId)}
            flowsList={flowsList}
            stepIndex={i}
            key={i}
          />
        );
      default:
        throw new Error(`Unknown step type: ${step}`);
    }
  }

  function deleteFlow() {
    updateLocalStage((prevValue) => {
      return {
        ...prevValue,
        flowsList: prevValue.flowsList.filter(
          (f) => f.clientId !== flow.clientId
        ),
      };
    });
  }

  function insertNewStageStep(stepType: DiscussionStageStepType, i: number) {
    const newStep: DiscussionStageStep =
      stepType === DiscussionStageStepType.SYSTEM_MESSAGE
        ? getDefaultSystemMessage()
        : stepType === DiscussionStageStepType.REQUEST_USER_INPUT
        ? getDefaultRequestUserInputBuilder()
        : stepType === DiscussionStageStepType.CONDITIONAL
        ? getDefaultConditionalStep()
        : defaultPromptBuilder();
    updateLocalStage((prevValue) => {
      return {
        ...prevValue,
        flowsList: prevValue.flowsList.map((f) => {
          if (f.clientId === flow.clientId) {
            return {
              ...f,
              steps: [
                ...f.steps.slice(0, i + 1),
                newStep,
                ...f.steps.slice(i + 1),
              ],
            };
          }
          return f;
        }),
      };
    });
  }

  return (
    <ColumnDiv
      style={{
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Button
        style={{
          position: 'absolute',
          right: '0',
          top: '0',
        }}
        variant="outlined"
        onClick={deleteFlow}
      >
        Delete Flow
      </Button>
      <div
        style={{
          alignSelf: 'center',
        }}
      >
        <InputField
          label="Flow Title"
          value={flow.name}
          onChange={(e) => {
            updateLocalStage((prevValue) => {
              return {
                ...prevValue,
                flowsList: prevValue.flowsList.map((f) => {
                  if (f.clientId === flow.clientId) {
                    return {
                      ...f,
                      name: e,
                    };
                  }
                  return f;
                }),
              };
            });
          }}
        />
      </div>
      {
        <AddNewDiscussionStageButton
          insertNewStageStep={(stepType) => insertNewStageStep(stepType, -1)}
        />
      }
      {flow.steps.map((step, i) => {
        return (
          <ColumnDiv
            key={`${flow.clientId}-${step.stepId}`}
            style={{
              alignItems: 'center',
              width: '100%',
              maxWidth: '900px',
              position: 'relative',
            }}
          >
            {renderActivityStep(step, i)}
            <AddNewDiscussionStageButton
              insertNewStageStep={(stepType) => insertNewStageStep(stepType, i)}
            />
          </ColumnDiv>
        );
      })}
    </ColumnDiv>
  );
}
