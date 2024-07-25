/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { FlowStepsBuilderTab } from './flow-steps-builder-tab';
import { ColumnDiv } from '../../../styled-components';
import { PromptStepBuilder } from './step-builder/prompt-step-builder';
import {
  DiscussionStage,
  DiscussionStageStep,
  PromptStageStep,
} from '../types';
import { getStepFromFlowList } from '../helpers';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export function StageFlowContainer(props: {
  localStage: DiscussionStage;
  updateLocalStage: React.Dispatch<React.SetStateAction<DiscussionStage>>;
}): JSX.Element {
  const { localStage, updateLocalStage } = props;
  const flowsList = localStage.flowsList;

  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [previewPromptId, setPreviewPromptId] = React.useState<string>('');
  const previewPrompt: PromptStageStep | undefined = getStepFromFlowList(
    previewPromptId,
    flowsList
  ) as PromptStageStep;

  const updateStep = (step: DiscussionStageStep, flowClientId: string) => {
    updateLocalStage((prevValue) => {
      return {
        ...prevValue,
        flowsList: prevValue.flowsList.map((f) => {
          if (f.clientId === flowClientId) {
            return {
              ...f,
              steps: f.steps.map((s) => {
                if (s.stepId === step.stepId) {
                  return step;
                }
                return s;
              }),
            };
          }
          return f;
        }),
      };
    });
  };

  const deleteStep = (stepId: string, flowClientId: string) => {
    updateLocalStage((prevValue) => {
      return {
        ...prevValue,
        flowsList: prevValue.flowsList.map((f) => {
          if (f.clientId === flowClientId) {
            return {
              ...f,
              steps: f.steps.filter((s) => s.stepId !== stepId),
            };
          }
          return f;
        }),
      };
    });
  };

  const tabs = flowsList.map((flow, index) => {
    return (
      <Tab
        key={flow.clientId}
        label={`${flow.name || `Flow ${index + 1}`}`}
        {...a11yProps(index)}
      />
    );
  });

  const customTabPanels = flowsList.map((flow, index) => {
    return (
      <CustomTabPanel key={flow.clientId} value={value} index={index}>
        <FlowStepsBuilderTab
          flow={flow}
          flowsList={flowsList}
          updateLocalStage={updateLocalStage}
          updateStep={updateStep}
          deleteStep={deleteStep}
          setPreviewPromptId={(id: string) => setPreviewPromptId(id)}
        />
      </CustomTabPanel>
    );
  });

  if (previewPrompt) {
    return (
      <ColumnDiv
        style={{
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <PromptStepBuilder
          stepIndex={0}
          step={previewPrompt}
          deleteStep={deleteStep}
          updateLocalStage={updateLocalStage}
          flowsList={flowsList}
          previewed={true}
          startPreview={() => setPreviewPromptId(previewPrompt.stepId)}
          stopPreview={() => setPreviewPromptId('')}
        />
      </ColumnDiv>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="scrollable"
        >
          {tabs}
        </Tabs>
      </Box>
      {customTabPanels}
    </Box>
  );
}
