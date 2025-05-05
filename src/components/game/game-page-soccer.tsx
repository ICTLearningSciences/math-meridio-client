/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EventSystem from '../../game/event-system';
import courtBg from '../../game/soccer/court.jpeg';

import ChatThread from './chat-thread';
import ChatForm from './chat-form';
import { Game } from '../../game/types';
import { useAppSelector } from '../../store/hooks';
import { useWithGame } from '../../store/slices/game/use-with-game-state';
import { GameStateHandler } from '../../classes/game-state-handler';
import withAuthorizationOnly from '../../wrap-with-authorization-only';
import SoccerGame from '../../game/soccer/SimulationScene';
// import { checkProfanity } from '../../../src/classes/discussion-stage-handler'; // adjust path if needed

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

function SolutionSpace(
  this: any,
  props: {
    game: Game;
    controller: GameStateHandler;
    scoreData: {
      name: string;
      shots: { direction: 'left' | 'right'; outcome: 'Score' | 'Saved' }[];
    }[];
  }
) {
  const { scoreData } = props;

  let totalShots = 0;
  let leftShots = 0;
  let rightShots = 0;

  const scores = {
    kickLeft_goalieLeft: [] as number[],
    kickLeft_goalieRight: [] as number[],
    kickRight_goalieLeft: [] as number[],
    kickRight_goalieRight: [] as number[],
  };

  const matrixCounts = {
    kickLeft_goalieLeft: { total: 0, scored: 0 },
    kickLeft_goalieRight: { total: 0, scored: 0 },
    kickRight_goalieLeft: { total: 0, scored: 0 },
    kickRight_goalieRight: { total: 0, scored: 0 },
  };

  for (const player of scoreData) {
    for (const shot of player.shots) {
      const { direction, outcome } = shot;
      let goalieDived: 'left' | 'right';

      if (outcome === 'Saved') {
        goalieDived = direction; // goalie guessed correctly
      } else {
        goalieDived = direction === 'left' ? 'right' : 'left';
      }

      const key = `kick${
        direction.charAt(0).toUpperCase() + direction.slice(1)
      }_goalie${
        goalieDived.charAt(0).toUpperCase() + goalieDived.slice(1)
      }` as keyof typeof matrixCounts;
      matrixCounts[key].total += 1;
      if (outcome === 'Score') {
        matrixCounts[key].scored += 1;
      }
    }
  }

  function getPercentage({ total, scored }: { total: number; scored: number }) {
    if (total === 0) return 'N/A';
    const percent = Math.round((scored / total) * 100);
    return `${percent}% Goal`;
  }

  for (const player of scoreData) {
    for (const shot of player.shots) {
      totalShots++;
      const { direction, outcome } = shot;
      if (direction === 'left') leftShots++;
      else if (direction === 'right') rightShots++;

      const goalieDived =
        outcome === 'Saved'
          ? direction
          : direction === 'left'
          ? 'right'
          : 'left';
      const key = `kick${
        direction.charAt(0).toUpperCase() + direction.slice(1)
      }_goalie${
        goalieDived.charAt(0).toUpperCase() + goalieDived.slice(1)
      }` as keyof typeof scores;
      scores[key].push(outcome === 'Score' ? 1 : 0);
    }
  }

  const getAvg = (arr: number[]) =>
    arr.length
      ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
      : 'N/A';

  const rightPercent = totalShots
    ? Math.round((rightShots / totalShots) * 100)
    : 0;
  const leftPercent = totalShots ? 100 - rightPercent : 0;

  const remainingShots = 10 - totalShots;

  const currentUserName =
    useAppSelector((state) => state.playerData.player?.name) ||
    localStorage.getItem('username') ||
    'Player';

  return (
    <Card
      className="scroll box"
      style={{
        overflowY: 'auto',
        flexGrow: 1,
        margin: 8,
        marginLeft: 10,
        marginTop: 10,
        position: 'relative',
        padding: 16,
      }}
    >
      <Typography fontWeight="bold" sx={{ mb: 2 }}>
        Approach Summary
      </Typography>

      <div
        style={{
          backgroundImage: `url(${courtBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 250,
          height: 'auto',
          borderRadius: 5,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {totalShots % 10 === 0 && totalShots != 0 ? (
          <>
            <Card
              sx={{
                mt: 1,
                bgcolor: 'rgba(255,255,255,0.95)',
                padding: 2,
                border: '2px solid green',
              }}
            >
              <Typography align="center" fontWeight="bold" color="green">
                Here is your payoff matrix for the current round!
              </Typography>
            </Card>
            <table
              style={{
                margin: '0 auto',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderCollapse: 'collapse',
                width: '80%',
                fontFamily: 'Arial, sans-serif',
                fontSize: 16,
                boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                border: '2px solid #000',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      backgroundColor: '#f0f0f0',
                      textAlign: 'left',
                      fontWeight: 'bold',
                    }}
                  >
                    Player: {currentUserName}
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      backgroundColor: '#f0f0f0',
                      fontWeight: 'bold',
                    }}
                  >
                    Goalie Dives to
                    <br />
                    Kicker’s Left
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      backgroundColor: '#f0f0f0',
                      fontWeight: 'bold',
                    }}
                  >
                    Goalie Dives
                    <br />
                    Kicker’s Right
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      fontWeight: 'bold',
                    }}
                  >
                    Kick Left (L)
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      color:
                        matrixCounts.kickLeft_goalieLeft.total === 0
                          ? 'darkred'
                          : 'green',
                    }}
                  >
                    {getPercentage(matrixCounts.kickLeft_goalieLeft)}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      color:
                        matrixCounts.kickLeft_goalieRight.total === 0
                          ? 'darkred'
                          : 'green',
                    }}
                  >
                    {getPercentage(matrixCounts.kickLeft_goalieRight)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      fontWeight: 'bold',
                    }}
                  >
                    Kick Right (R)
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      color:
                        matrixCounts.kickRight_goalieLeft.total === 0
                          ? 'darkred'
                          : 'green',
                    }}
                  >
                    {getPercentage(matrixCounts.kickRight_goalieLeft)}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: '1px solid black',
                      color:
                        matrixCounts.kickRight_goalieRight.total === 0
                          ? 'darkred'
                          : matrixCounts.kickRight_goalieRight.scored /
                              matrixCounts.kickRight_goalieRight.total >
                            0.5
                          ? 'green'
                          : 'orange',
                    }}
                  >
                    {getPercentage(matrixCounts.kickRight_goalieRight)}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <>
            <Card sx={{ p: 2, mb: 1, bgcolor: 'rgba(255,255,255,0.9)' }}>
              <Typography align="center" fontWeight="bold">
                Total Shots Taken: {totalShots}
              </Typography>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    height: '48px',
                  }}
                >
                  <Typography align="center" fontWeight="bold">
                    {rightPercent}% Right
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <Typography align="center" fontWeight="bold">
                    Score(Kick→, Goalie←): {getAvg(scores.kickRight_goalieLeft)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <Typography align="center" fontWeight="bold">
                    Score(Kick→, Goalie→):{' '}
                    {getAvg(scores.kickRight_goalieRight)}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={4}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    height: '48px',
                  }}
                >
                  <Typography align="center" fontWeight="bold">
                    {leftPercent}% Left
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <Typography align="center" fontWeight="bold">
                    Score(Kick←, Goalie←): {getAvg(scores.kickLeft_goalieLeft)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <Typography align="center" fontWeight="bold">
                    Score(Kick←, Goalie→): {getAvg(scores.kickLeft_goalieRight)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </div>
    </Card>
  );
}

function SimulationSpace(props: {
  game: Game;
  controller: GameStateHandler;
  simulation?: string;
  style?: React.CSSProperties;
  userVotes: { name: string; direction: 'left' | 'right' }[];
  goalHistories: Record<string, ('Score' | 'Saved')[]>;
}) {
  useEffect(() => {
    props.userVotes.forEach((player, index) => {
      const containerId = `phaser-container-${player.name}`;

      const container = document.getElementById(containerId);
      if (!container) return;

      const instanceKey = `phaserInstance-${containerId}`;
      const existingInstance = (window as any)[instanceKey];
      if (existingInstance) {
        existingInstance.destroy(true);
        delete (window as any)[instanceKey];
      }

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
          goalHistory: props.goalHistories[player.name] ?? [],
        }),
      };

      (window as any)[instanceKey] = new Phaser.Game(config);
    });
  }, [props.userVotes]);

  return (
    <Card
      className="scroll box"
      style={{
        overflowY: 'auto',
        flexGrow: 1,
        margin: 10,
        borderRadius: 10,
        padding: 10,
        ...props.style,
      }}
    >
      <Typography fontWeight="bold" mb={1}>
        Simulation
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        {props.userVotes.map((player, index) => (
          <Grid
            key={player.name}
            item
            xs={12 / Math.min(2, props.userVotes.length)}
            style={{ height: '50%' }}
          >
            <div
              id={`phaser-container-${player.name}`}
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
    shots: { direction: 'left' | 'right'; outcome: 'Score' | 'Saved' }[];
    score: number;
    leftVotes: number;
    rightVotes: number;
    leftGoals: number;
    rightGoals: number;
  }[];
}) {
  const sorted = [...props.players].sort((a, b) => b.score - a.score);

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        flexGrow: 1,
        marginLeft: 5,
        marginRight: 5,
        ...props.style,
      }}
    >
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
          <Typography sx={{ flex: 3, fontWeight: 'bold', textAlign: 'center' }}>
            Left / Right Votes
          </Typography>
          <Typography sx={{ flex: 3, fontWeight: 'bold', textAlign: 'center' }}>
            Left / Right Goals
          </Typography>
          <Typography sx={{ flex: 1, fontWeight: 'bold', textAlign: 'right' }}>
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
              {player.leftVotes} / {player.rightVotes}
            </Typography>
            <Typography sx={{ flex: 3, textAlign: 'center' }}>
              {player.leftGoals} / {player.rightGoals}
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
  const isCritical = secondsLeft <= 3;

  return (
    <>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        color={isCritical ? 'error' : 'textPrimary'}
      >
        00 : {displaySeconds}
      </Typography>
      <Typography variant="body2" textAlign="center">
        MINUTES SECONDS
      </Typography>
    </>
  );
}

function GamePage(): JSX.Element {
  type PlayerState = {
    name: string;
    strategy: string;
    currentIndex: number;
    waiting: boolean;
  };

  const [playerStates, setPlayerStates] = useState<PlayerState[]>([]);

  const { room, simulation } = useAppSelector((state) => state.gameData);
  const { game, gameStateHandler, launchGame, responsePending, lastChatLog } =
    useWithGame();
  const navigate = useNavigate();

  const [leftVotes, setLeftVotes] = React.useState(0);
  const [rightVotes, setRightVotes] = React.useState(0);
  const [voteCount, setVoteCount] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(3);
  const [simulationEndedCount, setSimulationEndedCount] = React.useState(0);
  const [goalHistories, setGoalHistories] = React.useState<
    Record<string, ('Score' | 'Saved')[]>
  >({});

  const [userVotes, setUserVotes] = React.useState<
    { name: string; direction: 'left' | 'right' }[]
  >([]);

  const [showSimulation, setShowSimulation] = React.useState(false);

  const [scoreData, setScoreData] = React.useState<
    {
      name: string;
      shots: { direction: 'left' | 'right'; outcome: 'Score' | 'Saved' }[];
      score: number;
      leftVotes: number;
      rightVotes: number;
      leftGoals: number;
      rightGoals: number;
    }[]
  >([]);

  const [cumulativeShotData, setCumulativeShotData] = React.useState({
    totalShots: 0, // this will be 10 * number of players
    leftShots: 0,
    rightShots: 0,
  });

  const hasInitializedRef = React.useRef(false);

  const [userStrategyInput, setUserStrategyInput] = useState<
    string | undefined
  >(undefined);
  const [currentVoteIndex, setCurrentVoteIndex] = useState(0);

  const lastCheckedIdRef = useRef<string | null>(null); // to store the last checked message ID
  const lastPlayerMsgTimeRef = useRef<number | null>(null);

  // grab the whole chat log – adjust the selector if your slice name differs
  const [allUserInput, setAllUserInput] = useState<string>('');

  const handleEngagementDetection = async () => {
    const lastTime = lastPlayerMsgTimeRef.current;

    if (!lastTime) {
      alert('No player messages yet → Not engaged.');
      return;
    }

    const diffMs = Date.now() - lastTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
      .toString()
      .padStart(2, '0');

    if (diffMs >= 5 * 60 * 1000) {
      alert(`Not engaged. Last message was ${diffMins} m ${diffSecs}s ago.`);
    } else {
      alert(`Engaged. last message was ${diffMins} m ${diffSecs}s ago.`);
    }
  };

  const [profanityCount, setProfanityCount] = useState(0);

  const handleSwearDetection = async () => {
    if (!lastChatLog.length) {
      alert('No chat messages to analyze.');
      return;
    }
    const lastMsg = lastChatLog[lastChatLog.length - 1];

    // Check if the last message is new
    if (lastMsg.id !== lastCheckedIdRef.current) {
      // const isProfane = await checkProfanity(lastMsg.message);
      const isProfane = true;

      let newCount = profanityCount;
      if (isProfane) {
        newCount = profanityCount + 1;
        setProfanityCount(newCount);
      }

      lastCheckedIdRef.current = lastMsg.id;
      alert(`Profanity count: ${newCount}`);
      return;
    }
  };

  useEffect(() => {
    if (
      gameStateHandler?.players?.length &&
      !hasInitializedRef.current &&
      userStrategyInput
    ) {
      const initialScoreData = gameStateHandler.players.map((player) => ({
        name: player.name,
        shots: [],
        score: 0,
        leftVotes: 0,
        rightVotes: 0,
        leftGoals: 0,
        rightGoals: 0,
      }));

      const initialPlayerStates = gameStateHandler.players.map((p) => ({
        name: p.name,
        strategy: userStrategyInput,
        currentIndex: 0,
        waiting: false,
      }));
      setPlayerStates(initialPlayerStates);

      setCumulativeShotData({
        totalShots: gameStateHandler.players.length * 10,
        leftShots: 0,
        rightShots: 0,
      });

      hasInitializedRef.current = true;
    }
  }, [gameStateHandler, userStrategyInput]);

  const prevUserStrategyRef = React.useRef<string | undefined>(undefined);

  function cleanupSimulations() {
    gameStateHandler?.players?.forEach((player) => {
      const containerId = `phaser-container-${player.name}`;
      const instanceKey = `phaserInstance-${containerId}`;
      const existingInstance = (window as any)[instanceKey];
      if (existingInstance) {
        existingInstance.destroy(true);
        delete (window as any)[instanceKey];
      }
    });
  }

  useEffect(() => {
    const prev = prevUserStrategyRef.current;
    const curr = userStrategyInput;

    const isValidStrategy = curr && /^[LR]+$/.test(curr);

    // 只有从空到有效的 strategy 时才触发初始化
    if (!prev && isValidStrategy) {
      console.log('Detected new user strategy. Resetting for new simulation.');

      // 清除旧状态并准备新一轮
      hasInitializedRef.current = false;
      setPlayerStates([]);
      setCumulativeShotData({ totalShots: 0, leftShots: 0, rightShots: 0 });
      setCurrentVoteIndex(0);
      setSimulationEndedCount(0);
      cleanupSimulations();
      setUserVotes([]);
      setGoalHistories({});
      setLeftVotes(0);
      setRightVotes(0);
      setVoteCount(0);
      setShowSimulation(false);
      setSecondsLeft(3); // 重置计时器

      // 会触发上面另一个 useEffect 的初始化逻辑
    }

    prevUserStrategyRef.current = curr;
  }, [userStrategyInput]);

  useEffect(() => {
    const interval = setInterval(() => {
      const input = gameStateHandler?.globalStateData?.gameStateData?.find(
        (d) => d.key === 'User Strategy Input'
      )?.value;
      setUserStrategyInput(input);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStateHandler]);

  useEffect(() => {
    if (gameStateHandler?.players?.length && !hasInitializedRef.current) {
      const initialScoreData = gameStateHandler.players.map((player) => ({
        name: player.name,
        shots: [],
        score: 0,
        leftVotes: 0,
        rightVotes: 0,
        leftGoals: 0,
        rightGoals: 0,
      }));
      setScoreData(initialScoreData);

      setCumulativeShotData({
        totalShots: gameStateHandler.players.length * 10,
        leftShots: 0,
        rightShots: 0,
      });

      hasInitializedRef.current = true;
    }
  }, [gameStateHandler]);

  const handleSimulationEnded = (data: {
    player: string;
    kickLeft: number;
    kickRight: number;
    kickLeftMade: number;
    kickRightMade: number;
    totalPoints: number;
  }) => {
    if (!gameStateHandler) return;

    const direction = data.kickLeft ? 'left' : 'right';
    const outcome: 'Score' | 'Saved' = data.totalPoints > 0 ? 'Score' : 'Saved';
    const playerIndex = gameStateHandler.players.findIndex(
      (p) => p.name === currentUserName
    );

    setScoreData((prev) => {
      const updated = [...prev];
      if (updated[playerIndex]) {
        updated[playerIndex] = {
          ...updated[playerIndex],
          shots: [
            ...(updated[playerIndex].shots || []),
            { direction, outcome },
          ],
          score: updated[playerIndex].score + data.totalPoints,
          leftVotes:
            direction === 'left'
              ? updated[playerIndex].leftVotes + 1
              : updated[playerIndex].leftVotes,
          rightVotes:
            direction === 'right'
              ? updated[playerIndex].rightVotes + 1
              : updated[playerIndex].rightVotes,
          leftGoals: updated[playerIndex].leftGoals + (data.kickLeftMade ?? 0),
          rightGoals:
            updated[playerIndex].rightGoals + (data.kickRightMade ?? 0),
        };
      }
      return updated;
    });

    setGoalHistories((prev) => {
      const name = gameStateHandler.players[playerIndex]?.name;
      if (!name) return prev;

      const prevHistory = prev[name] || [];
      const updatedHistory = [...prevHistory, outcome].slice(-5);

      return {
        ...prev,
        [name]: updatedHistory,
      };
    });

    setCurrentVoteIndex((prev) => prev + 1);
    if (userStrategyInput && currentVoteIndex + 1 < userStrategyInput.length) {
      setSecondsLeft(3);
    }

    setSimulationEndedCount((prev) => prev + 1);
  };

  useEffect(() => {
    EventSystem.on('simulationEnded', handleSimulationEnded);
    return () => {
      EventSystem.off('simulationEnded', handleSimulationEnded);
    };
  }, [handleSimulationEnded]);

  useEffect(() => {
    if (voteCount > 0 && simulationEndedCount === voteCount) {
      const delayBeforeNextRound = 10000;

      setTimeout(() => {
        // Reset everything for next round
        setUserStrategyInput(undefined);
        setLeftVotes(0);
        setRightVotes(0);
        setVoteCount(0);
        setSecondsLeft(3);
        setShowSimulation(false);
        setUserVotes([]);
        setSimulationEndedCount(0);
      }, delayBeforeNextRound);
    }
  }, [simulationEndedCount, voteCount]);

  // countdown timer
  useEffect(() => {
    if (
      secondsLeft <= 0 ||
      !userStrategyInput ||
      currentVoteIndex >= userStrategyInput.length
    ) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, userStrategyInput, currentVoteIndex]);

  useEffect(() => {
    if (userStrategyInput && secondsLeft === 0 && currentVoteIndex === 0) {
      setSecondsLeft(3);
    }
  }, [userStrategyInput]);

  React.useEffect(() => {
    if (
      secondsLeft === 0 &&
      userStrategyInput &&
      currentVoteIndex < userStrategyInput.length
    ) {
      setShowSimulation(true);
      triggerNextSimulations();
    }
  }, [secondsLeft, userStrategyInput, currentVoteIndex]);

  const handleVote = () => {
    if (!userStrategyInput || currentVoteIndex >= userStrategyInput.length)
      return;

    const rawDirection = userStrategyInput[currentVoteIndex];
    const direction = rawDirection === 'L' ? 'left' : 'right';

    const mockUserNames = ['Logan', 'Charlie', 'Brian', 'Adam'];
    const userName = mockUserNames[voteCount]; // assign unique name per vote

    const newVote: { name: string; direction: 'left' | 'right' } = {
      name: userName,
      direction,
    };

    setUserVotes((prev) => [...prev, newVote]);

    if (direction === 'left') {
      setLeftVotes((prev) => prev + 1);
      setCumulativeShotData((prev) => ({
        ...prev,
        leftShots: prev.leftShots + 1,
      }));
    } else {
      setRightVotes((prev) => prev + 1);
      setCumulativeShotData((prev) => ({
        ...prev,
        rightShots: prev.rightShots + 1,
      }));
    }

    setVoteCount((prev) => prev + 1);
    setCurrentVoteIndex((prev) => prev + 1); // move to next input
  };

  const triggerNextSimulations = () => {
    setPlayerStates((prevStates) =>
      prevStates.map((player) => {
        if (player.waiting || player.currentIndex >= player.strategy.length)
          return player;

        const direction: 'left' | 'right' =
          player.strategy[player.currentIndex] === 'L' ? 'left' : 'right';

        const newVote = { name: player.name, direction };
        setUserVotes((prev) => [...prev, newVote]);

        if (direction === 'left') {
          setLeftVotes((v) => v + 1);
          setCumulativeShotData((prev) => ({
            ...prev,
            leftShots: prev.leftShots + 1,
          }));
        } else {
          setRightVotes((v) => v + 1);
          setCumulativeShotData((prev) => ({
            ...prev,
            rightShots: prev.rightShots + 1,
          }));
        }

        // Set cooldown for this player
        setTimeout(() => {
          setPlayerStates((players) =>
            players.map((p) =>
              p.name === player.name ? { ...p, waiting: false } : p
            )
          );
          triggerNextSimulations(); // try again after cooldown
        }, 2000);

        return {
          ...player,
          currentIndex: player.currentIndex + 1,
          waiting: true,
        };
      })
    );
  };

  const currentUserName =
    useAppSelector((state) => state.playerData.player?.name) ||
    localStorage.getItem('username') ||
    'Player';

  useEffect(() => {
    if (
      secondsLeft === 0 &&
      userStrategyInput &&
      currentVoteIndex < userStrategyInput.length
    ) {
      const direction =
        userStrategyInput[currentVoteIndex] === 'L' ? 'left' : 'right';
      setUserVotes([{ name: currentUserName, direction }]);
    }
  }, [
    secondsLeft,
    userStrategyInput,
    currentVoteIndex,
    gameStateHandler,
    currentUserName,
  ]);

  useEffect(() => {
    if (!lastChatLog?.length) return;

    const lastMsg = lastChatLog[lastChatLog.length - 1];
    if (lastMsg.sender === 'PLAYER') {
      lastPlayerMsgTimeRef.current = Date.now();
    }
  }, [lastChatLog]);

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

            <Card
              sx={{
                p: 2,
                mr: 1.2,
                ml: 1.2,
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.95)',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography fontWeight="bold">
                    User Strategy Input:
                  </Typography>
                  <Typography>
                    {userStrategyInput || 'No input provided yet.'}
                  </Typography>
                </Box>

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    onClick={handleEngagementDetection}
                  >
                    ENGAGEMENT DETECT
                  </Button>
                  <Button variant="outlined" onClick={handleSwearDetection}>
                    SWEAR DETECT
                  </Button>
                </Box>
              </Box>
            </Card>

            <div style={{ flex: 'none', marginLeft: 10, marginRight: 42 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  width: '100%',
                }}
              >
                <Typography fontWeight="bold" sx={{ mb: 1 }}>
                  Countdown
                </Typography>
                <Timer secondsLeft={secondsLeft} />
                {/* <DirectionControls
                  leftVotes={leftVotes}
                  rightVotes={rightVotes}
                  onVote={handleVote}
                  disabled={secondsLeft <= 0 || voteCount >= 4}
                /> */}
              </Card>
            </div>

            <SolutionSpace
              game={game}
              controller={gameStateHandler}
              scoreData={scoreData}
            />
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
                goalHistories={goalHistories}
              />
            ) : (
              <Card sx={{ flex: 1, m: 1.2, p: 2 }}>
                Waiting for simulation...
              </Card>
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
