/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { v4 as uuid } from 'uuid';
import {
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
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
import { useWithEducationalData } from '../../../../store/slices/educational-data/use-with-educational-data';
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
  const { educationalData } = useWithEducationalData();
  const [selectedLoId, setSelectedLoId] = React.useState<string>('');


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

  const availableLearningObjectives = educationalData.learningObjectives.filter(
    (lo) => !step.learningObjectives.includes(lo._id)
  );

  const selectedLearningObjectives = educationalData.learningObjectives.filter(
    (lo) => step.learningObjectives.includes(lo._id)
  );

  const handleAddLearningObjective = () => {
    if (selectedLoId && !step.learningObjectives.includes(selectedLoId)) {
      updateField('learningObjectives', [...step.learningObjectives, selectedLoId]);
      setSelectedLoId('');
    }
  };

  const handleRemoveLearningObjective = (loId: string) => {
    updateField(
      'learningObjectives',
      step.learningObjectives.filter((id) => id !== loId)
    );
  };


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

      <Box sx={{ mt: 2 }}>
        <h5 style={{ marginBottom: 10 }}>Learning Objectives</h5>

        {selectedLearningObjectives.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedLearningObjectives.map((lo) => (
              <Chip
                key={lo._id}
                label={lo.title}
                onDelete={() => handleRemoveLearningObjective(lo._id)}
                color="primary"
              />
            ))}
          </Box>
        )}

        {availableLearningObjectives.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Add Learning Objective</InputLabel>
              <Select
                value={selectedLoId}
                onChange={(e) => setSelectedLoId(e.target.value)}
                label="Add Learning Objective"
              >
                {availableLearningObjectives.map((lo) => (
                  <MenuItem key={lo._id} value={lo._id}>
                    {lo.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              onClick={handleAddLearningObjective}
              disabled={!selectedLoId}
              color="primary"
            >
              <Add />
            </IconButton>
          </Box>
        )}
      </Box>
    </RoundedBorderDiv>
  );
}
