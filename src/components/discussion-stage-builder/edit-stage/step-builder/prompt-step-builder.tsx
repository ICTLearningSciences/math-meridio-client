/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';

import InfoIcon from '@mui/icons-material/Info';
import {
  CheckBoxInput,
  InputField,
  SelectInputField,
} from '../../shared/input-components';
import {
  GenericLlmRequest,
  PromptConfiguration as PromptConfigurationType,
  PromptOutputTypes,
  PromptRoles,
} from '../../../../types';
import {
  Button,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Box,
  Tooltip,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { v4 as uuid } from 'uuid';
import { JumpToAlternateStep } from '../../shared/jump-to-alternate-step';
import { AiServicesResponseTypes } from '../../../../ai-services/ai-service-types';
import ViewPreviousRunModal from '../../ai-runs-viewer/view-previous-run-modal';
import { recursivelyConvertExpectedDataToAiPromptString } from '../../helpers';
import ViewPreviousRunsModal from '../../ai-runs-viewer/view-previous-runs-modal';
import { JsonResponseDataUpdater } from './json-response-data-builder';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { TextDialog } from '../../../dialog';
import {
  DiscussionStage,
  DiscussionStageStepType,
  FlowItem,
  JsonResponseData,
  JsonResponseDataType,
  ProcessPromptAs,
  PromptConfiguration,
  PromptStageStep,
} from '../../types';
import {
  RoundedBorderDiv,
  RowDiv,
  TopLeftText,
} from '../../../../styled-components';
import { syncLlmRequest } from '../../../../hooks/use-with-synchronous-polling';
import { useWithConfig } from '../../../../store/slices/config/use-with-config';
export function getEmptyJsonResponseData(): JsonResponseData {
  return {
    clientId: uuid(),
    name: '',
    type: JsonResponseDataType.STRING,
    isRequired: false,
    additionalInfo: '',
  };
}

export function defaultPromptBuilder(): PromptStageStep {
  return {
    stepId: uuid(),
    lastStep: false,
    stepType: DiscussionStageStepType.PROMPT,
    prompts: [
      {
        processPromptAs: ProcessPromptAs.INDIVIDUALLY,
        promptText: '',
        responseFormat: '',
        outputDataType: PromptOutputTypes.TEXT,
        jsonResponseData: [] as JsonResponseData[],
        includeChatLogContext: false,
        customSystemRole: '',
      },
    ],
    jumpToStepId: '',
  };
}

export enum ViewingInputType {
  PROMPT_TEXT = 'PROMPT_TEXT',
  RESPONSE_FORMAT = 'RESPONSE_FORMAT',
  NONE = 'NONE',
}

function getEmptyPromptConfiguration(): Omit<
  PromptConfiguration,
  'jsonResponseData'
> & { jsonResponseData: JsonResponseData[] } {
  return {
    processPromptAs: ProcessPromptAs.INDIVIDUALLY,
    promptText: '',
    responseFormat: '',
    outputDataType: PromptOutputTypes.TEXT,
    jsonResponseData: [] as JsonResponseData[],
    includeChatLogContext: false,
    customSystemRole: '',
  };
}

interface PromptConfigurationEditorProps {
  promptIndex: number;
  promptConfig: PromptStageStep['prompts'][0];
  updatePromptField: (
    promptIndex: number,
    field: string,
    value: string | boolean | JsonResponseData[]
  ) => void;
  deletePrompt: (promptIndex: number) => void;
  canDelete: boolean;
  stepId: string;
}

function PromptConfigurationEditor(
  props: PromptConfigurationEditorProps
): JSX.Element {
  const {
    promptIndex,
    promptConfig,
    updatePromptField,
    deletePrompt,
    canDelete,
  } = props;
  const { firstAvailableAzureServiceModel } = useWithConfig();

  const [viewRunResults, setViewRunResults] =
    React.useState<AiServicesResponseTypes>();
  const [previousRunResults, setPreviousRunResults] = React.useState<
    AiServicesResponseTypes[]
  >([]);
  const [viewingPreviousRuns, setViewingPreviousRuns] =
    React.useState<boolean>(false);
  const [executeError, setExecuteError] = React.useState<string>('');
  const [executeInProgress, setExecuteInProgress] =
    React.useState<boolean>(false);
  const [viewingInputType, setViewingInputType] =
    React.useState<ViewingInputType>(ViewingInputType.PROMPT_TEXT);

  function editJsonResponseData(
    clientId: string,
    field: string,
    value: string | boolean,
    parentJsonResponseDataIds: string[]
  ) {
    const updated = recursiveUpdateNestedJsonResponseData(
      clientId,
      field,
      value,
      promptConfig.jsonResponseData || [],
      parentJsonResponseDataIds
    );
    updatePromptField(promptIndex, 'jsonResponseData', updated);
  }

  function addNewJsonResponseData(parentJsonResponseDataIds: string[]) {
    if (!parentJsonResponseDataIds?.length) {
      updatePromptField(promptIndex, 'jsonResponseData', [
        ...(promptConfig.jsonResponseData || []),
        getEmptyJsonResponseData(),
      ]);
    } else {
      const updated = recursiveAddNewJsonResponseData(
        parentJsonResponseDataIds,
        promptConfig.jsonResponseData || []
      );
      updatePromptField(promptIndex, 'jsonResponseData', updated);
    }
  }

  function deleteJsonResponseData(
    clientId: string,
    parentJsonResponseDataIds: string[]
  ) {
    if (!parentJsonResponseDataIds?.length) {
      updatePromptField(
        promptIndex,
        'jsonResponseData',
        (promptConfig.jsonResponseData || []).filter(
          (jrd) => jrd.clientId !== clientId
        )
      );
    } else {
      const updated = recursiveDeleteJsonResponseData(
        clientId,
        promptConfig.jsonResponseData || [],
        parentJsonResponseDataIds
      );
      updatePromptField(promptIndex, 'jsonResponseData', updated);
    }
  }

  async function executePromptTest() {
    setExecuteInProgress(true);
    const llmRequest: GenericLlmRequest = {
      prompts: [],
      targetAiServiceModel: firstAvailableAzureServiceModel(),
      outputDataType: promptConfig.outputDataType,
      responseFormat: promptConfig.responseFormat,
      systemRole: promptConfig.customSystemRole,
    };
    const promptConfiguration: PromptConfigurationType = {
      promptText: promptConfig.promptText,
      promptRole: PromptRoles.SYSTEM,
    };
    llmRequest.prompts.push(promptConfiguration);
    if (promptConfig.jsonResponseData?.length) {
      llmRequest.responseFormat +=
        recursivelyConvertExpectedDataToAiPromptString(
          promptConfig.jsonResponseData
        );
    }
    try {
      const _response = await syncLlmRequest(llmRequest);
      setViewRunResults(_response);
      setPreviousRunResults([...previousRunResults, _response]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setExecuteError(e.message);
    } finally {
      setExecuteInProgress(false);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <RowDiv
        data-cy="run-prompt-buttons"
        style={{
          alignSelf: 'center',
          marginBottom: 10,
        }}
      >
        {!executeInProgress ? (
          <Button
            style={{
              marginRight: 10,
            }}
            onClick={() => {
              executePromptTest();
            }}
          >
            Run
          </Button>
        ) : (
          <CircularProgress
            style={{
              marginRight: 10,
            }}
          />
        )}
        <Button
          style={{
            marginRight: 10,
          }}
          disabled={executeInProgress || !previousRunResults.length}
          onClick={() => {
            setViewingPreviousRuns(true);
          }}
        >
          View Previous Runs
        </Button>
        <Button
          color="error"
          disabled={!canDelete}
          onClick={() => {
            deletePrompt(promptIndex);
          }}
        >
          <Delete /> Delete Prompt
        </Button>
        <ViewPreviousRunModal
          previousRunStepData={viewRunResults?.aiAllStepsData}
          open={Boolean(viewRunResults)}
          close={() => {
            setViewRunResults(undefined);
          }}
        />
        <ViewPreviousRunsModal
          previousRuns={previousRunResults}
          open={viewingPreviousRuns}
          close={() => {
            setViewingPreviousRuns(false);
          }}
          setRunToView={(run) => {
            setViewRunResults(run);
          }}
        />
        <TextDialog
          title="Error"
          body={executeError}
          open={Boolean(executeError)}
          close={() => {
            setExecuteError('');
          }}
        />
      </RowDiv>

      <RowDiv>
        <SelectInputField
          label="Process Prompt As"
          value={promptConfig.processPromptAs}
          options={[...Object.values(ProcessPromptAs)]}
          onChange={(e) => {
            updatePromptField(
              promptIndex,
              'processPromptAs',
              e as ProcessPromptAs
            );
          }}
        />
        <Tooltip
          title={`GROUP: executes a single prompt that aggregates data from all users and updates all users data with the same results.
          
          INDIVIDUALLY: executes a separate prompt for each user, analyzing and updating their individual data with the results.`}
        >
          <InfoIcon />
        </Tooltip>
      </RowDiv>
      <InputField
        label="Prompt Text"
        value={promptConfig.promptText}
        onFocus={() => {
          setViewingInputType(ViewingInputType.PROMPT_TEXT);
        }}
        maxRows={viewingInputType === ViewingInputType.PROMPT_TEXT ? 20 : 3}
        onChange={(e) => {
          updatePromptField(promptIndex, 'promptText', e);
        }}
        width="100%"
      />
      <InputField
        label="Response Format"
        value={promptConfig.responseFormat}
        onFocus={() => {
          setViewingInputType(ViewingInputType.RESPONSE_FORMAT);
        }}
        maxRows={viewingInputType === ViewingInputType.RESPONSE_FORMAT ? 20 : 3}
        onChange={(e) => {
          updatePromptField(promptIndex, 'responseFormat', e);
        }}
        width="100%"
      />

      <SelectInputField
        label="Output Data Type"
        value={promptConfig.outputDataType}
        options={[...Object.values(PromptOutputTypes)]}
        onChange={(e) => {
          updatePromptField(promptIndex, 'outputDataType', e);
        }}
      />

      {promptConfig.outputDataType === PromptOutputTypes.JSON && (
        <JsonResponseDataUpdater
          jsonResponseData={promptConfig.jsonResponseData || []}
          editDataField={editJsonResponseData}
          addNewJsonResponseData={addNewJsonResponseData}
          deleteJsonResponseData={deleteJsonResponseData}
          parentJsonResponseDataIds={[]}
        />
      )}

      <CheckBoxInput
        label="Include Chat History"
        value={promptConfig.includeChatLogContext}
        onChange={(e) => {
          updatePromptField(promptIndex, 'includeChatLogContext', e);
        }}
      />

      <InputField
        label="Custom System Role"
        value={promptConfig.customSystemRole}
        onChange={(e) => {
          updatePromptField(promptIndex, 'customSystemRole', e);
        }}
        width="100%"
      />
    </Box>
  );
}

function recursiveUpdateNestedJsonResponseData(
  clientId: string,
  field: string,
  value: string | boolean,
  baseJsonResponseDatas: JsonResponseData[],
  parentJsonResponseDataIds: string[]
): JsonResponseData[] {
  if (!parentJsonResponseDataIds?.length) {
    return baseJsonResponseDatas.map((jrd) => {
      if (jrd.clientId === clientId) {
        return {
          ...jrd,
          [field]: value,
        };
      }
      return jrd;
    });
  } else {
    return baseJsonResponseDatas.map((jrd) => {
      if (jrd.clientId === parentJsonResponseDataIds[0]) {
        return {
          ...jrd,
          subData: recursiveUpdateNestedJsonResponseData(
            clientId,
            field,
            value,
            jrd.subData || [],
            parentJsonResponseDataIds.slice(1)
          ),
        };
      }
      return jrd;
    });
  }
}

function recursiveAddNewJsonResponseData(
  parentJsonResponseDataIds: string[],
  baseJsonResponseDatas: JsonResponseData[]
): JsonResponseData[] {
  if (!parentJsonResponseDataIds?.length) {
    return [...baseJsonResponseDatas, getEmptyJsonResponseData()];
  } else {
    return baseJsonResponseDatas.map((jrd) => {
      if (jrd.clientId === parentJsonResponseDataIds[0]) {
        return {
          ...jrd,
          subData: recursiveAddNewJsonResponseData(
            parentJsonResponseDataIds.slice(1),
            jrd.subData || []
          ),
        };
      }
      return jrd;
    });
  }
}

function recursiveDeleteJsonResponseData(
  clientId: string,
  baseJsonResponseDatas: JsonResponseData[],
  parentJsonResponseDataIds: string[]
): JsonResponseData[] {
  // for all json response data, if the clientId matches, remove it
  if (!parentJsonResponseDataIds?.length) {
    return baseJsonResponseDatas.filter((jrd) => jrd.clientId !== clientId);
  } else {
    return baseJsonResponseDatas.map((jrd) => {
      if (jrd.clientId === parentJsonResponseDataIds[0]) {
        return {
          ...jrd,
          subData: recursiveDeleteJsonResponseData(
            clientId,
            jrd.subData || [],
            parentJsonResponseDataIds.slice(1)
          ),
        };
      }
      return jrd;
    });
  }
}

export function PromptStepBuilder(props: {
  step: PromptStageStep;
  updateLocalStage: React.Dispatch<React.SetStateAction<DiscussionStage>>;
  deleteStep: (stepId: string, flowClientId: string) => void;
  flowsList: FlowItem[];
  stepIndex: number;
  previewed: boolean;
  startPreview: () => void;
  stopPreview: () => void;
  width?: string;
  height?: string;
}): JSX.Element {
  const { step, stepIndex, updateLocalStage, deleteStep, flowsList } = props;
  const currentFLow = flowsList.find((f) => {
    return f.steps.find((s) => s.stepId === step.stepId);
  });

  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [selectedTab, setSelectedTab] = React.useState<number>(0);

  function updateStepField(field: string, value: string | boolean) {
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

  function updatePromptField(
    promptIndex: number,
    field: string,
    value: string | boolean | JsonResponseData[]
  ) {
    updateLocalStage((prevValue) => {
      return {
        ...prevValue,
        flowsList: prevValue.flowsList.map((f) => {
          return {
            ...f,
            steps: f.steps.map((s) => {
              if (s.stepId === step.stepId) {
                const prompts = [...(s as PromptStageStep).prompts];
                prompts[promptIndex] = {
                  ...prompts[promptIndex],
                  [field]: value,
                };
                return {
                  ...s,
                  prompts,
                };
              }
              return s;
            }),
          };
        }),
      };
    });
  }

  function addNewPrompt() {
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
                  prompts: [
                    ...(s as PromptStageStep).prompts,
                    getEmptyPromptConfiguration(),
                  ],
                };
              }
              return s;
            }),
          };
        }),
      };
    });
    // Switch to the new tab
    setSelectedTab(step.prompts.length);
  }

  function deletePrompt(promptIndex: number) {
    if (step.prompts.length <= 1) {
      return; // Don't delete if only one prompt remains
    }
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
                  prompts: (s as PromptStageStep).prompts.filter(
                    (_, index) => index !== promptIndex
                  ),
                };
              }
              return s;
            }),
          };
        }),
      };
    });
    // Adjust selected tab if necessary
    if (selectedTab >= step.prompts.length - 1) {
      setSelectedTab(Math.max(0, step.prompts.length - 2));
    }
  }

  return (
    <RoundedBorderDiv
      style={{
        width: props.width || '100%',
        height: props.height || '100%',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        padding: 10,
        border: '1px solid black',
      }}
    >
      <TopLeftText>{`Step ${stepIndex + 1}`}</TopLeftText>
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
      <IconButton
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
        }}
        onClick={() => {
          deleteStep(step.stepId, currentFLow?.clientId || '');
        }}
      >
        <Delete />
      </IconButton>
      <h4 style={{ alignSelf: 'center' }}>Prompt</h4>
      <Collapse in={!collapsed}>
        {/* Global step fields */}
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
          <h5>Step Settings</h5>
          <CheckBoxInput
            label="Is final step (discussion finished)?"
            value={step.lastStep}
            onChange={(e) => {
              updateStepField('lastStep', e);
            }}
          />

          <JumpToAlternateStep
            step={step}
            flowsList={props.flowsList}
            onNewStepSelected={(stepId) => {
              updateStepField('jumpToStepId', stepId);
            }}
          />
        </Box>

        {/* Prompt configurations tabs */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {step.prompts.map((_, index) => (
              <Tab key={index} label={`Prompt ${index + 1}`} />
            ))}
          </Tabs>
          <IconButton color="primary" onClick={addNewPrompt} sx={{ ml: 2 }}>
            <Add />
          </IconButton>
        </Box>

        {step.prompts.map((promptConfig, index) => (
          <Box key={index} role="tabpanel" hidden={selectedTab !== index}>
            {selectedTab === index && (
              <PromptConfigurationEditor
                promptIndex={index}
                promptConfig={promptConfig}
                updatePromptField={updatePromptField}
                deletePrompt={deletePrompt}
                canDelete={step.prompts.length > 1}
                stepId={step.stepId}
              />
            )}
          </Box>
        ))}
      </Collapse>
    </RoundedBorderDiv>
  );
}
