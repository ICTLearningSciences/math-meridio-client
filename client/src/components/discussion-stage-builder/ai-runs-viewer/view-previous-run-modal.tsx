/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Box, Button, Modal, Theme } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useState } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { AiServiceStepDataTypes } from "../../../ai-services/ai-service-types";
import { ColumnDiv, JsonDisplay } from "../../../styled-components";

const useStyles = makeStyles({ name: { ViewPreviousRunModal } })(
  (theme: Theme) => ({
    inputField: {
      width: "100%",
      margin: 10,
    },
    modal: {},
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      maxWidth: "50%",
    },
  })
);

export default function ViewPreviousRunModal(props: {
  previousRunStepData?: AiServiceStepDataTypes[];
  open: boolean;
  close: () => void;
}): JSX.Element {
  const { previousRunStepData, open, close } = props;
  const { classes } = useStyles();
  const [showJsonAsText, setShowJsonAsText] = useState(false);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    height: "80%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
  };

  if (!previousRunStepData) {
    return <></>;
  }
  return (
    <div>
      <Modal open={Boolean(open)} className={classes.modal}>
        <Box sx={style}>
          <div style={{ overflow: "auto" }}>
            {previousRunStepData.map((promptStep, index) => {
              const responseMessage = promptStep.aiServiceResponse;

              return (
                <ColumnDiv key={index}>
                  <h2 style={{ alignSelf: "center" }}>{`Step ${index + 1}`}</h2>
                  <div>Prompt</div>
                  <div style={{ border: "1px solid black" }}>
                    <JsonView
                      data={promptStep.aiServiceRequestParams}
                      shouldExpandNode={allExpanded}
                      style={defaultStyles}
                    />
                  </div>
                  <br />
                  <div>Response</div>
                  <div style={{ border: "1px solid black" }}>
                    {!showJsonAsText ? (
                      <div>
                        <JsonView
                          data={responseMessage}
                          shouldExpandNode={allExpanded}
                          style={defaultStyles}
                        />
                      </div>
                    ) : (
                      <div>
                        <JsonDisplay>
                          {JSON.stringify(responseMessage, null, 2)}
                        </JsonDisplay>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setShowJsonAsText(!showJsonAsText);
                    }}
                  >
                    {showJsonAsText ? "Show as JSON" : "Show as Text"}
                  </Button>
                </ColumnDiv>
              );
            })}
          </div>
          <Button
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
