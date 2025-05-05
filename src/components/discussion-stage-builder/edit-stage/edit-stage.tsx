/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from 'react';
import { StageFlowContainer } from './stage-flow-container';
import {
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { InputField } from '../shared/input-components';
import { v4 as uuidv4 } from 'uuid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { equals } from '../../../helpers';
import { DiscussionStage, FlowItem } from '../types';
import { ColumnDiv, RowDiv } from '../../../styled-components';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
export function EditDiscussionStage(props: {
  goToStage: (stage: DiscussionStage) => void;
  stage: DiscussionStage;
  saveStage: (stage: DiscussionStage) => Promise<DiscussionStage>;
  returnTo: () => void;
}): JSX.Element {
  const { stage, saveStage: _saveStage, returnTo } = props;

  const [localStageCopy, setLocalStageCopy] = React.useState<DiscussionStage>(
    JSON.parse(JSON.stringify(stage))
  );
  const [saveInProgress, setSaveInProgress] = React.useState<boolean>(false);

  useEffect(() => {
    setLocalStageCopy(JSON.parse(JSON.stringify(stage)));
  }, [stage]);

  async function saveStage() {
    setSaveInProgress(true);
    try {
      await _saveStage(localStageCopy);
    } catch (e) {
      console.error(e);
    } finally {
      setSaveInProgress(false);
    }
  }

  function addNewFlow() {
    const emptyFlow: FlowItem = {
      clientId: uuidv4(),
      name: '',
      steps: [],
    };
    setLocalStageCopy((prevValue) => {
      return {
        ...prevValue,
        flowsList: [...prevValue.flowsList, emptyFlow],
      };
    });
  }

  return (
    <ColumnDiv
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={returnTo}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 100,
          color: '#1976d2',
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <ColumnDiv
        data-cy="edit-stage-header"
        style={{
          alignSelf: 'center',
          alignItems: 'center',
        }}
      >
        <InputField
          label="Stage Name"
          value={localStageCopy.title}
          width="fit-content"
          onChange={(v) => {
            setLocalStageCopy((prevValue) => {
              return {
                ...prevValue,
                title: v,
              };
            });
          }}
        />
        <RowDiv>
          {!saveInProgress ? (
            <Button
              style={{
                marginRight: '10px',
              }}
              variant="outlined"
              disabled={equals(localStageCopy, stage)}
              onClick={saveStage}
            >
              Save
            </Button>
          ) : (
            <CircularProgress
              style={{
                marginRight: 10,
              }}
            />
          )}
          <Button onClick={addNewFlow} variant="outlined">
            + Add Flow
          </Button>
        </RowDiv>
        {/* Stage Id */}
        <Typography
          style={{ position: 'absolute', top: 0, right: 0 }}
          variant="caption"
        >
          <b>Stage Id:</b> {stage.clientId}
          <IconButton
            onClick={() => {
              navigator.clipboard.writeText(stage.clientId);
            }}
          >
            <ContentCopyIcon
              style={{
                fontSize: '16px',
              }}
            />
          </IconButton>
        </Typography>
      </ColumnDiv>
      <StageFlowContainer
        localStage={localStageCopy}
        updateLocalStage={setLocalStageCopy}
      />
    </ColumnDiv>
  );
}
