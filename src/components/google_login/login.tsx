/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { LoginUI } from './login-ui';
import { useNavigateWithParams } from '../../hooks/use-navigate-with-params';
import { UseWithLogin } from '../../store/slices/player/use-with-login';
import { LoadStatus } from '../../types';
import { EducationalRole } from '../../store/slices/player/types';
export default function Login(props: { useLogin: UseWithLogin }): JSX.Element {
  const navigate = useNavigateWithParams();
  const { useLogin } = props;
  const { loginWithGoogle, state: loginState } = useLogin;
  const instructorloginGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      loginWithGoogle(
        tokenResponse.access_token,
        EducationalRole.INSTRUCTOR
      ).then((user) => {
        console.log('user logged in', user);
        handleLoginNavigate();
      });
    },
  });

  const studentloginGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      loginWithGoogle(tokenResponse.access_token, EducationalRole.STUDENT).then(
        (user) => {
          console.log('user logged in', user);
          handleLoginNavigate();
        }
      );
    },
  });

  async function handleLoginNavigate() {
    if (typeof window === 'undefined') {
      return;
    }
    // TODO: navigate to the home page
    console.log('navigating to home');
    navigate('/');
  }

  useEffect(() => {
    if (loginState.loginStatus.status === LoadStatus.DONE) {
      handleLoginNavigate();
    }
  }, [loginState.loginStatus]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoginUI
        loginState={loginState}
        instructorloginGoogle={instructorloginGoogle}
        studentloginGoogle={studentloginGoogle}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0',
        }}
      ></div>
    </div>
  );
}
