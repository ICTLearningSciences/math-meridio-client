/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import ChatThread from './chat-thread';
import ChatForm from './chat-form';
import { Game } from '../../game/types';
import { useAppSelector } from '../../store/hooks';
import { useWithGame } from '../../store/slices/game/use-with-game-state';
import { GameStateHandler } from '../../classes/game-state-handler';
import withAuthorizationOnly from '../../wrap-with-authorization-only';

function ProblemSpace(props: {
  game: Game;
  controller: GameStateHandler;
}): JSX.Element {
  return (
    <Card
      className="column box"
      style={{
        overflowY: 'auto',
        height: 150,
        minHeight: 200,
        margin: 10,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
      }}
    >
      <Typography fontWeight="bold">Problem</Typography>
      {props.game.showProblem(props.controller)}
    </Card>
  );
}

function SolutionSpace(props: {
  game: Game;
  controller: GameStateHandler;
}): JSX.Element {
  return (
    <Card
      className="scroll box"
      style={{
        overflowY: 'auto',
        flexGrow: 1,
        margin: 10,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
      }}
    >
      <Typography fontWeight="bold">Approach</Typography>
      {props.game.showSolution(props.controller)}
    </Card>
  );
}

function SimulationSpace(props: {
  game: Game;
  controller: GameStateHandler;
  simulation?: string;
}): JSX.Element {
  return (
    <Card
      className="scroll box"
      style={{
        overflowY: 'auto',
        flexGrow: 1,
        margin: 10,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}
    >
      <Typography fontWeight="bold">Simulation</Typography>
      {props.game.showSimulation(props.controller, props.simulation)}
    </Card>
  );
}

function ResultsSpace(props: {
  game: Game;
  controller: GameStateHandler;
}): JSX.Element {
  return (
    <Card
      className="scroll box"
      style={{
        overflow: 'auto',
        flexGrow: 1,
        margin: 10,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}
    >
      <Typography fontWeight="bold">Results</Typography>
      {props.game.showResult(props.controller)}
    </Card>
  );
}

function GamePage(): JSX.Element {
  const { room, simulation } = useAppSelector((state) => state.gameData);
  const { game, gameStateHandler, launchGame, responsePending } = useWithGame();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!room) {
      navigate('/');
    }
    // return () => {
    //   if (gameStateHandler && room) {
    //     leaveRoom();
    //   }
    // };
  }, [Boolean(room)]);

  if (!room) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  if (!gameStateHandler || !game) {
    return (
      <div className="root center-div">
        <Button onClick={launchGame} disabled={Boolean(gameStateHandler)}>
          Begin
        </Button>
      </div>
    );
  }

  return (
    <div className="root row" style={{ backgroundColor: '#cfdaf8' }}>
      <Grid container flexDirection="row" style={{ height: '100%' }}>
        <Grid item xs={6} flexDirection="column" style={{ height: '100%' }}>
          <div className="column" style={{ height: '100%', width: '100%' }}>
            <ProblemSpace game={game} controller={gameStateHandler} />
            <SolutionSpace game={game} controller={gameStateHandler} />
          </div>
        </Grid>
        <Grid item xs={6} style={{ height: '100%' }}>
          <div className="column" style={{ height: '100%', width: '100%' }}>
            <SimulationSpace
              game={game}
              controller={gameStateHandler}
              simulation={simulation}
            />
            <ResultsSpace game={game} controller={gameStateHandler} />
          </div>
        </Grid>
      </Grid>
      <Stack
        spacing={2}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: 600,
          padding: 10,
          boxSizing: 'border-box',
        }}
      >
        <ChatThread responsePending={responsePending} />
        <ChatForm />
      </Stack>
    </div>
  );
}

export default withAuthorizationOnly(GamePage);
