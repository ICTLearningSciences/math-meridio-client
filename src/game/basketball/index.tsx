/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Button, Typography } from '@mui/material';

import {
  GameStateHandler,
  GameStateHandlerArgs,
} from '../../classes/game-state-handler';
import { Game } from '../types';
import { SolutionSpace } from './SolutionSpace';
import { SimulationSpace } from './SimulationSpace';
import { useWithPhaserGame } from '../../hooks/use-with-phaser-game';

import shotChart from './shot-chart.png';
import { OverlayBox } from '../../components/overlay-box';
import { QuestionMark } from '@mui/icons-material';
import { GameStateData } from '../../store/slices/game';

export class BasketballStateHandler extends GameStateHandler {
  // todo
  constructor(args: GameStateHandlerArgs) {
    super({ ...args, defaultStageId: 'de0b94b9-1fc2-4ea1-995e-21a75670c16d' });
  }

  async handleNewUserMessage(message: string) {
    super.handleNewUserMessage(message);
    // todo (not hard-coded)
    const msg = message.toLowerCase();
    if (msg.includes('outside shot')) {
      const value = msg.includes('3') || msg.includes('three') ? 3 : undefined;
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per outside shot', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per outside shot', value: value }],
          },
        ],
      });
    }
    if (msg.includes('inside shot')) {
      const value = msg.includes('2') || msg.includes('two') ? 2 : undefined;
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per inside shot', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per inside shot', value: value }],
          },
        ],
      });
    }
    if (msg.includes('mid shot')) {
      const value = msg.includes('2') || msg.includes('two') ? 2 : undefined;
      this.updateRoomGameData({
        globalStateData: {
          ...this.globalStateData,
          gameStateData: [{ key: 'Points per mid shot', value: value }],
        },
        playerStateData: [
          {
            player: this.player.clientId,
            animation: '',
            gameStateData: [{ key: 'Points per mid shot', value: value }],
          },
        ],
      });
    }
  }
}

function ProblemComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  return (
    <div>
      <Typography>{BasketballGame.problem}</Typography>
      <img style={{ width: '100%', height: 200 }} src={shotChart}></img>
    </div>
  );
}

function SolutionComponent(props: {
  controller: GameStateHandler;
}): JSX.Element {
  const { controller } = props;
  const players = controller.players;
  const gameStateData = controller.globalStateData.gameStateData;
  const playerStateData = controller.playerStateData;

  function Variable(props: {
    dKey: string;
    data: GameStateData[];
    color?: string;
  }): JSX.Element {
    const data = props.data.find((d) => d.key === props.dKey);
    return (
      <div
        className="column center-div"
        style={{
          marginLeft: 5,
          marginRight: 5,
          marginBottom: 10,
          padding: 10,
          // backgroundColor: "#d9d9d9",
          width: 'auto',
          display: data ? '' : 'none',
        }}
      >
        <Typography fontSize={14}>{data?.key}</Typography>
        <div
          className="center-div column"
          style={{
            padding: 20,
            backgroundColor: props.color || 'white',
            borderRadius: 10,
            height: 'auto',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: 'black',
          }}
        >
          {data?.value ? (
            <Typography style={{ color: 'white' }}>{data.value}</Typography>
          ) : (
            <QuestionMark style={{ color: 'white' }} />
          )}
        </div>
      </div>
    );
  }

  function Connection(props: {
    key: string;
    data: GameStateData[];
  }): JSX.Element {
    const data = props.data.find(
      (d) =>
        `${d.key}`.toLowerCase().replace(' ', '') ===
        `${props.key}`.toLowerCase().replace(' ', '')
    );
    return (
      <div
        style={{
          marginLeft: 5,
          marginRight: 5,
          marginBottom: 10,
          padding: 20,
          backgroundColor: '#b8e1a9',
          width: 'auto',
          display: data ? '' : 'none',
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: 'black',
        }}
      >
        {data?.value ? <Typography>{data.value}</Typography> : <QuestionMark />}
      </div>
    );
  }

  return (
    <div>
      <Typography textAlign="center">Global Variables</Typography>
      <div className="row center-div">
        <Variable
          dKey="Points per inside shot"
          data={gameStateData}
          color="#ff00ff"
        />
        <Variable
          dKey="Points per mid shot"
          data={gameStateData}
          color="#03517c"
        />
        <Variable
          dKey="Points per outside shot"
          data={gameStateData}
          color="#03517c"
        />
      </div>
      {playerStateData.map((psd) => {
        const playerName = players.find((p) => p.clientId === psd.player)?.name;
        return (
          <div key={psd.player} className="row center-div">
            <div
              className="column center-div"
              style={{
                flexGrow: 1,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'black',
              }}
            >
              <div className="row center-div">
                <Variable
                  dKey="Points per inside shot"
                  data={psd.gameStateData}
                  color="#ff00ff"
                />
                <Connection key="inside_connection" data={psd.gameStateData} />
                <Variable
                  dKey="% of inside shot attempts"
                  data={psd.gameStateData}
                  color="#03517c"
                />
              </div>
              <div className="row center-div">
                <Variable
                  dKey="Points per mid shot"
                  data={psd.gameStateData}
                  color="#ff00ff"
                />
                <Connection key="mid_connection" data={psd.gameStateData} />
                <Variable
                  dKey="% of mid shot attempts"
                  data={psd.gameStateData}
                  color="#03517c"
                />
              </div>
              <div className="row center-div">
                <Variable
                  dKey="Points per outside shot"
                  data={psd.gameStateData}
                  color="#ff00ff"
                />
                <Connection key="outside_connection" data={psd.gameStateData} />
                <Variable
                  dKey="% of outside shot attempts"
                  data={psd.gameStateData}
                  color="#03517c"
                />
              </div>
            </div>
            <div
              style={{
                width: 50,
                height: 50,
                fontSize: 12,
                padding: 10,
                backgroundColor: '#cfd8dc',
                borderRadius: 10,
                marginLeft: 5,
              }}
            >
              This is {playerName}&apos;s strategy
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SimulationComponent(props: {
  controller: GameStateHandler;
  simulation?: string;
}): JSX.Element {
  // todo
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { phaserGame, startPhaserGame } = useWithPhaserGame(gameContainerRef);

  React.useEffect(() => {
    if (props.simulation) {
      startPhaserGame(
        props.controller.game,
        props.controller,
        'SimulationSpace'
      );
    }
  }, [props.controller, props.simulation]);

  return (
    <div>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: 'black',
        }}
      />
      {!phaserGame && (
        <OverlayBox message="Select a strategy first to see simulation" />
      )}
    </div>
  );
}

function ResultComponent(props: { controller: GameStateHandler }): JSX.Element {
  // todo
  return (
    <div>
      <OverlayBox message="Complete first to see results" />
    </div>
  );
}

const BasketballGame: Game = {
  id: 'basketball',
  name: 'NBA Analyst',
  problem: `We need you and the analyst team to figure out why we're losing and what we need to change in our strategy to be winners! From what you're seeing right now, what do you think we're doing wrong?`,
  config: {
    scene: [SolutionSpace, SimulationSpace],
  },
  showProblem: (controller: GameStateHandler) => {
    return <ProblemComponent controller={controller} />;
  },
  showSolution: (controller: GameStateHandler) => {
    return <SolutionComponent controller={controller} />;
  },
  showSimulation: (controller: GameStateHandler, simulation?: string) => {
    return (
      <SimulationComponent controller={controller} simulation={simulation} />
    );
  },
  showResult: (controller: GameStateHandler) => {
    return <ResultComponent controller={controller} />;
  },
  createController: (args: GameStateHandlerArgs) =>
    new BasketballStateHandler(args),
};

export default BasketballGame;
