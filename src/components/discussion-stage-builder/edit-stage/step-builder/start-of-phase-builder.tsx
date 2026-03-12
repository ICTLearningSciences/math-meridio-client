/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { v4 as uuid } from 'uuid';
import { IconButton, Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import {
  RoundedBorderDiv,
  TopLeftText,
  ColumnCenterDiv,
  ColumnDiv,
  RowDiv,
} from '../../../../styled-components';
import { InputField } from '../../shared/input-components';
import {
  DiscussionStage,
  DiscussionStageStepType,
  FlowItem,
  StartOfPhaseStep,
} from '../../types';
import { LearningObjective } from '../../../../store/slices/game/types';
export function getDefaultStartOfPhase(): StartOfPhaseStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: DiscussionStageStepType.START_OF_PHASE,
    phaseTitle: '',
    jumpToStepId: '',
    learningObjectives: [],
  };
}

function LearningObjectiveUpdater(props: {
  learningObjective: LearningObjective;
  updateLearningObjective: (
    updatedObjective: Partial<LearningObjective>,
    index: number
  ) => void;
  deleteLearningObjective: () => void;
  index: number;
}): JSX.Element {
  const {
    learningObjective,
    updateLearningObjective,
    deleteLearningObjective,
    index,
  } = props;
  return (
    <RowDiv
      style={{
        borderTop: '1px dotted black',
        width: '90%',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <ColumnDiv
        style={{
          width: '90%',
        }}
      >
        <InputField
          label="Title"
          width="100%"
          value={learningObjective.title}
          onChange={(e) => {
            updateLearningObjective(
              {
                title: e,
              },
              index
            );
          }}
        />
        <InputField
          label="Criteria"
          width="100%"
          value={learningObjective.criteria}
          onChange={(e) => {
            updateLearningObjective(
              {
                criteria: e,
              },
              index
            );
          }}
        />
        <InputField
          label="Variable Name (e.g. 'numCorrect', 'numIncorrect', 'numQuestions')"
          width="100%"
          value={learningObjective.variableName}
          onChange={(e) => {
            updateLearningObjective(
              {
                variableName: e,
              },
              index
            );
          }}
        />
      </ColumnDiv>
      <IconButton onClick={deleteLearningObjective} color="primary">
        <Delete />
      </IconButton>
    </RowDiv>
  );
}

function LearningObjectivesUpdater(props: {
  learningObjectives: LearningObjective[];
  updateLearningObjectives: (
    learningObjectives:
      | LearningObjective[]
      | ((prev: LearningObjective[]) => LearningObjective[])
  ) => void;
  width?: string;
}): JSX.Element {
  const { learningObjectives, updateLearningObjectives } = props;

  function updateLearningObjective(
    updatedObjective: Partial<LearningObjective>,
    index: number
  ) {
    updateLearningObjectives((prevObjectives) => {
      return prevObjectives.map((obj, i) => {
        if (i === index) {
          return {
            ...obj,
            ...updatedObjective,
          };
        }
        return obj;
      });
    });
  }

  function addNewLearningObjective() {
    updateLearningObjectives((prevObjectives) => [
      ...(prevObjectives || []),
      {
        title: '',
        criteria: '',
        variableName: '',
      },
    ]);
  }

  function deleteLearningObjective(index: number) {
    updateLearningObjectives((prevObjectives) =>
      prevObjectives.filter((_, i) => i !== index)
    );
  }

  return (
    <ColumnCenterDiv
      style={{
        width: props.width || '100%',
        border: '1px solid black',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 10,
        marginTop: 10,
      }}
    >
      <span style={{ fontWeight: 'bold' }}>Learning Objectives</span>

      {learningObjectives?.length > 0 &&
        learningObjectives.map((objective, index) => (
          <LearningObjectiveUpdater
            key={index}
            learningObjective={objective}
            index={index}
            updateLearningObjective={updateLearningObjective}
            deleteLearningObjective={() => {
              deleteLearningObjective(index);
            }}
          />
        ))}
      <Button onClick={addNewLearningObjective}>
        + Add Learning Objective
      </Button>
    </ColumnCenterDiv>
  );
}
export function StartOfPhaseStepBuilder(props: {
  step: StartOfPhaseStep;
  updateLocalStage: React.Dispatch<React.SetStateAction<DiscussionStage>>;
  updateStep: (step: StartOfPhaseStep) => void;
  deleteStep: () => void;
  flowsList: FlowItem[];
  stepIndex: number;
  width?: string;
  height?: string;
}): JSX.Element {
  const { step, stepIndex, updateLocalStage } = props;

  function updateField(
    field: string,
    value: string | boolean | string[] | LearningObjective[]
  ) {
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

  function updateLearningObjectives(
    learningObjectives:
      | LearningObjective[]
      | ((prev: LearningObjective[]) => LearningObjective[])
  ) {
    if (typeof learningObjectives === 'function') {
      updateLocalStage((prevValue) => {
        return {
          ...prevValue,
          flowsList: prevValue.flowsList.map((f) => {
            return {
              ...f,
              steps: f.steps.map((s) => {
                if (s.stepId === step.stepId) {
                  const currentStep = s as StartOfPhaseStep;
                  return {
                    ...s,
                    learningObjectives: learningObjectives(
                      currentStep.learningObjectives || []
                    ),
                  };
                }
                return s;
              }),
            };
          }),
        };
      });
    } else {
      updateField('learningObjectives', learningObjectives);
    }
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
      <h4 style={{ alignSelf: 'center' }}>Start of Phase</h4>
      <InputField
        label="Phase Title"
        value={step.phaseTitle}
        onChange={(e) => {
          updateField('phaseTitle', e);
        }}
      />
      <LearningObjectivesUpdater
        learningObjectives={step.learningObjectives}
        updateLearningObjectives={updateLearningObjectives}
      />
    </RoundedBorderDiv>
  );
}
