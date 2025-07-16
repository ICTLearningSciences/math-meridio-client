/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { GameStateHandler } from '../../classes/game-state-handler';
import { BasketballSimulationData } from './SimulationScene';
import EventSystem from '../event-system';
import {
  INSIDE_SHOT_POINTS_VALUE,
  MID_SHOT_POINTS_VALUE,
  OUTSIDE_SHOT_POINTS_VALUE,
} from './solution';
import { Stack, Typography, Tabs, Tab, Box } from '@mui/material';

export function ResultComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const [simulationData, setSimulationData] = React.useState<
    Record<string, BasketballSimulationData>
  >({});
  React.useEffect(() => {
    EventSystem.on('simulationEnded', simulationEnded);
  }, []);
  const chartHeight = 300;
  const resultsWidth = window.innerWidth / 2 - 300;
  const scoreChartWidth = resultsWidth / 2;
  const shotsChartWidth = resultsWidth / controller.players.length;

  interface ChartData {
    insideScores: number[];
    midScores: number[];
    outsideScores: number[];

    player1Data: number[];
    player1MissedData: number[];

    player2Data: number[];
    player2MissedData: number[];

    player3Data: number[];
    player3MissedData: number[];

    player4Data: number[];
    player4MissedData: number[];

    playerLabels: string[];
  }

  const [myChartData, setMyChartData] = useState<ChartData>({
    insideScores: [],
    midScores: [],
    outsideScores: [],
    player1Data: [],
    player1MissedData: [],
    player2Data: [],
    player2MissedData: [],
    player3Data: [],
    player3MissedData: [],
    player4Data: [],
    player4MissedData: [],
    playerLabels: [],
  });

  const scoreLabels = ['In', 'Mid', '3pt'];

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  function simulationEnded(data: BasketballSimulationData): void {
    simulationData[data.player] = data;
    setSimulationData({ ...simulationData });
    let insideScores: number[] = [];
    let midScores: number[] = [];
    let outsideScores: number[] = [];

    let player1Data: number[] = [];
    let player1MissedData: number[] = [];

    let player2Data: number[] = [];
    let player2MissedData: number[] = [];

    let player3Data: number[] = [];
    let player3MissedData: number[] = [];

    let player4Data: number[] = [];
    let player4MissedData: number[] = [];

    let playerLabels: string[] = [];

    for (let index = 0; index < controller.players.length; index++) {
      const player = controller.players[index];
      const playerMade = [
        simulationData[player.clientId]?.insideShotsMade,
        simulationData[player.clientId]?.midShotsMade,
        simulationData[player.clientId]?.outsideShotsMade,
      ];
      const playerMissed = [
        simulationData[player.clientId]?.insideShots -
          simulationData[player.clientId]?.insideShotsMade,
        simulationData[player.clientId]?.midShots -
          simulationData[player.clientId]?.midShotsMade,
        simulationData[player.clientId]?.outsideShots -
          simulationData[player.clientId]?.outsideShotsMade,
      ];

      switch (index) {
        case 0:
          player1Data = playerMade;
          player1MissedData = playerMissed;
          break;
        case 1:
          player2Data = playerMade;
          player2MissedData = playerMissed;
          break;
        case 2:
          player3Data = playerMade;
          player3MissedData = playerMissed;
          break;
        case 3:
          player4Data = playerMade;
          player4MissedData = playerMissed;
          break;
      }
    }
    insideScores = controller.players.map(
      (player) =>
        (simulationData[player.clientId]?.insideShotsMade || 0) *
        INSIDE_SHOT_POINTS_VALUE
    );

    midScores = controller.players.map(
      (player) =>
        (simulationData[player.clientId]?.midShotsMade || 0) *
        MID_SHOT_POINTS_VALUE
    );

    outsideScores = controller.players.map(
      (player) =>
        (simulationData[player.clientId]?.outsideShotsMade || 0) *
        OUTSIDE_SHOT_POINTS_VALUE
    );
    playerLabels = controller.players.map((player) => player.name);
    setMyChartData({
      insideScores: insideScores,
      midScores: midScores,
      outsideScores: outsideScores,
      player1Data: player1Data,
      player1MissedData: player1MissedData,
      player2Data: player2Data,
      player2MissedData: player2MissedData,
      player3Data: player3Data,
      player3MissedData: player3MissedData,
      player4Data: player4Data,
      player4MissedData: player4MissedData,
      playerLabels: playerLabels,
    });
  }
  function GetShotChartFor(
    playerData: number[],
    playerMissedData: number[],
    playerName: string,
    bHideLegend: boolean,
    index: number
  ) {
    return (
      <Stack key={index} direction="column" alignItems="center">
        <BarChart
          width={shotsChartWidth}
          height={chartHeight}
          series={[
            { data: playerData, label: 'made', stack: 'shots' },
            {
              data: playerMissedData,
              label: 'missed',
              stack: 'shots',
            },
          ]}
          slotProps={{ legend: { hidden: bHideLegend } }}
          xAxis={[{ data: scoreLabels, scaleType: 'band' }]}
          yAxis={[{ disableLine: true, disableTicks: true, tickFontSize: 0 }]}
        />
        <Typography variant="subtitle1">{playerName}</Typography>
      </Stack>
    );
  }
  return (
    <Stack
      sx={{ width: resultsWidth }}
      direction="column"
      alignItems="center"
      width={resultsWidth}
    >
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Score" />
        <Tab label="Shots" />
      </Tabs>
      <Box sx={{ width: '100%', mt: 2 }}>
        {tabValue === 0 && (
          <Stack direction="column" alignItems="center">
            <BarChart
              width={scoreChartWidth}
              barLabel="value"
              height={chartHeight}
              series={[
                {
                  data: myChartData.insideScores,
                  label: 'In',
                  stack: 'mademissedshots',
                  color: '#e15759',
                },
                {
                  data: myChartData.midScores,
                  label: 'Mid',
                  stack: 'mademissedshots',
                  color: '#ff9da7',
                },
                {
                  data: myChartData.outsideScores,
                  label: '3pt',
                  stack: 'mademissedshots',
                  color: '#af7aa1',
                },
              ]}
              xAxis={[{ data: myChartData.playerLabels, scaleType: 'band' }]}
            />
          </Stack>
        )}
        {tabValue === 1 && (
          <Stack direction="row" alignItems="center">
            {controller.players.map((player, index) => (
              <>
                {index === 0 &&
                  GetShotChartFor(
                    myChartData.player1Data,
                    myChartData.player1MissedData,
                    player.name,
                    true,
                    index
                  )}
                {index === 1 &&
                  GetShotChartFor(
                    myChartData.player2Data,
                    myChartData.player2MissedData,
                    player.name,
                    true,
                    index
                  )}
                {index === 2 &&
                  GetShotChartFor(
                    myChartData.player3Data,
                    myChartData.player3MissedData,
                    player.name,
                    true,
                    index
                  )}
                {index === 3 &&
                  GetShotChartFor(
                    myChartData.player4Data,
                    myChartData.player4MissedData,
                    player.name,
                    true,
                    index
                  )}
              </>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
