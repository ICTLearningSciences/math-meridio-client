/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { GameStateHandler } from '../../classes/game-state-handler';
import { BasketballSimulationData } from './SimulationScene';
import EventSystem from '../event-system';
import {
  INSIDE_SHOT_POINTS_VALUE,
  MID_SHOT_POINTS_VALUE,
  OUTSIDE_SHOT_POINTS_VALUE,
} from './solution';

export function ResultComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const [simulationData, setSimulationData] = React.useState<
    Record<string, BasketballSimulationData>
  >({});
  const [results, setResults] = React.useState<any[]>([]);

  React.useEffect(() => {
    EventSystem.on('simulationEnded', simulationEnded);
  }, []);

  function simulationEnded(data: BasketballSimulationData): void {
    simulationData[data.player] = data;
    setSimulationData({ ...simulationData });
    setResults([
      {
        data: controller.players.map(
          (p) => simulationData[p.clientId]?.outsideShotsMade || 0
        ),
        stack: 'A',
        label: 'Outside shots succeeded',
        color: '#2e95ff',
      },
      {
        data: controller.players.map(
          (p) =>
            (simulationData[p.clientId]?.outsideShots || 0) -
            (simulationData[p.clientId]?.outsideShotsMade || 0)
        ),
        stack: 'A',
        label: 'Outside shots failed',
        color: '#1c5999',
      },
      {
        data: controller.players.map(
          (p) => simulationData[p.clientId]?.midShotsMade || 0
        ),
        stack: 'B',
        label: 'Mid shots succeeded',
        color: '#b800d8',
      },
      {
        data: controller.players.map(
          (p) =>
            (simulationData[p.clientId]?.midShots || 0) -
            (simulationData[p.clientId]?.midShotsMade || 0)
        ),
        stack: 'B',
        label: 'Mid shots failed',
        color: '#60039b',
      },
      {
        data: controller.players.map(
          (p) => simulationData[p.clientId]?.insideShotsMade || 0
        ),
        stack: 'C',
        label: 'Inside shots succeeded',
        color: '#02b2af',
      },
      {
        data: controller.players.map(
          (p) =>
            (simulationData[p.clientId]?.insideShots || 0) -
            (simulationData[p.clientId]?.insideShotsMade || 0)
        ),
        stack: 'C',
        label: 'Inside shots failed',
        color: '#015958',
      },
      {
        data: controller.players.map(
          (p) =>
            (simulationData[p.clientId]?.outsideShotsMade || 0) *
            OUTSIDE_SHOT_POINTS_VALUE
        ),
        stack: 'D',
        label: 'Outside points',
        color: '#2e95ff',
      },
      {
        data: controller.players.map(
          (p) =>
            (simulationData[p.clientId]?.midShotsMade || 0) *
            MID_SHOT_POINTS_VALUE
        ),
        stack: 'D',
        label: 'Mid points',
        color: '#b800d8',
      },
      {
        data: controller.players.map(
          (p) =>
            (simulationData[p.clientId]?.insideShotsMade || 0) *
            INSIDE_SHOT_POINTS_VALUE
        ),
        stack: 'D',
        label: 'Inside points',
        color: '#02b2af',
      },
    ]);
  }

  return (
    <div>
      <BarChart
        xAxis={[
          { scaleType: 'band', data: controller.players.map((p) => p.name) },
        ]}
        series={results}
        slotProps={{ legend: { hidden: true } }}
        width={window.innerWidth / 2 - 350}
        height={window.innerHeight / 2 - 150}
      />
    </div>
  );
}
