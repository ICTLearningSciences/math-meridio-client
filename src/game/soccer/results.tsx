import React, { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { GameStateHandler } from '../../classes/game-state-handler';
import EventSystem from '../event-system';
import { Stack, Typography } from '@mui/material';

interface SoccerSimulationData {
  player: string;
  kickLeft: number;
  kickRight: number;
  kickLeftMade: number;
  kickRightMade: number;
  totalPoints: number;
}

const KICK_LEFT_POINTS_VALUE = 2;
const KICK_RIGHT_POINTS_VALUE = 3;

export function ResultComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const [simulationData, setSimulationData] = useState<Record<string, SoccerSimulationData>>({});
  const chartHeight = 300;
  const resultsWidth = 900;
  const scoreChartWidth = resultsWidth / 2;
  const shotsChartWidth = resultsWidth / controller.players.length;

  const [playerChartData, setPlayerChartData] = useState(
    controller.players.map(() => ({ made: [0, 0], missed: [0, 0] }))
  );

  const [kickLeftScores, setKickLeftScores] = useState<number[]>([]);
  const [kickRightScores, setKickRightScores] = useState<number[]>([]);
  const [playerLabels, setPlayerLabels] = useState<string[]>([]);

  const scoreLabels = ['Kick Left', 'Kick Right'];

  useEffect(() => {
    EventSystem.on('simulationEnded', simulationEnded);
  }, []);

  function simulationEnded(data: SoccerSimulationData): void {
    simulationData[data.player] = data;
    setSimulationData({ ...simulationData });

    const updatedChartData = [...playerChartData];

    controller.players.forEach((player, index) => {
      const sim = simulationData[player.clientId];
      if (sim) {
        const made = [sim.kickLeftMade, sim.kickRightMade];
        const missed = [sim.kickLeft - sim.kickLeftMade, sim.kickRight - sim.kickRightMade];
        updatedChartData[index] = { made, missed };
      }
    });

    setPlayerChartData(updatedChartData);

    setKickLeftScores(
      controller.players.map(
        (player) => (simulationData[player.clientId]?.kickLeftMade || 0) * KICK_LEFT_POINTS_VALUE
      )
    );

    setKickRightScores(
      controller.players.map(
        (player) => (simulationData[player.clientId]?.kickRightMade || 0) * KICK_RIGHT_POINTS_VALUE
      )
    );

    setPlayerLabels(controller.players.map((p) => p.name));
  }

  function GetShotChart(playerIndex: number, playerName: string) {
    const playerData = playerChartData[playerIndex]?.made || [0, 0];
    const playerMissedData = playerChartData[playerIndex]?.missed || [0, 0];

    return (
      <Stack key={playerIndex} direction="column" alignItems="center">
        <BarChart
          width={shotsChartWidth}
          height={chartHeight}
          series={[
            { data: playerData, label: 'made', stack: 'shots' },
            { data: playerMissedData, label: 'missed', stack: 'shots' },
          ]}
          slotProps={{ legend: { hidden: true } }}
          xAxis={[{ data: scoreLabels, scaleType: 'band' }]}
          yAxis={[{ disableLine: true, disableTicks: true, tickFontSize: 0 }]}
        />
        <Typography variant="subtitle1">{playerName}</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ width: resultsWidth }} direction="column" alignItems="center">
      <Stack direction="column" alignItems="center">
        <Typography variant="h6">Score</Typography>
        <BarChart
          width={scoreChartWidth}
          barLabel="value"
          height={chartHeight}
          series={[
            {
              data: kickLeftScores,
              label: 'Kick Left',
              stack: 'mademissedshots',
              color: '#e15759',
            },
            {
              data: kickRightScores,
              label: 'Kick Right',
              stack: 'mademissedshots',
              color: '#ff9da7',
            },
          ]}
          xAxis={[{ data: playerLabels, scaleType: 'band' }]}
        />
      </Stack>
      <Typography variant="h6">Shots</Typography>
      <Stack direction="row" alignItems="center">
        {controller.players.map((player, index) => GetShotChart(index, player.name))}
      </Stack>
    </Stack>
  );
}