/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import { signOut } from "aws-amplify/auth";
import { useNavigateWithParams } from "../../hooks/use-navigate-with-params";
import type { UseWithLogin } from "../../store/slices/player/use-with-login";
import { CircularProgress } from "@mui/material";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/player";

function Login(props: { useLogin: UseWithLogin }): React.ReactNode {
  const { useLogin } = props;
  const { login, state: loginState } = useLogin;
  const navigate = useNavigateWithParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUserData = () => {
      fetchAuthSession().then((authSession) => {
        login(authSession?.tokens?.idToken?.toString())
          .then(() => {
            navigate("/classes");
          })
          .catch(() => {
            dispatch(logout());
            signOut();
          });
      });
    };
    if (loginState.loginStatus.status === 2) {
      navigate("/classes");
    } else {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CircularProgress />;
}

export default function LoginWrapper(props: {
  useLogin: UseWithLogin;
}): React.ReactNode {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Authenticator loginMechanism="email" socialProviders={["google"]}>
        {() => <Login useLogin={props.useLogin} />}
      </Authenticator>
    </div>
  );
}
