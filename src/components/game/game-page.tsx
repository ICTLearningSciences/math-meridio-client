/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { CircularProgress, Grid, Stack } from '@mui/material';
import ChatThread from './chat-thread';
import ChatForm from './chat-form';
import withAuthorizationOnly from '../../wrap-with-authorization-only';
import EndOfPhaseReflectionModal from './end-of-phase-reflection-modal';
import AwayStatusModal from './away-status-modal';
import PausedStatusModal from './paused-status-modal';
import { PlayerComputedState, RoomPhase } from '../../store/slices/game/types';
import GamePagePhaseDisplay from './game-page-phases';
import { UseWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import { useAppSelector } from '../../store/hooks';
import { EducationalRole } from '../../store/slices/player/types';
import { RequireInputType } from '../discussion-stage-builder/types';
import PhaseProgressBar from '../phase-progress-bar';

import '../../layout.css';

// Type for the outlet context provided by GameLayout
type EducationalDataContext = UseWithEducationalData;

function GamePage(): JSX.Element {
  // Use prop if provided, otherwise try to get from outlet context
  const outletContext = useOutletContext<EducationalDataContext>();
  const { player } = useAppSelector((state) => state.playerData);
  const {
    curGame,
    room,
    updateMyRoomGameStateData,
    sendMessageToGameRoom,
    fetchRoom,
  } = outletContext;
  const navigate = useNavigate();

  const isTeacher = player?.educationalRole === EducationalRole.INSTRUCTOR;
  const myStatusInRoom =
    player?._id && room
      ? room?.gameData.playersStatusRecord[player?._id]
      : undefined;
  const iAmAway =
    myStatusInRoom?.computedState ===
      PlayerComputedState.REPORTED_AWAY_BY_OTHER_PLAYER ||
    myStatusInRoom?.computedState ===
      PlayerComputedState.REPORTED_AWAY_BY_FRONTEND_DETECTION;
  const iAmPaused =
    myStatusInRoom?.computedState === PlayerComputedState.PAUSED_BY_ADMIN;
  const phasesCompleted =
    room?.gameData?.phaseProgression?.phasesCompleted?.length;
  const isInWaitingState =
    room?.gameData.curGameState.curState ===
    'WAITING_FOR_STUDENT_READY_TO_CONTINUE';
  const isEndOfPhaseReflection =
    room?.gameData.curGameState.curState === 'END_OF_PHASE_REFLECTION';

  const isSingleResponseRequired =
    room?.gameData.curGameState.curState ===
    RequireInputType.SINGLE_RESPONSE_REQUIRED;
  const isFreeForAll =
    room?.gameData.curGameState.curState ===
    RequireInputType.ALL_USER_RESPONSES_REQUIRED_FREE_FOR_ALL;
  const isInOrder =
    room?.gameData.curGameState.curState ===
    RequireInputType.ALL_USER_RESPONSES_REQUIRED_IN_ORDER;
  const moreThanOnePlayerInRoom =
    room?.gameData && room.gameData.players?.length > 1;
  const isAtFrontOfList = Boolean(
    room?.gameData &&
      room.gameData.curGameState.playersLeftToRespond[0] === player?._id
  );
  const isMyTurn =
    isSingleResponseRequired ||
    isFreeForAll ||
    !moreThanOnePlayerInRoom ||
    (isInOrder && isAtFrontOfList);

  const [phase, setPhase] = React.useState<number>();

  // Handle case where context is not yet available
  if (!outletContext) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  React.useEffect(() => {
    if (!room) {
      console.log('navigating to home');
      navigate('/classes');
    }
  }, [Boolean(room)]);

  React.useEffect(() => {
    setPhase(undefined);
  }, [phasesCompleted]);

  if (!room) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  if (!curGame || !room || !player) {
    return <div className="root center-div">Missing game or room data</div>;
  }

  return (
    <div
      className="root"
      style={{
        backgroundColor: '#cfdaf8',
      }}
    >
      <div style={{ width: '80%', padding: 20 }}>
        <PhaseProgressBar
          gameRooms={[room]}
          onClickPhase={(p) => setPhase(p)}
        />
      </div>
      <Grid
        container
        spacing={2}
        style={{ height: 0, width: '100%', padding: 20 }}
      >
        <Grid xs={6}>
          <GamePagePhaseDisplay
            room={room}
            game={curGame}
            player={player}
            selectedPhase={phase}
            updateMyRoomGameStateData={updateMyRoomGameStateData}
          />
        </Grid>
        <Grid xs={6}>
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
              roomIsProcessing={room.phase === RoomPhase.PROCESSING}
              requestUserInputPhaseData={room.gameData.curGameState}
              uiGameData={room.gameData}
            />
            <ChatForm
              sendMessage={sendMessageToGameRoom}
              isMyTurn={isTeacher || isMyTurn}
              isTeacher={isTeacher}
              isPaused={!isTeacher && iAmPaused}
              disabled={isEndOfPhaseReflection && isInWaitingState}
              phasesCompleted={!isTeacher && phasesCompleted === 5}
              uiGameData={room.gameData}
            />
          </Stack>
        </Grid>
      </Grid>
      {!isTeacher && (
        <EndOfPhaseReflectionModal
          room={room}
          player={player}
          fetchRoom={fetchRoom}
        />
      )}
      <AwayStatusModal
        roomId={room._id}
        playerId={player._id}
        iAmAway={iAmAway}
      />
      <PausedStatusModal iAmPaused={iAmPaused} />
    </div>
  );
}

export default withAuthorizationOnly(GamePage);
