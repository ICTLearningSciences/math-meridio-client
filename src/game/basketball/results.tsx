/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { GameStateHandler } from '../../classes/game-state-handler';
import { OverlayBox } from '../../components/overlay-box';
import { BasketballSimulationData } from './SimulationScene';
import EventSystem from '../event-system';

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

  function simulationEnded(data: BasketballSimulationData): void {
    simulationData[data.player] = data;
    setSimulationData({ ...simulationData });
  }

  // todo
  return (
    <div>
      {Object.keys(simulationData).length === 0 ? (
        <OverlayBox message="Complete simulation first to see results" />
      ) : (
        <BarChart
          xAxis={[
            { scaleType: 'band', data: controller.players.map((p) => p.name) },
          ]}
          series={[
            {
              data: [10],
              stack: 'A',
              label: 'Outside shots succeeded',
              color: '#2e95ff',
            },
            {
              data: [5],
              stack: 'A',
              label: 'Outside shots failed',
              color: '#1c5999',
            },
            {
              data: [20],
              stack: 'B',
              label: 'Mid shots succeeded',
              color: '#b800d8',
            },
            {
              data: [2],
              stack: 'B',
              label: 'Mid shots failed',
              color: '#60039b',
            },
            {
              data: [10],
              stack: 'C',
              label: 'Inside shots succeeded',
              color: '#02b2af',
            },
            {
              data: [10],
              stack: 'C',
              label: 'Inside shots failed',
              color: '#015958',
            },
            { data: [50], stack: 'D', label: 'Total points', color: 'orange' },
          ]}
          // series={controller.players.map((p) => {
          //   const s = simulationData[p.clientId];
          //   if (s) {
          //     return {
          //       data: [
          //         s.insideShots,
          //         s.insideShotsMade,
          //         s.midShots,
          //         s.midShotsMade,
          //         s.outsideShots,
          //         s.outsideShotsMade,
          //         s.totalPoints,
          //       ],
          //     };
          //   } else {
          //     return { data: [] };
          //   }
          // })}
          width={window.innerWidth / 2 - 200}
          height={500}
        />
      )}
    </div>
  );
}
