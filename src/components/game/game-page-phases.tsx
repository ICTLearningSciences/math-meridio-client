/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from 'react';
import Carousel from 'react-multi-carousel';
import { TransformWrapper } from 'react-zoom-pan-pinch';
import {
  Card,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FullscreenExit,
  Fullscreen,
  VolumeOff,
  VolumeUp,
} from '@mui/icons-material';

import { Game } from '../../game/types';
import { useWithWindow } from '../../hooks/use-with-window';
import { GameStateData, Room } from '../../store/slices/game/types';
import { Player } from '../../store/slices/player/types';
import { useWithConfig } from '../../store/slices/config/use-with-config';

import 'react-multi-carousel/lib/styles.css';
import { useWithPlayer } from '../../store/slices/player/use-with-player-state';

function MyCarousel(props: {
  children: React.ReactNode;
  phase: number;
}): JSX.Element {
  const ref = React.useRef<Carousel | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.goToSlide(0, true);
  }, [props.phase]);

  return (
    <Carousel
      ref={ref}
      showDots
      autoPlay={false}
      infinite={false}
      responsive={{
        desktop: {
          breakpoint: { max: 4000, min: 3000 },
          items: 2,
        },
        mobile: {
          breakpoint: { max: 3000, min: 0 },
          items: 1,
        },
      }}
    >
      {props.children}
    </Carousel>
  );
}

function Space(props: {
  title: string;
  height?: number;
  header?: React.ReactNode;
  expanded?: boolean;
  onExpand?: () => void;
  children: React.ReactNode;
}): JSX.Element {
  const { windowHeight } = useWithWindow();
  return (
    <Card
      style={{
        borderRadius: 20,
        padding: 20,
        height: props.height || windowHeight - 210,
      }}
    >
      <div
        className="row"
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography fontWeight="bold">{props.title}</Typography>
        {props.header}
        {props.onExpand && (
          <IconButton
            color={props.expanded ? 'primary' : 'default'}
            onClick={props.onExpand}
          >
            {props.expanded ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        )}
      </div>
      <div style={{ height: '100%', overflowY: 'auto' }}>{props.children}</div>
    </Card>
  );
}

function SimulationSelection(props: { room: Room; game: Game }): JSX.Element {
  const { room, game } = props;
  const { isMuted, toggleMuted } = useWithConfig();
  const { player } = useWithPlayer();
  return (
    <div className="row" style={{ flexGrow: 1 }}>
      <TextField select fullWidth style={{ marginLeft: 10 }} label="Strategy">
        {[...room.gameData.players]
          .sort((a, b) => {
            if (a._id === player?._id) return -1;
            if (b._id === player?._id) return 1;
            return 0;
          })
          .map((p) => {
            return (
              <MenuItem
                key={p._id}
                value={p._id}
                style={{
                  width: '100%',
                  padding: 0,
                  margin: 0,
                  backgroundColor: p._id === player?._id ? 'lightblue' : '',
                }}
              >
                {game.showPlayerStrategy(
                  p,
                  room.gameData.playersGameStateData[p._id],
                  room
                )}
              </MenuItem>
            );
          })}
      </TextField>
      <Tooltip title="Mute game audio">
        <IconButton onClick={toggleMuted} style={{ width: 55 }}>
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default function GamePagePhaseDisplay(props: {
  room?: Room;
  game?: Game;
  player?: Player;
  selectedPhase?: number;
  updateMyRoomGameStateData: (gameStateData: GameStateData) => Promise<Room>;
}): JSX.Element {
  const { room, game, player, updateMyRoomGameStateData } = props;
  const { windowHeight } = useWithWindow();
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const phasesStarted =
    props.selectedPhase !== undefined
      ? props.selectedPhase + 1
      : room?.gameData?.phaseProgression?.phasesStarted?.length;
  const cardHeight = windowHeight - 210;
  const minHeight = Math.max(100, cardHeight * (expanded ? 0.5 : 0.1)) - 25;
  const maxHeight =
    Math.min(cardHeight - 100, cardHeight * (expanded ? 0.5 : 0.9)) - 25;

  React.useEffect(() => {
    setExpanded(false);
  }, [phasesStarted]);

  if (!game || !room || !player) {
    return <div />;
  }

  // Small problem header (expandable to fuller size or 1/2). Big Equation.
  if (phasesStarted === 2 || phasesStarted === 3) {
    return (
      <MyCarousel phase={phasesStarted}>
        <div className="column spacing">
          <Space
            title="Problem"
            height={minHeight}
            expanded={expanded}
            onExpand={() => setExpanded(!expanded)}
          >
            {game.showProblem(!expanded)}
          </Space>
          <Space title="Approach" height={maxHeight}>
            <TransformWrapper
              minScale={0.5}
              maxScale={1}
              panning={{ excluded: ['panningDisabled'] }}
            >
              {game.showSolution(
                room.gameData,
                player,
                updateMyRoomGameStateData
              )}
            </TransformWrapper>
          </Space>
        </div>
      </MyCarousel>
    );
  }
  // Small "Equation" (just the parameter names+values). Big Simulation.
  if (phasesStarted === 4) {
    const minHeight = Math.max(150, cardHeight * (expanded ? 0.5 : 0.1)) - 25;
    const maxHeight =
      Math.min(cardHeight - 150, cardHeight * (expanded ? 0.5 : 0.9)) - 25;
    return (
      <MyCarousel phase={phasesStarted}>
        <div className="column spacing">
          <Space
            title="Approach"
            height={minHeight}
            expanded={expanded}
            onExpand={() => setExpanded(!expanded)}
          >
            <TransformWrapper
              minScale={0.5}
              maxScale={1}
              panning={{ excluded: ['panningDisabled'] }}
            >
              {game.showSolution(
                room.gameData,
                player,
                updateMyRoomGameStateData,
                !expanded
              )}
            </TransformWrapper>
          </Space>
          <Space
            title="Simulation"
            height={maxHeight}
            header={<SimulationSelection room={room} game={game} />}
          >
            {game.showSimulation(game)}
          </Space>
        </div>
      </MyCarousel>
    );
  }
  // Big Results
  if (phasesStarted === 5) {
    return (
      <MyCarousel phase={phasesStarted}>
        <Space title="Results">{game.showResult(room.gameData)}</Space>
        <Space
          title="Simulation"
          header={<SimulationSelection room={room} game={game} />}
        >
          {game.showSimulation(game)}
        </Space>
        <div className="column spacing">
          <Space
            title="Problem"
            height={minHeight}
            expanded={expanded}
            onExpand={() => setExpanded(!expanded)}
          >
            {game.showProblem(!expanded)}
          </Space>
          <Space title="Approach" height={maxHeight}>
            <TransformWrapper
              minScale={0.5}
              maxScale={1}
              panning={{ excluded: ['panningDisabled'] }}
            >
              {game.showSolution(
                room.gameData,
                player,
                updateMyRoomGameStateData
              )}
            </TransformWrapper>
          </Space>
        </div>
      </MyCarousel>
    );
  }
  // Big Problem. Everything else hidden in tabs (and not very interesting
  return (
    <MyCarousel phase={phasesStarted || 0}>
      <Space title="Problem">{game.showProblem()}</Space>
      <Space title="Approach">
        <TransformWrapper
          minScale={0.5}
          maxScale={1}
          panning={{ excluded: ['panningDisabled'] }}
        >
          {game.showSolution(room.gameData, player, updateMyRoomGameStateData)}
        </TransformWrapper>
      </Space>
      <Space
        title="Simulation"
        header={<SimulationSelection room={room} game={game} />}
      >
        {game.showSimulation(game)}
      </Space>
      <Space title="Results">{game.showResult(room.gameData)}</Space>
    </MyCarousel>
  );
}
