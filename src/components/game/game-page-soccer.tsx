/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EventSystem from '../../game/event-system';

import ChatThread from './chat-thread';
import ChatForm from './chat-form';
import { Game } from '../../game/types';
import { useAppSelector } from '../../store/hooks';
import { useWithGame } from '../../store/slices/game/use-with-game-state';
import { GameStateHandler } from '../../classes/game-state-handler';
import withAuthorizationOnly from '../../wrap-with-authorization-only';
import SoccerGame from '../../game/soccer/SimulationScene';

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
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
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
        margin: 8,
        marginLeft:10,
        marginTop:10
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
  style?: React.CSSProperties;
  userVotes: { name: string; direction: 'left' | 'right' }[];
}) {
  useEffect(() => {
    props.userVotes.forEach((player, index) => {
      const containerId = `phaser-container-${index}`;
      if (!document.getElementById(containerId)) return;
      if ((window as any)[`phaserInstance-${containerId}`]) return;

      const config = {
        type: Phaser.AUTO,
        width: 250,
        height: 200,
        parent: containerId,
        physics: { default: 'arcade' },
        scene: new SoccerGame({
          containerId,
          direction: player.direction,
          playerId: index + 1,
          avatar: `boy_${(index % 4) + 1}`,
          name: player.name,
        }),
      };

      const game = new Phaser.Game(config);
      (window as any)[`phaserInstance-${containerId}`] = game;
    });
  }, [props.userVotes]);

  return (
    <Card
      className="scroll box"
      style={{
        overflowY: 'auto',
        flexGrow: 1,
        margin: 10,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 10,
        ...props.style,
      }}
    >
      <Typography fontWeight="bold" mb={1}>
        Simulation
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        {props.userVotes.map((_, index) => (
          <Grid
            key={index}
            item
            xs={12 / Math.min(2, props.userVotes.length)}
            style={{ height: '50%' }}
          >
            <div
              id={`phaser-container-${index}`}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#eee',
                border: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}


function Scoreboard(props: {
  style?: React.CSSProperties;
  players: {
    name: string;
    direction: 'left' | 'right' | null;
    outcome: 'Score' | 'Saved' | null;
    score: number;
  }[];
}) {
  const sorted = [...props.players].sort((a, b) => b.score - a.score);

  return (
    <Card sx={{ p: 2, borderRadius: 2, flexGrow: 1, ...props.style }}>
      <Typography fontWeight="bold" textAlign="left" sx={{ mb: 1 }}>
        Scoreboard
      </Typography>
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        {/* Header Row */}
        <Card
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            bgcolor: 'grey.300',
          }}
        >
          <Typography sx={{ flex: 1, fontWeight: 'bold' }}>Place</Typography>
          <Typography sx={{ flex: 2, fontWeight: 'bold' }}>Player</Typography>
          <Typography
            sx={{ flex: 3, fontWeight: 'bold', textAlign: 'center' }}
          >
            Last Kick Direction
          </Typography>
          <Typography
            sx={{ flex: 2, fontWeight: 'bold', textAlign: 'center' }}
          >
            Outcome
          </Typography>
          <Typography
            sx={{ flex: 1, fontWeight: 'bold', textAlign: 'right' }}
          >
            Score
          </Typography>
        </Card>

        {/* Player Rows */}
        {sorted.map((player, index) => (
          <Card
            key={index}
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'space-between',
              bgcolor: 'grey.700',
              color: 'white',
            }}
          >
            <Typography sx={{ flex: 1 }}>{index + 1}</Typography>
            <Typography sx={{ flex: 2 }}>{player.name}</Typography>
            <Typography sx={{ flex: 3, textAlign: 'center' }}>
              {player.direction ?? 'N/A'}
            </Typography>
            <Typography sx={{ flex: 2, textAlign: 'center' }}>
              {player.outcome ?? 'N/A'}
            </Typography>
            <Typography sx={{ flex: 1, textAlign: 'right' }}>
              {player.score}
            </Typography>
          </Card>
        ))}
      </Stack>
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
        overflowY: 'auto',
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

function Timer({ secondsLeft }: { secondsLeft: number }): JSX.Element {
  const displaySeconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <>
      <Typography variant="h3" fontWeight="bold" textAlign="center">
        00 : {displaySeconds}
        <Typography
          component="span"
          variant="h3"
          color="error"
          fontWeight="bold"
        >
        </Typography>
      </Typography>
      <Typography variant="body2" textAlign="center">
        MINUTES SECONDS
      </Typography>
    </>
  );
}

function DirectionControls({
  leftVotes,
  rightVotes,
  onVote,
  disabled,
}: {
  leftVotes: number;
  rightVotes: number;
  onVote: (direction: 'left' | 'right') => void;
  disabled: boolean;
}) {
  return (
    <Stack
      direction="row"
      spacing={4}
      justifyContent="center"
      alignItems="center"
      sx={{
        mt: 2,
        backgroundColor: 'white',
        p: 2,
        borderRadius: 2,
        width: '100%',
        height: '70%',
      }}
    >
      {/* Left Vote */}
      <Stack alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          {leftVotes}
        </Typography>
        <Button
          variant="outlined"
          disabled={disabled}
          onClick={() => onVote('left')}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            borderWidth: 5,
            borderColor: !disabled ? 'error.main' : 'grey.500',
            color: !disabled ? 'error.main' : 'grey.500',
            fontSize: 40,
          }}
        >
          ←
        </Button>
      </Stack>

      {/* Right Vote */}
      <Stack alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          {rightVotes}
        </Typography>
        <Button
          variant="outlined"
          disabled={disabled}
          onClick={() => onVote('right')}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            borderWidth: 5,
            borderColor: !disabled ? 'error.main' : 'grey.500',
            color: !disabled ? 'error.main' : 'grey.500',
            fontSize: 40,
          }}
        >
          →
        </Button>
      </Stack>
    </Stack>
  );
}

function GamePage(): JSX.Element {
  const { room, simulation } = useAppSelector((state) => state.gameData);
  const { game, gameStateHandler, launchGame, responsePending } = useWithGame();
  const navigate = useNavigate();

  const [leftVotes, setLeftVotes] = React.useState(0);
  const [rightVotes, setRightVotes] = React.useState(0);
  const [voteCount, setVoteCount] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(15);

  const [userVotes, setUserVotes] = React.useState<
    { name: string; direction: 'left' | 'right' }[]
  >([]);

  const [showSimulation, setShowSimulation] = React.useState(false);

  const [scoreData, setScoreData] = React.useState<
  { name: string; direction: 'left' | 'right' | null; outcome: 'Score' | 'Saved' | null; score: number }[]
>([]);

  // Initialize players with only names`
  useEffect(() => {
    if (gameStateHandler?.players?.length) {
      const initialScoreData = gameStateHandler.players.map((player) => ({
        name: player.name,
        direction: null,
        outcome: null,
        score: 0,
      }));         
        
      setScoreData(initialScoreData);
    }
  }, [gameStateHandler]);

  useEffect(() => {
    const handleSimulationEnded = (data: {
      player: string;
      kickLeft: number;
      kickRight: number;
      kickLeftMade: number;
      kickRightMade: number;
      totalPoints: number;
    }) => {
      const direction = data.kickLeft ? 'left' : 'right';
      const outcome = data.totalPoints > 0 ? 'Score' : 'Saved';
      const playerIndex = parseInt(data.player, 10) - 1;
  
      setScoreData((prev) => {
        const updated = [...prev];
        if (updated[playerIndex]) {
          updated[playerIndex] = {
            ...updated[playerIndex],
            direction,
            outcome,
            score: data.totalPoints,
          };
        }
        return updated;
      });
    };
  
    EventSystem.on('simulationEnded', handleSimulationEnded);
    return () => {
      EventSystem.off('simulationEnded', handleSimulationEnded);
    };
  }, []);  

  // countdown timer
  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // show simulation after time ends
  React.useEffect(() => {
    if (secondsLeft === 0) {
      setShowSimulation(true);
    }
  }, [secondsLeft]);

  const handleVote = (direction: 'left' | 'right') => {
    if (voteCount >= 4 || secondsLeft <= 0) return;

    const mockUserNames = ['Logan', 'Charlie', 'Brian', 'Adam'];
    const userName = mockUserNames[voteCount]; // assign unique name per vote

    const newVote = { name: userName, direction };
    setUserVotes((prev) => [...prev, newVote]);

    if (direction === 'left') setLeftVotes((prev) => prev + 1);
    else setRightVotes((prev) => prev + 1);

    setVoteCount((prev) => prev + 1);
  };

  if (!game || !gameStateHandler) {
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
          <div
            className="column"
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ flex: 'none' }}>
              <ProblemSpace game={game} controller={gameStateHandler} />
            </div>

            <div style={{ flex: 'none', marginLeft: 10, marginRight: 42 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  width: '100%',
                }}
              >
                <Timer secondsLeft={secondsLeft} />
                <DirectionControls
                  leftVotes={leftVotes}
                  rightVotes={rightVotes}
                  onVote={handleVote}
                  disabled={secondsLeft <= 0 || voteCount >= 4}
                />

              </Card>
            </div>

            <SolutionSpace game={game} controller={gameStateHandler} />
          </div>
        </Grid>

        <Grid item xs={6} style={{ height: '100%' }}>
          <div
            className="column"
            style={{
              height: '99%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {showSimulation ? (
              <SimulationSpace
                game={game}
                controller={gameStateHandler}
                simulation={simulation}
                userVotes={userVotes}
                style={{ flex: 1 }}
              />
            ) : (
              <Card sx={{ flex: 1, m: 2, p: 2 }}>Waiting for simulation...</Card>
            )}

            <Scoreboard
              style={{ flex: 0.6, marginLeft: 1.2, marginRight: 1.2 }}
              players={scoreData}
            />
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
