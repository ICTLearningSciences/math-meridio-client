/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { GameStateHandler } from '../../classes/game-state-handler';
import { BasketballSimulationData } from './SimulationScene';
import EventSystem from '../event-system';
import {
  INSIDE_SHOT_POINTS_VALUE,
  MID_SHOT_POINTS_VALUE,
  OUTSIDE_SHOT_POINTS_VALUE,
} from './solution';
import { Stack, Typography } from '@mui/material';
import { JsxElement } from 'typescript';

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
  const resultsWidth = 900;
  const scoreChartWidth = resultsWidth / 2;
  const shotsChartWidth = resultsWidth / controller.players.length;

  const [insideScores, setInsideScores] = useState<number[]>([]);
  const [midScores, setMidScores] = useState<number[]>([]);
  const [outsideScores, setOutsideScores] = useState<number[]>([]);

  const [player1Data, setPlayer1Data] = useState<number[]>([]);
  const [player2Data, setPlayer2Data] = useState<number[]>([]);
  const [player3Data, setPlayer3Data] = useState<number[]>([]);
  const [player4Data, setPlayer4Data] = useState<number[]>([]);

  const [player1MissedData, setPlayer1MissedData] = useState<number[]>([]);
  const [player2MissedData, setPlayer2MissedData] = useState<number[]>([]);
  const [player3MissedData, setPlayer3MissedData] = useState<number[]>([]);
  const [player4MissedData, setPlayer4MissedData] = useState<number[]>([]);

  const scoreLabels = ['In', 'Mid', '3pt'];
  const [playerLabels, setPlayerLabels] = useState<string[]>([]);

  function simulationEnded(data: BasketballSimulationData): void {
    simulationData[data.player] = data;
    setSimulationData({ ...simulationData });
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
          setPlayer1Data(playerMade);
          setPlayer1MissedData(playerMissed);
          break;
        case 1:
          setPlayer2Data(playerMade);
          setPlayer2MissedData(playerMissed);
          break;
        case 2:
          setPlayer3Data(playerMade);
          setPlayer3MissedData(playerMissed);
          break;
        case 3:
          setPlayer4Data(playerMade);
          setPlayer4MissedData(playerMissed);
          break;
      }
    }

    setInsideScores(
      controller.players.map(
        (player) =>
          (simulationData[player.clientId]?.insideShotsMade || 0) *
          INSIDE_SHOT_POINTS_VALUE
      )
    );

    setMidScores(
      controller.players.map(
        (player) =>
          (simulationData[player.clientId]?.midShotsMade || 0) *
          MID_SHOT_POINTS_VALUE
      )
    );

    setOutsideScores(
      controller.players.map(
        (player) =>
          (simulationData[player.clientId]?.outsideShotsMade || 0) *
          OUTSIDE_SHOT_POINTS_VALUE
      )
    );

    setPlayerLabels(controller.players.map((player) => player.name));
  }

  function GetShotChartFor(
    playerData: number[],
    playerMissedData: number[],
    playerName: string,
    bHideLegend: boolean
  ) {
    return (
      <Stack direction="column" alignItems="center">
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
    <Stack sx={{ width: resultsWidth }} direction="column" alignItems="center">
      <Stack direction="column" alignItems="center">
        <Typography variant="h6">Score</Typography>
        <BarChart
          width={scoreChartWidth}
          barLabel="value"
          height={chartHeight}
          series={[
            {
              data: insideScores,
              label: 'In',
              stack: 'mademissedshots',
              color: '#e15759',
            },
            {
              data: midScores,
              label: 'Mid',
              stack: 'mademissedshots',
              color: '#ff9da7',
            },
            {
              data: outsideScores,
              label: '3pt',
              stack: 'mademissedshots',
              color: '#af7aa1',
            },
          ]}
          xAxis={[{ data: playerLabels, scaleType: 'band' }]}
        />
      </Stack>
      <Typography variant="h6">Shots</Typography>

      <Stack direction="row" alignItems="center">
        {controller.players.map((player, index) => (
          <>
            {index === 0 &&
              GetShotChartFor(
                player1Data,
                player1MissedData,
                player.name,
                true
              )}
            {index === 1 &&
              GetShotChartFor(
                player2Data,
                player2MissedData,
                player.name,
                true
              )}
            {index === 2 &&
              GetShotChartFor(
                player3Data,
                player3MissedData,
                player.name,
                true
              )}
            {index === 3 &&
              GetShotChartFor(
                player4Data,
                player4MissedData,
                player.name,
                true
              )}
          </>
        ))}
      </Stack>
    </Stack>
  );
}
