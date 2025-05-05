/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { DiscussionStage } from './types';
import { Button } from '@mui/material';
import { RowDiv, ColumnDiv } from '../../styled-components';

export function ExistingStageItem(props: {
  stage: DiscussionStage;
  goToStage: () => void;
  editStage: () => void;
}) {
  const { stage, editStage } = props;
  return (
    <RowDiv
      style={{
        width: '100%',
        justifyContent: 'space-between',
        borderBottom: '1px solid black',
      }}
    >
      <h3>{stage.title}</h3>
      <RowDiv>
        <Button onClick={editStage}>Edit</Button>
      </RowDiv>
    </RowDiv>
  );
}

export function ExistingStages(props: {
  goToStage: (stage: DiscussionStage) => void;
  stages: DiscussionStage[];
  editStage: (stage: DiscussionStage) => void;
}): JSX.Element {
  const { stages, editStage } = props;
  if (!stages.length) {
    return <></>;
  }

  return (
    <ColumnDiv
      style={{
        width: '95%',
      }}
    >
      {stages.map((stage) => {
        return (
          <ExistingStageItem
            key={stage._id}
            stage={stage}
            editStage={() => {
              editStage(stage);
            }}
            goToStage={() => {
              props.goToStage(stage);
            }}
          />
        );
      })}
    </ColumnDiv>
  );
}

export function SelectCreateStage(props: {
  goToStage: (stage: DiscussionStage) => void;
  existingStages: DiscussionStage[];
  onEditStage: (stage: DiscussionStage) => void;
  onCreateStage: () => void;
}): JSX.Element {
  const { existingStages, onEditStage, onCreateStage, goToStage } = props;
  return (
    <ColumnDiv
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <h1>Discussion Stage Builder</h1>
      <ExistingStages
        goToStage={goToStage}
        stages={existingStages}
        editStage={onEditStage}
      />
      <Button onClick={onCreateStage}>+ Create New Discussion Stage</Button>
    </ColumnDiv>
  );
}
