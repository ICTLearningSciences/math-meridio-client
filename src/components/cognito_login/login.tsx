/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useNavigateWithParams } from "../../hooks/use-navigate-with-params";
import type { UseWithLogin } from "../../store/slices/player/use-with-login";

export default function Login(props: {
  useLogin: UseWithLogin;
}): React.ReactNode {
  const { useLogin } = props;
  const { login, state: loginState } = useLogin;
  const navigate = useNavigateWithParams();

  useEffect(() => {
    if (loginState.loginStatus.status === 2) {
      navigate("/classes");
      return;
    }
    fetchAuthSession().then((authSession) => {
      login(authSession?.tokens?.idToken?.toString()).then(() => {
        navigate("/classes");
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {({ signOut, user }) => (
          <div>
            <p>Welcome {user?.username}</p>
            <button onClick={signOut}>Sign out</button>
          </div>
        )}
      </Authenticator>
      <div
        style={{
          position: "absolute",
          bottom: "0",
        }}
      ></div>
    </div>
  );
}
