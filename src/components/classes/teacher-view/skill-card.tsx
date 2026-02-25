/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  CheckCircle,
  ExpandLess,
  ExpandMore,
  Person,
} from '@mui/icons-material';
import { Collapse, Typography } from '@mui/material';
import { Player } from '../../../store/slices/player/types';
import { PlayerSprite } from '../../avatar-sprite';

export default function SkillCard(props: {
  name: string;
  players: Player[];
  playersMet: Player[];
}): JSX.Element {
  const { players, playersMet } = props;
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const percentMet = playersMet.length / players.length;

  return (
    <div
      style={{
        borderRadius: 10,
        backgroundColor: 'white',
      }}
    >
      <div className="row card spacing" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ExpandLess /> : <ExpandMore />}
        <Typography style={{ flexGrow: 1 }}>{props.name}</Typography>
        <Person
          fontSize="small"
          color={percentMet === 1 ? 'success' : 'inherit'}
        />
        <Typography color={percentMet === 1 ? 'green' : ''}>
          {playersMet.length} / {players.length}
        </Typography>
      </div>
      <Collapse in={expanded}>
        <div className="row spacing" style={{ marginLeft: 20 }}>
          {players.map((p) => {
            const isMet = playersMet.find((s) => s._id === p._id);
            return (
              <PlayerSprite key={p._id} player={p}>
                {isMet && (
                  <CheckCircle
                    color="success"
                    fontSize="small"
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      right: 0,
                    }}
                  />
                )}
              </PlayerSprite>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}
