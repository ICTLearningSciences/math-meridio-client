/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";

import { Header } from "./components/header";
import AvatarPage from "./components/avatar-page";
import PhaserTestPage from "./components/phaser-test-page";
import { StageBuilderPage } from "./components/discussion-stage-builder/stage-builder-page";
import Login from "./components/google_login/login";
import {
  ClassesPage,
  SelectedClassPage,
  RoomViewPage,
} from "./components/classes";

import { store } from "./store";
import { useWithHydrateRedux } from "./store/use-with-hydrate-redux";
import { useWithLogin } from "./store/slices/player/use-with-login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useWithEducationalData } from "./store/slices/educational-data/use-with-educational-data";
import AdminPage from "./components/admin";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { requireEnv } from "./helpers";

import "@aws-amplify/ui-react/styles.css";

const USER_POOL_ID = requireEnv("VITE_USER_POOL_ID");
const USER_POOL_CLIENT_ID = requireEnv("VITE_USER_POOL_CLIENT_ID");
const COGNITO_DOMAIN = requireEnv("VITE_COGNITO_DOMAIN");
const REDIRECT_URL = requireEnv("VITE_REDIRECT_URL");

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
          scopes: ["email", "openid"],
          providers: ["Google"],
          redirectSignIn: [REDIRECT_URL],
          redirectSignOut: [REDIRECT_URL],
          responseType: "code",
        },
      },
    },
  },
});

// Layout component that provides useLogin to all routes
function RootLayout() {
  const useLogin = useWithLogin();

  return (
    <>
      <Header useLogin={useLogin} />
      <div className="page">
        <Outlet />
      </div>
    </>
  );
}

// Wrapper for GoogleLoginPage to provide useLogin
function GoogleLoginPageWrapper() {
  const useLogin = useWithLogin();
  return <Login useLogin={useLogin} />;
}

// Layout component for game routes that provides useWithEducationalData to child routes
function GameLayout() {
  const educationalData = useWithEducationalData();
  return <Outlet context={educationalData} />;
}

// Create router OUTSIDE the component so it's only created once
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <GoogleLoginPageWrapper />,
      },
      {
        path: "/avatar-creator",
        element: <AvatarPage />,
      },
      {
        path: "/classes",
        element: <GameLayout />,
        children: [
          {
            index: true,
            element: <ClassesPage />,
          },
          {
            path: ":classId",
            element: <SelectedClassPage />,
          },
          {
            path: ":classId/room/:roomId",
            element: <RoomViewPage />,
          },
        ],
      },
      {
        path: "/admin",
        element: <AdminPage />,
      },
      {
        path: "/discussion-builder",
        element: (
          <StageBuilderPage
            goToStage={() => {
              console.log("");
            }}
          />
        ),
      },
      // test stuff only remove later
      {
        path: "/phaser",
        element: <PhaserTestPage />,
      },
    ],
  },
]);

export function MainApp() {
  useWithHydrateRedux();
  return <RouterProvider router={router} />;
}

function App(): React.ReactNode {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "123";
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <div style={{ height: "100vh" }}>
          <MainApp />
        </div>
      </Provider>
    </GoogleOAuthProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default withAuthenticator(App, {
  loginMechanism: "email",
  socialProviders: ["google"],
});
