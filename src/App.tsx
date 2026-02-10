/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';

import { Header } from './components/header';
import AvatarPage from './components/avatar-page';
import PhaserTestPage from './components/phaser-test-page';
import { StageBuilderPage } from './components/discussion-stage-builder/stage-builder-page';
import GoogleLoginPage from './components/google_login/login';
import {
  ClassesPage,
  SelectedClassPage,
  RoomViewPage,
} from './components/classes';

import { store } from './store';
import { useWithHydrateRedux } from './store/use-with-hydrate-redux';
import { useWithLogin } from './store/slices/player/use-with-login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useWithHostGameManagement } from './classes/authority/use-with-host-game-manage';

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
  return <GoogleLoginPage useLogin={useLogin} />;
}

// Layout component for game routes that provides useWithHostGameManagement to child routes
function GameLayout() {
  const gameManagement = useWithHostGameManagement();
  return <Outlet context={gameManagement} />;
}

// Create router OUTSIDE the component so it's only created once
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <GoogleLoginPageWrapper />,
      },
      {
        path: '/avatar-creator',
        element: <AvatarPage />,
      },
      {
        path: '/classes',
        element: <GameLayout />,
        children: [
          {
            index: true,
            element: <ClassesPage />,
          },
          {
            path: ':classId',
            element: <SelectedClassPage />,
          },
          {
            path: ':classId/room/:roomId',
            element: <RoomViewPage />,
          },
        ],
      },
      {
        path: '/discussion-builder',
        element: (
          <StageBuilderPage
            goToStage={() => {
              console.log('');
            }}
          />
        ),
      },
      // test stuff only remove later
      {
        path: '/phaser',
        element: <PhaserTestPage />,
      },
    ],
  },
]);

function MainApp() {
  useWithHydrateRedux();
  return <RouterProvider router={router} />;
}

function App(): JSX.Element {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '123';
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <MainApp />
        </div>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
