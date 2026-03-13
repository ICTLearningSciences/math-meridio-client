/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import { LearningObjective } from '../../store/slices/game/types';

interface LearningObjectiveCardProps {
  learningObjective: LearningObjective;
  onSave: (
    learningObjectiveId: string,
    updates: Omit<LearningObjective, '_id'>
  ) => Promise<void>;
}

function LearningObjectiveCard(props: LearningObjectiveCardProps): JSX.Element {
  const { learningObjective, onSave } = props;
  const [title, setTitle] = React.useState(learningObjective.title);
  const [criteria, setCriteria] = React.useState(learningObjective.criteria);
  const [variableName, setVariableName] = React.useState(
    learningObjective.variableName
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(learningObjective._id, {
        title,
        criteria,
        variableName,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Criteria"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
          />
          <TextField
            label="Variable Name"
            variant="outlined"
            fullWidth
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            sx={{ alignSelf: 'flex-end' }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export function LearningObjectivesBuilder(): JSX.Element {
  const {
    educationalData,
    createLearningObjective,
    updateLearningObjective,
    fetchLearningObjectives,
  } = useWithEducationalData();
  const [isCreating, setIsCreating] = React.useState(false);

  React.useEffect(() => {
    fetchLearningObjectives();
  }, []);

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      await createLearningObjective({
        title: 'New Learning Objective',
        criteria: '',
        variableName: '',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async (
    learningObjectiveId: string,
    updates: Omit<LearningObjective, '_id'>
  ) => {
    await updateLearningObjective(learningObjectiveId, updates);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Learning Objectives
      </Typography>
      {educationalData.learningObjectives.map((lo) => (
        <LearningObjectiveCard
          key={lo._id}
          learningObjective={lo}
          onSave={handleSave}
        />
      ))}
      <Button
        variant="outlined"
        onClick={handleCreateNew}
        disabled={isCreating}
        fullWidth
        sx={{ mt: 2 }}
      >
        {isCreating ? 'Creating...' : '+ New Learning Objective'}
      </Button>
    </Box>
  );
}
