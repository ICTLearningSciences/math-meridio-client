/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import * as motion from 'motion/react-client';
import { LinearProgress, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { PhaseProgression, Room } from '../store/slices/game/types';

export function PhaseSelector(props: {
  gameRooms: Room[];
  phase: number | undefined;
  setPhase: (num?: number) => void;
}): JSX.Element {
  const { gameRooms, phase, setPhase } = props;
  const [numPhases, setNumPhases] = React.useState<number>(0);
  const [phasesCompleted, setPhasesCompleted] = React.useState<number>(0);

  React.useEffect(() => {
    if (gameRooms.length === 0) return;
    const numPhases = Math.min(
      ...gameRooms.map(
        (r) => r.gameData.phaseProgression.startingPhaseStepsOrdered.length
      )
    );
    const phasesCompleted = Math.min(
      ...gameRooms.map(
        (r) => r.gameData.phaseProgression.phasesCompleted.length
      )
    );
    setNumPhases(numPhases);
    setPhasesCompleted(phasesCompleted);
  }, [gameRooms]);

  function onTogglePhase(idx: number): void {
    if (idx === phase) {
      setPhase(undefined);
    } else {
      setPhase(idx);
    }
  }

  return (
    <div className="row spacing" style={{ width: '100%' }}>
      {numPhases > 0 &&
        Array.from({ length: numPhases }, (_, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, filter: 'brightness(0.8)' }}
            className="column center-div spacing"
            style={{ flexGrow: 1 }}
            onClick={() => onTogglePhase(index)}
          >
            <div
              className="row center-div"
              style={{
                height: 30,
                width: '100%',
                borderRadius: 40,
                backgroundColor:
                  (phase === undefined && phasesCompleted > index) ||
                  phase === index
                    ? 'orange'
                    : 'rgb(217, 217, 217)',
                color: 'white',
                borderTopRightRadius: 40,
                borderBottomRightRadius: 40,
              }}
            >
              {phasesCompleted > index && <CheckCircleOutline />}
            </div>
            <Typography
              fontSize={14}
              style={{
                color: phase === index ? 'orange' : 'gray',
              }}
            >
              PHASE {index + 1}
            </Typography>
          </motion.div>
        ))}
    </div>
  );
}

export default function PhaseProgressBar(props: {
  gameRooms: Room[];
  size?: 'large';
  onClickPhase?: (p: number) => void;
}): JSX.Element {
  const { gameRooms } = props;
  const [phase, setPhase] = React.useState<PhaseProgression>();
  const large = props.size === 'large';
  const phasesStarted = phase?.phasesStarted.length || 0;
  const phasesCompleted = phase?.phasesCompleted.length || 0;
  const value = !phase?.startingPhaseStepsOrdered.length
    ? 0
    : (phasesCompleted / phase.startingPhaseStepsOrdered.length) * 100;

  React.useEffect(() => {
    if (gameRooms.length === 0) return;
    const numPhases: number[] = [];
    const phasesStarted: number[] = [];
    const phasesCompleted: number[] = [];
    for (const room of gameRooms) {
      numPhases.push(
        room.gameData.phaseProgression.startingPhaseStepsOrdered.length
      );
      phasesStarted.push(room.gameData.phaseProgression.phasesStarted.length);
      phasesCompleted.push(
        room.gameData.phaseProgression.phasesCompleted.length
      );
    }
    setPhase({
      curPhaseTitle: '',
      curPhaseStepId: '',
      phasesStarted: Array.from({ length: Math.min(...phasesStarted) }),
      phasesCompleted: Array.from({ length: Math.min(...phasesCompleted) }),
      startingPhaseStepsOrdered: Array.from({
        length: Math.min(...numPhases),
      }),
      learningObjectives: [],
    });
  }, [gameRooms]);

  return (
    <div style={{ position: 'relative' }}>
      <LinearProgress
        variant="determinate"
        value={value}
        style={{ height: large ? 30 : 15, borderRadius: 40 }}
        sx={{
          backgroundColor: 'rgb(217, 217, 217)',
          '& .MuiLinearProgress-bar': {
            backgroundImage: 'linear-gradient(to right, yellow, orange)',
            borderTopRightRadius: 40,
            borderBottomRightRadius: 40,
          },
        }}
      />
      <div
        className="row"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: large ? -1 : -4,
          justifyContent: 'space-evenly',
        }}
      >
        {large && (
          <Typography
            fontSize={12}
            style={{
              position: 'absolute',
              top: 5,
              left: 10,
              color: 'white',
              backgroundColor: 'rgb(180, 180, 180)',
              paddingLeft: 5,
              paddingRight: 5,
              borderRadius: 20,
            }}
          >
            PROGRESS:
          </Typography>
        )}
        {phase &&
          phase.startingPhaseStepsOrdered.length > 0 &&
          Array.from(
            { length: phase.startingPhaseStepsOrdered.length },
            (_, index) => (
              <motion.div
                key={index}
                whileHover={
                  props.onClickPhase
                    ? { scale: 1.5, filter: 'brightness(1.2)' }
                    : {}
                }
                style={{
                  scale: !large && phasesStarted === index + 1 ? 1.5 : 1,
                  border:
                    !large && phasesStarted === index + 1
                      ? '1px solid white'
                      : '',
                  backgroundColor:
                    phasesCompleted > index
                      ? 'rgba(255, 165, 0, 0.5)'
                      : 'rgba(217, 217, 217, 0.5)',
                  padding: 5,
                  borderRadius: 20,
                }}
                onClick={() => {
                  if (props.onClickPhase) {
                    props.onClickPhase(index);
                  }
                }}
              >
                <Typography
                  fontSize={large ? 14 : 8}
                  style={{
                    color:
                      phasesCompleted > index ? 'white' : 'rgb(180, 180, 180)',
                  }}
                >
                  {large ? 'PHASE' : 'P'} {index + 1}
                </Typography>
              </motion.div>
            )
          )}
      </div>
    </div>
  );
}
