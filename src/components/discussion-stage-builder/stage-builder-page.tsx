/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { SelectCreateStage } from "./select-create-stage";
import { EditDiscussionStage } from "./edit-stage/edit-stage";
import type { DiscussionStage } from "./types";
import { useWithStages } from "../../store/slices/stages/use-with-stages";
import { getAllStartOfPhaseSteps } from "../../helpers";
import { LearningObjectivesBuilder } from "./learning-objectives-builder";

export function StageBuilderPage(): React.ReactNode {
  const {
    addNewLocalDiscussionStage,
    addOrUpdateDiscussionStage,
    discussionStages,
  } = useWithStages();
  const existingStages: DiscussionStage[] = discussionStages;

  const gameIdentifierToStartOfPhaseSteps =
    getAllStartOfPhaseSteps(existingStages);
  const [selectedStageClientId, setSelectedStageClientId] =
    React.useState<string>("");
  const [selectedTab, setSelectedTab] = React.useState<number>(0);

  const selectedStage = existingStages.find(
    (stage) => stage.clientId === selectedStageClientId,
  );

  const renderDiscussionStagesTab = () => {
    if (!selectedStage) {
      return (
        <SelectCreateStage
          existingStages={existingStages}
          onEditStage={(stage) => {
            setSelectedStageClientId(stage.clientId);
          }}
          onCreateStage={() => {
            const newStage = addNewLocalDiscussionStage();
            setSelectedStageClientId(newStage.clientId);
          }}
        />
      );
    } else {
      return (
        <EditDiscussionStage
          returnTo={() => {
            setSelectedStageClientId("");
          }}
          stage={selectedStage}
          saveStage={async (stage) => {
            return await addOrUpdateDiscussionStage(stage);
          }}
          gameIdentifierToStartOfPhaseSteps={gameIdentifierToStartOfPhaseSteps}
        />
      );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
        >
          <Tab label="Discussion Stages" />
          <Tab label="Learning Objectives" />
        </Tabs>
      </Box>
      {selectedTab === 0 && renderDiscussionStagesTab()}
      {selectedTab === 1 && <LearningObjectivesBuilder />}
    </Box>
  );
}
