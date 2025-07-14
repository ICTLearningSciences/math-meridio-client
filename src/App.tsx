/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { Header } from './components/header';
import LoginPage from './components/login-page';
import AvatarPage from './components/avatar-page';
import GamePageSoccer from './components/game/game-page-soccer';
import GamePageBasketball from './components/game/game-page-basketball';
import RoomPage from './components/game/room-page';
import PhaserTestPage from './components/phaser-test-page';
import { StageBuilderPage } from './components/discussion-stage-builder/stage-builder-page';

import { store } from './store';
import { useWithHydrateRedux } from './store/use-with-hydrate-redux';

function MainApp() {
  useWithHydrateRedux();

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <Header />
          <div className="page">
            <RoomPage />
          </div>
        </>
      ),
    },
    {
      path: '/login',
      element: (
        <>
          <Header />
          <div className="page">
            <LoginPage />
          </div>
        </>
      ),
    },
    {
      path: '/avatar-creator',
      element: (
        <>
          <Header />
          <div className="page">
            <AvatarPage />
          </div>
        </>
      ),
    },
    {
      path: '/game-soccer/:roomId',
      element: (
        <>
          <Header />
          <div className="page">
            <GamePageSoccer />
          </div>
        </>
      ),
    },
    {
      path: '/game-basketball/:roomId',
      element: (
        <>
          <Header />
          <div className="page">
            <GamePageBasketball />
          </div>
        </>
      ),
    },
    {
      path: '/discussion-builder',
      element: (
        <>
          <Header />
          <div className="page">
            <StageBuilderPage goToStage={() => console.log('')} />
          </div>
        </>
      ),
    },
    {
      path: '/phaser',
      element: (
        <>
          <Header />
          <div className="page">
            <PhaserTestPage />
          </div>
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
