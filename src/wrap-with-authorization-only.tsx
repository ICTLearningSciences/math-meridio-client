/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, IconButton } from "@mui/material";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";

import { useAppDispatch, useAppSelector } from "./store/hooks";
import { logout } from "./store/slices/player";
import { useWithLogin } from "./store/slices/player/use-with-login";
import { Header } from "./components/header";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Wrapper(props: { children: any }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { login } = useWithLogin();
  const { loginStatus } = useAppSelector((state) => state.playerData);

  React.useEffect(() => {
    if (loginStatus.status === 2) return;
    fetchAuthSession()
      .then((authSession) => {
        login(authSession?.tokens?.idToken?.toString()).catch(() => {
          dispatch(logout());
          signOut();
          navigate("/");
        });
      })
      .catch(() => {
        dispatch(logout());
        navigate("/");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginStatus.status]);

  return loginStatus.status === 2 ? (
    <div
      className="column center-div"
      style={{ height: "100%", width: "100%" }}
    >
      <Header />
      <div className="page">
        <div className="root center-div">{props.children}</div>
      </div>
    </div>
  ) : (
    <div className="root center-div">
      <CircularProgress size="large" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WithAuthorizationOnly(props: { children: any }) {
  const navigate = useNavigate();
  return (
    <div
      className="column center-div"
      style={{ height: "100%", width: "100%" }}
    >
      <Authenticator
        loginMechanism="email"
        socialProviders={["google"]}
        components={{
          Header: () => {
            return (
              <header className="column header" style={{ height: 80 }}>
                <div
                  className="row center-div"
                  style={{ justifyContent: "space-between" }}
                >
                  <div style={{ width: 300 }}>
                    <IconButton onClick={() => navigate("/")}>
                      <img height={60} src="/logo.png" alt="image" />
                    </IconButton>
                  </div>
                </div>
              </header>
            );
          },
        }}
      >
        {() => <Wrapper>{props.children}</Wrapper>}
      </Authenticator>
    </div>
  );
}

export default WithAuthorizationOnly;
