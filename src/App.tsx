/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Grid } from '@mui/material';

import ChatThread from './components/chat-thread';
import ChatForm from './components/chat-form';
import PhaserGame from './components/phaser-game';
import { Header } from './components/header';
import { StageBuilderPage } from './components/discussion-stage-builder/stage-builder-page';

import { store } from './store';
import { useWithHydrateRedux } from './store/use-with-hydrate-redux';

function MainApp() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <Header />
          <div
            style={{
              width: '100%',
              height: '94%', //header takes 6%
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Grid container xs={true} flexDirection="row">
              <Grid item xs={9}>
                <PhaserGame />
              </Grid>
              <Grid item xs={3} display="flex" flexDirection="column">
                <ChatThread />
                <ChatForm />
              </Grid>
            </Grid>
          </div>
        </>
      ),
    },
    {
      path: '/discussion-builder',
      element: (
        <>
          <Header />
          <div
            style={{
              width: '100%',
              height: '94%', //header takes 6%
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StageBuilderPage
              goToStage={() => {
                console.log('');
              }}
            />
          </div>
        </>
      ),
    },
  ]);
  useWithHydrateRedux(); // NOTE: make sure to have this at the earliest point w/ store
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
