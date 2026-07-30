/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useCallback, useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import "@aws-amplify/ui-react/styles.css";
import { useNavigateWithParams } from "../../hooks/use-navigate-with-params";
import type { UseWithLogin } from "../../store/slices/player/use-with-login";
import { requireEnv } from "../../helpers";

const USER_POOL_ID = requireEnv("VITE_USER_POOL_ID");
const USER_POOL_CLIENT_ID = requireEnv("VITE_USER_POOL_CLIENT_ID");
const COGNITO_DOMAIN = requireEnv("VITE_COGNITO_DOMAIN");

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID,
      userPoolClientId: USER_POOL_CLIENT_ID,
      
      loginWith: {
        email: true,
        phone: false,
        username: true,
        oauth: {
          domain: COGNITO_DOMAIN,
          scopes: ["email", "openid", "aws.cognito.signin.user.admin"],
          providers: ["Google"],
          redirectSignIn: [
            "http://localhost:3000/",
            "https://dev.mathmeridio.org",
            "https://qa.mathmeridio.org",
            "https://mathmeridio.org",
          ],
          redirectSignOut: [
            "http://localhost:3000/",
            "https://dev.mathmeridio.org",
            "https://qa.mathmeridio.org",
            "https://mathmeridio.org",
          ],
          responseType: "token",
        },
      },
    },
  },
});

export default function Login(props: {
  useLogin: UseWithLogin;
}): React.ReactNode {
  const navigate = useNavigateWithParams();

  const handleLoginNavigate = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    navigate("/classes");
  }, [navigate]);

  const { useLogin } = props;
  const { loginWithGoogle, state: loginState } = useLogin;

  if (loginState.loginStatus.status === 2) {
    handleLoginNavigate();
  }

  useEffect(() => {
    // Listen for auth events
    const unsubscribe = Hub.listen("auth", (data) => {
      const { event } = data.payload;

      const fetchUserData = () => {
        fetchAuthSession().then((authSession) => {
          loginWithGoogle(
            authSession?.tokens?.accessToken.toString(),
            "STUDENT",
          ).then(() => {
            handleLoginNavigate();
          });
        });
      };

      if (event === "signedIn") {
        console.log("User has successfully signed in!");
        // Trigger your callback or custom logic here
        fetchUserData();
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [loginWithGoogle, handleLoginNavigate]);

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
