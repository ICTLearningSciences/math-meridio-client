/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import React, { useEffect } from "react";
import { FlowItem } from "../types";
import { getFlowForStepId } from "../helpers";

export function FlowStepSelector(props: {
  flowsList: FlowItem[];
  currentJumpToStepId?: string;
  onStepSelected: (stepId: string) => void;
  rowOrColumn?: "row" | "column";
  disableStepsList?: string[];
  width?: string;
  title?: string;
}): JSX.Element {
  const { flowsList, onStepSelected, currentJumpToStepId } = props;
  const [selectedFlowId, setSelectedFlowId] = React.useState<string>("");
  const [selectedStepId, setSelectedStepId] = React.useState<string>("");
  useEffect(() => {
    if (currentJumpToStepId) {
      const flow = getFlowForStepId(flowsList, currentJumpToStepId);
      if (!flow) {
        return;
      }
      setSelectedFlowId(flow.clientId);
      setSelectedStepId(currentJumpToStepId);
    }
  }, [currentJumpToStepId]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        width: props.width || "100%",
        maxWidth: props.width || "100%",
        flexDirection: "column",
      }}
    >
      {props.title && (
        <span
          style={{
            alignSelf: "center",
            margin: 0,
            padding: 0,
          }}
        >
          {props.title}
        </span>
      )}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: props.rowOrColumn || "column",
        }}
      >
        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <InputLabel id="select-flow-label">Select flow</InputLabel>
          <Select
            labelId="select-flow-label"
            value={selectedFlowId}
            onChange={(e) => {
              if (selectedFlowId !== e.target.value) {
                setSelectedFlowId(e.target.value);
                setSelectedStepId("");
              }
            }}
            label="Output Data Type"
          >
            {flowsList.map((flow) => {
              return (
                <MenuItem key={flow.clientId} value={flow.clientId}>
                  {flow.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <InputLabel id="select-step-label">Select flow step</InputLabel>
          {/* when flow selected, select step */}
          <Select
            disabled={!selectedFlowId}
            labelId="select-step-label"
            value={selectedStepId}
            onChange={(e) => {
              setSelectedStepId(e.target.value);
              onStepSelected(e.target.value);
            }}
            label="Output Data Type"
          >
            {flowsList
              .find((flow) => flow.clientId === selectedFlowId)
              ?.steps.map((step, i) => {
                return (
                  <MenuItem
                    key={step.stepId}
                    value={step.stepId}
                    disabled={props.disableStepsList?.includes(step.stepId)}
                  >
                    {`Step ${i + 1}`}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
        <Button
          style={{
            margin: 0,
            padding: 0,
          }}
          disabled={!selectedFlowId && !selectedStepId}
          onClick={() => {
            setSelectedFlowId("");
            setSelectedStepId("");
            onStepSelected("");
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
