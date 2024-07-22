/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  CircularProgress,
} from '@mui/material';
import { RowDiv } from '../styled-components';

export function ErrorDialog(props: {
  error?: string;
  clearError?: () => void;
}): JSX.Element {
  const { error, clearError } = props;
  return (
    <Dialog
      data-cy="error-dialog"
      maxWidth="sm"
      fullWidth={true}
      open={Boolean(error)}
      onClose={clearError}
      style={{
        textAlign: 'center',
      }}
    >
      <DialogTitle data-cy="error-dialog-title">Error</DialogTitle>
      <DialogContent>
        <DialogContentText>{error}</DialogContentText>
      </DialogContent>
      <DialogContent>
        <Button
          data-cy="close-error-dialog"
          onClick={() => {
            clearError && clearError();
          }}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

interface Option {
  display: string;
  onClick: () => void;
}

export function TextDialog(props: {
  title: string;
  body: string;
  open: boolean;
  close: () => void;
}): JSX.Element {
  const { title, open, close, body } = props;
  return (
    <Dialog data-cy="text-dialog" maxWidth="sm" fullWidth={true} open={open}>
      <DialogTitle style={{ textAlign: 'center' }}>{title}</DialogTitle>
      <DialogContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <DialogContentText>{body}</DialogContentText>
        <Button data-cy="close-text-dialog" onClick={close}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function TwoOptionDialog(props: {
  title: string;
  open: boolean;
  actionInProgress: boolean;
  option1: Option;
  option2: Option;
}): JSX.Element {
  const { title, option1, option2, open, actionInProgress } = props;
  return (
    <Dialog
      data-cy="two-option-dialog"
      maxWidth="sm"
      fullWidth={true}
      open={open}
    >
      <DialogTitle style={{ textAlign: 'center' }}>{title}</DialogTitle>
      <DialogContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {actionInProgress && <CircularProgress />}
        <RowDiv>
          <Button
            disabled={actionInProgress}
            data-cy="option-1"
            onClick={() => {
              option1.onClick();
            }}
          >
            {option1.display}
          </Button>
          <Button
            disabled={actionInProgress}
            data-cy="option-2"
            onClick={() => {
              option2.onClick();
            }}
          >
            {option2.display}
          </Button>
        </RowDiv>
      </DialogContent>
    </Dialog>
  );
}
