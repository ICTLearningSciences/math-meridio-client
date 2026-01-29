/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { ColumnCenterDiv, ColumnDiv } from '../../styled-components';
import { PlayerStateData } from '../../store/slices/player';
import { Button, CircularProgress } from '@mui/material';
import { LoadStatus } from '../../types';

export function LoginUI(props: {
  loginState: PlayerStateData;
  login: () => void;
  loginText: string;
  titleText?: string;
}) {
  const { loginState, login, loginText, titleText } = props;

  return (
    <ColumnCenterDiv
      style={{
        width: '400px',
        textAlign: 'center',
        border: '1px solid lightgrey',
        padding: '20px',
        boxShadow: '-5px 5px 10px 0px rgba(0,0,0,0.75)',
      }}
    >
      <ColumnDiv
        style={{
          marginBottom: '20px',
        }}
      >
        <span data-cy="login-title" style={{ fontSize: '22px' }}>
          {titleText || 'Meridio Math'}
        </span>
      </ColumnDiv>
      <div>
        {loginState.loginStatus.status === LoadStatus.IN_PROGRESS ? (
          <CircularProgress />
        ) : (
          <ColumnDiv
            style={{
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => login()}
              style={{
                fontSize: '16px',
                margin: '10px',
                width: 300,
              }}
              data-cy="login-btn"
            >
              {loginText}
            </Button>
          </ColumnDiv>
        )}
      </div>
    </ColumnCenterDiv>
  );
}
