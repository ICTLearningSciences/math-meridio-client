/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import { TransformWrapper } from 'react-zoom-pan-pinch';
import {
  Button,
  Card,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Fullscreen,
  FullscreenExit,
  VolumeOff,
  VolumeUp,
} from '@mui/icons-material';

import ChatThread from './chat-thread';
import ChatForm from './chat-form';
import { useAppSelector } from '../../store/hooks';
import { useWithGame } from '../../store/slices/game/use-with-game-state';
import { useWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import withAuthorizationOnly from '../../wrap-with-authorization-only';
import Popup from '../popup';
import { useWithConfig } from '../../store/slices/config/use-with-config';
import { useWithWindow } from '../../hooks/use-with-window';
import EventSystem from '../../game/event-system';
import { GameData, PlayerStateData } from '../../store/slices/game';
import { Game } from '../../game/types';

import '../../layout.css';
import { Player } from '../../store/slices/player/types';
import { UseWithHostGameManagement } from '../../classes/authority/use-with-host-game-manage';

const COLS = 6;
const ROWS = 4;

// Type for the outlet context provided by GameLayout
type GameManagementContext = UseWithHostGameManagement;

interface GamePageProps {
  gameManagementContext?: GameManagementContext;
}

function Space(props: {
  title: string;
  children: JSX.Element;
  expanded?: boolean;
  onExpand: () => void;
}): JSX.Element {
  return (
    <div style={{ padding: 10, height: '100%' }}>
      <div
        className="row"
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography fontWeight="bold">{props.title}</Typography>
        <Tooltip
          title={props.expanded ? 'Collapse to default' : 'Expand section'}
        >
          <IconButton
            color={props.expanded ? 'primary' : 'default'}
            onClick={props.onExpand}
          >
            {props.expanded ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
      </div>
      <div style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
        {props.children}
      </div>
    </div>
  );
}

function SimulationSpace(props: {
  game: Game;
  player: Player;
  uiTriggerLocalGameData: GameData;
  simulation?: string;
  expanded?: boolean;
  onExpand: () => void;
}): JSX.Element {
  const { game, player, uiTriggerLocalGameData, simulation } = props;
  const { isMuted, toggleMuted } = useWithConfig();
  const [curSimulation, setSimulation] = React.useState<PlayerStateData>();

  React.useEffect(() => {
    EventSystem.on('simulate', (sim: PlayerStateData) => setSimulation(sim));
  }, []);

  return (
    <div style={{ padding: 10, height: '100%' }}>
      <div
        className="row"
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography fontWeight="bold">Simulation</Typography>
        <TextField
          select
          fullWidth
          style={{ marginLeft: 10 }}
          value={curSimulation?.player}
          label="Strategy"
        >
          {uiTriggerLocalGameData.playerStateData.map((psd) => {
            return (
              <MenuItem
                key={psd.player}
                value={psd.player}
                style={{ width: '100%', padding: 0, margin: 0 }}
              >
                {game.showPlayerStrategy(player, psd)}
              </MenuItem>
            );
          })}
        </TextField>
        <Tooltip title="Mute game audio">
          <IconButton onClick={toggleMuted}>
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
        </Tooltip>
        <IconButton
          color={props.expanded ? 'primary' : 'default'}
          onClick={props.onExpand}
        >
          {props.expanded ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </div>
      <div style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
        {game.showSimulation(game)}
      </div>
    </div>
  );
}

function GamePage(): JSX.Element {
  const { simulation } = useAppSelector((state) => state.gameData);
  const { roomId } = useParams<{ roomId: string }>();
  const { educationalData } = useWithEducationalData();
  const room = educationalData.rooms.find((r) => r._id === roomId);

  // Use prop if provided, otherwise try to get from outlet context
  const outletContext = useOutletContext<GameManagementContext>();
  const {
    launchGame,
    ownerIsPresent,
    waitingForPlayers,
    uiTriggerLocalGameData,
    player,
    updatePlayerStateData,
    game,
  } = outletContext;
  const { gameStateHandler, responsePending, sendMessage } = useWithGame();
  const navigate = useNavigate();
  const { windowHeight, windowWidth } = useWithWindow();

  // Handle case where context is not yet available
  if (!outletContext) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  const [popupOpen, setPopupOpen] = React.useState(false);
  const [alreadyShownPopup, setAlreadyShownPopup] = React.useState(false);
  const [layout, setLayout] = React.useState<GridLayout.Layout[]>([
    getLayout('problem', { h: 1 }),
    getLayout('approach', { h: 3, y: 2 }),
    getLayout('simulation', { x: 2 }),
    getLayout('results', { x: 2, y: 2 }),
    getLayout('chat', {
      x: 4,
      h: 4,
      minH: 4,
      maxH: 4,
      minW: 1,
      maxW: 2,
      resizeHandles: ['w'],
    }),
  ]);
  const [expanded, setExpanded] = React.useState<number>();

  React.useEffect(() => {
    if (!room) {
      console.log('navigating to home');
      navigate('/classes');
    }
    if (!alreadyShownPopup && !ownerIsPresent) {
      setPopupOpen(true);
      setAlreadyShownPopup(true);
    }
  }, [Boolean(room), ownerIsPresent]);

  React.useEffect(() => {
    EventSystem.on('simulate', () => setExpanded(2));
    EventSystem.on('simulationEnded', () => setExpanded(3));
  }, []);

  React.useEffect(() => {
    if (expanded === undefined) {
      setLayout([
        updateLayout(layout[0], { x: 0, y: 0, h: 1, w: 2 }),
        updateLayout(layout[1], { x: 0, y: 1, h: 3, w: 2 }),
        updateLayout(layout[2], {
          x: 2,
          y: 0,
          h: 2,
          w: COLS - layout[4].w - 2,
        }),
        updateLayout(layout[3], {
          x: 2,
          y: 2,
          h: 2,
          w: COLS - layout[4].w - 2,
        }),
        layout[4],
      ]);
    }
    if (expanded === 0) {
      setLayout([
        updateLayout(layout[0], { x: 0, y: 0, h: 3, w: 3 }),
        updateLayout(layout[1], { x: 0, y: 1, h: 1, w: 3 }),
        updateLayout(layout[2], {
          x: 3,
          y: 0,
          w: COLS - layout[4].w - 3,
          h: 1,
        }),
        updateLayout(layout[3], {
          x: 3,
          y: 1,
          w: COLS - layout[4].w - 3,
          h: 3,
        }),
        layout[4],
      ]);
    }
    if (expanded === 1) {
      setLayout([
        updateLayout(layout[0], { x: 0, y: 0, h: 1, w: 3 }),
        updateLayout(layout[1], { x: 0, y: 1, h: 3, w: 3 }),
        updateLayout(layout[2], {
          x: 3,
          y: 0,
          w: COLS - layout[4].w - 3,
          h: 1,
        }),
        updateLayout(layout[3], {
          x: 3,
          y: 1,
          w: COLS - layout[4].w - 3,
          h: 3,
        }),
        layout[4],
      ]);
    }
    if (expanded === 2) {
      setLayout([
        updateLayout(layout[0], { x: 0, y: 0, w: 1 }),
        updateLayout(layout[1], { x: 0, y: COLS - layout[0].h, w: 1 }),
        updateLayout(layout[2], {
          x: 1,
          y: 0,
          h: 3,
          w: COLS - layout[4].w - 1,
        }),
        updateLayout(layout[3], {
          x: 1,
          y: 3,
          h: 1,
          w: COLS - layout[4].w - 1,
        }),
        layout[4],
      ]);
    }
    if (expanded === 3) {
      setLayout([
        updateLayout(layout[0], { x: 0, y: 0, w: 1 }),
        updateLayout(layout[1], { x: 0, y: COLS - layout[0].h, w: 1 }),
        updateLayout(layout[2], {
          x: 1,
          y: 0,
          h: 1,
          w: COLS - layout[4].w - 1,
        }),
        updateLayout(layout[3], {
          x: 1,
          y: 1,
          h: 3,
          w: COLS - layout[4].w - 1,
        }),
        layout[4],
      ]);
    }
  }, [expanded]);

  function getLayout(
    id: string,
    props?: Partial<GridLayout.Layout>
  ): GridLayout.Layout {
    const layout: GridLayout.Layout = {
      i: id,
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      minH: 1,
      maxH: 3,
      minW: 1,
      maxW: 3,
      resizeHandles: [],
      isDraggable: false,
      isResizable: true,
      ...props,
    };
    return layout;
  }

  function updateLayout(
    layout: GridLayout.Layout,
    updates: Partial<GridLayout.Layout>
  ): GridLayout.Layout {
    return getLayout(layout.i, { ...layout, ...updates });
  }

  function onExpand(i: number): void {
    if (expanded === i) {
      setExpanded(undefined);
    } else {
      setExpanded(i);
    }
  }

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  const handleLayout = (newLayout: GridLayout.Layout[]) => {
    // resize chat width
    if (newLayout[4].w !== layout[4].w) {
      newLayout[2] = updateLayout(newLayout[2], {
        x: newLayout[1].w,
        w: COLS - newLayout[1].w - newLayout[4].w,
      });
      newLayout[3] = updateLayout(newLayout[3], {
        x: newLayout[1].w,
        w: COLS - newLayout[1].w - newLayout[4].w,
      });
    }
    setLayout(newLayout);
  };

  if (!room) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  if (!game || !uiTriggerLocalGameData || !player) {
    console.log('launching game', game, uiTriggerLocalGameData, player);

    return (
      <div className="root center-div">
        <Button
          onClick={launchGame}
          disabled={Boolean(gameStateHandler)}
          data-cy="begin-game-button"
        >
          Begin
        </Button>
      </div>
    );
  }

  return (
    <div className="root" style={{ backgroundColor: '#cfdaf8' }}>
      <Popup open={popupOpen} onClose={handleClosePopup} />
      <GridLayout
        className="layout"
        style={{ height: '100%', width: '100%' }}
        layout={layout}
        onLayoutChange={handleLayout}
        isResizable
        cols={COLS}
        maxRows={ROWS}
        rowHeight={(windowHeight - 120) / ROWS}
        width={windowWidth}
      >
        <Card
          key="problem"
          style={{
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 20,
          }}
        >
          <Space
            title="Problem"
            expanded={expanded === 0}
            onExpand={() => onExpand(0)}
          >
            {game.showProblem()}
          </Space>
        </Card>

        <Card
          key="approach"
          style={{
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 20,
          }}
        >
          <Space
            title="Approach"
            expanded={expanded === 1}
            onExpand={() => onExpand(1)}
          >
            <TransformWrapper
              minScale={0.5}
              maxScale={1}
              panning={{ excluded: ['panningDisabled'] }}
            >
              {game.showSolution(
                uiTriggerLocalGameData,
                player,
                updatePlayerStateData
              )}
            </TransformWrapper>
          </Space>
        </Card>

        <Card
          key="simulation"
          style={{
            borderTopLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <SimulationSpace
            game={game}
            player={player}
            uiTriggerLocalGameData={uiTriggerLocalGameData}
            simulation={simulation}
            expanded={expanded === 2}
            onExpand={() => onExpand(2)}
          />
        </Card>

        <Card
          key="results"
          style={{
            borderTopLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <Space
            title="Results"
            expanded={expanded === 3}
            onExpand={() => onExpand(3)}
          >
            {game.showResult(uiTriggerLocalGameData)}
          </Space>
        </Card>

        <Stack
          key="chat"
          spacing={2}
          style={{
            height: '100%',
            boxSizing: 'border-box',
            padding: 10,
          }}
        >
          <ChatThread
            responsePending={responsePending}
            waitingForPlayers={waitingForPlayers}
            uiGameData={uiTriggerLocalGameData}
          />
          <ChatForm sendMessage={sendMessage} />
        </Stack>
      </GridLayout>
    </div>
  );
}

export default withAuthorizationOnly(GamePage);
