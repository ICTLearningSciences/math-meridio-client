/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  CircularProgress,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import {
  Download,
  Save,
  Upload,
  ArrowBack,
  ContentCopy,
} from "@mui/icons-material";

import { InputField } from "../shared/input-components";
import { equals } from "../../../helpers";
import type { DiscussionStage, FlowItem } from "../types";
import { ColumnDiv, RowDiv } from "../../../styled-components";
import type { AllStartOfPhaseSteps } from "../../../helpers";
import { StageFlowContainer } from "./stage-flow-container";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export function EditDiscussionStage(props: {
  goToStage: (stage: DiscussionStage) => void;
  stage: DiscussionStage;
  saveStage: (stage: DiscussionStage) => Promise<DiscussionStage>;
  returnTo: () => void;
  gameIdentifierToStartOfPhaseSteps: AllStartOfPhaseSteps;
}): React.ReactNode {
  const {
    stage,
    saveStage: _saveStage,
    returnTo,
    gameIdentifierToStartOfPhaseSteps,
  } = props;

  const [localStageCopy, setLocalStageCopy] = React.useState<DiscussionStage>(
    JSON.parse(JSON.stringify(stage)),
  );
  const [saveInProgress, setSaveInProgress] = React.useState<boolean>(false);
  const [uploadInProgress, setUploadInProgress] =
    React.useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  async function uploadStage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    try {
      setUploadInProgress(true);
      const file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setLocalStageCopy({
            ...JSON.parse(e.target.result as string),
            _id: stage._id,
            clientId: stage.clientId,
          });
        }
        setUploadInProgress(false);
      };
    } catch (e) {
      console.error(e);
      setUploadInProgress(false);
    }
  }

  function addNewFlow() {
    const emptyFlow: FlowItem = {
      clientId: uuidv4(),
      name: "",
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
        width: "100%",
        height: "100%",
        overflowY: "auto",
        position: "relative",
      }}
    >
      <IconButton
        onClick={returnTo}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 100,
          color: "#1976d2",
        }}
      >
        <ArrowBack />
      </IconButton>
      <ColumnDiv
        data-cy="edit-stage-header"
        style={{
          alignSelf: "center",
          alignItems: "center",
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
          <Button
            style={{ marginRight: "10px" }}
            variant="outlined"
            disabled={saveInProgress || equals(localStageCopy, stage)}
            endIcon={saveInProgress ? <CircularProgress /> : <Save />}
            onClick={saveStage}
          >
            Save
          </Button>
          <Button
            style={{
              marginRight: "10px",
            }}
            variant="outlined"
            endIcon={<Download />}
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(stage),
            )}`}
            download={`${stage.clientId}.json`}
          >
            Download
          </Button>
          <Button
            component="label"
            variant="outlined"
            tabIndex={-1}
            endIcon={saveInProgress ? <CircularProgress /> : <Upload />}
            style={{
              marginRight: "10px",
            }}
          >
            Load
            <VisuallyHiddenInput
              type="file"
              accept="application/json"
              disabled={uploadInProgress}
              onChange={uploadStage}
            />
          </Button>
          <Button onClick={addNewFlow} variant="outlined">
            + Add Flow
          </Button>
        </RowDiv>
        {/* Stage Id */}
        <Typography
          style={{ position: "absolute", top: 0, right: 0 }}
          variant="caption"
        >
          <b>Stage Id:</b> {stage.clientId}
          <IconButton
            onClick={() => {
              navigator.clipboard.writeText(stage.clientId);
            }}
          >
            <ContentCopy
              style={{
                fontSize: "16px",
              }}
            />
          </IconButton>
        </Typography>
      </ColumnDiv>
      <StageFlowContainer
        localStage={localStageCopy}
        updateLocalStage={setLocalStageCopy}
        gameIdentifierToStartOfPhaseSteps={gameIdentifierToStartOfPhaseSteps}
      />
    </ColumnDiv>
  );
}
