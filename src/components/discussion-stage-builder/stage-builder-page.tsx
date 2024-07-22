/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { SelectCreateStage } from './select-create-stage';
import { EditDiscussionStage } from './edit-stage/edit-stage';
import { defaultDicussionStage, DiscussionStage } from './types';
import { useWithStages } from '../../store/slices/stages/use-with-stages';

export function StageBuilderPage(props: {
  goToStage: (stage: DiscussionStage) => void;
}): JSX.Element {
  const {
    addNewLocalDiscussionStage,
    addOrUpdateDiscussionStage,
    discussionStages,
  } = useWithStages();
  const { goToStage } = props;
  const existingStages: DiscussionStage[] = discussionStages;

  const [selectedStageClientId, setSelectedStageClientId] =
    React.useState<string>('');
  const selectedStage = existingStages.find(
    (stage) => stage.clientId === selectedStageClientId
  );

  if (!selectedStage) {
    return (
      <SelectCreateStage
        goToStage={goToStage}
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
          setSelectedStageClientId('');
        }}
        goToStage={goToStage}
        stage={selectedStage}
        saveStage={async (stage) => {
          return await addOrUpdateDiscussionStage(stage);
        }}
      />
    );
  }
}
