/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import LoginPage from './components/login-page';
import AvatarPage from './components/avatar-page';
import GamePage from './components/game/game-page';
import RoomPage from './components/game/room-page';
import { StageBuilderPage } from './components/discussion-stage-builder/stage-builder-page';

import { store } from './store';
import { useWithHydrateRedux } from './store/use-with-hydrate-redux';

function MainApp() {
  useWithHydrateRedux(); // NOTE: make sure to have this at the earliest point w/ store
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <RoomPage />
        </>
      ),
    },
    {
      path: '/login',
      element: (
        <>
          <LoginPage />
        </>
      ),
    },
    {
      path: '/avatar-creator',
      element: (
        <>
          <AvatarPage />
        </>
      ),
    },
    {
      path: '/game/:roomId',
      element: (
        <>
          <GamePage />
        </>
      ),
    },
    {
      path: '/discussion-builder',
      element: (
        <>
          <StageBuilderPage
            goToStage={() => {
              console.log('');
            }}
          />
        </>
      ),
    },
  ]);
  return <RouterProvider router={router} />;
}

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <div style={{ height: '100vh' }}>
        <MainApp />
      </div>
    </Provider>
  );
}

export default App;
