/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Room } from '../../store/slices/game';

export default function RoomCard(props: {
  room: Room;
  join: (id: string) => void;
  delete: (id: string) => void;
  ownerPresent: boolean;
}): JSX.Element {
  const { room, ownerPresent } = props;
  const [expanded, setIsExpanded] = React.useState<boolean>(false);
  return (
    <Card
      className="list-item"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        opacity: ownerPresent ? 1 : 0.5,
      }}
    >
      <CardContent className="row" style={{ padding: 10 }}>
        <IconButton onClick={() => setIsExpanded(!expanded)}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        <div
          className="row"
          style={{
            flexGrow: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography style={{ flexGrow: 1 }}>{room.name}</Typography>
          <Typography style={{ marginRight: 10 }}>
            {room.gameData.players.length} players
          </Typography>
          <Button
            variant="contained"
            disabled={room.gameData.players.length >= 4}
            onClick={() => props.join(room._id)}
          >
            Join
          </Button>
        </div>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent style={{ backgroundColor: '#fcfcfc' }}>
          <Typography variant="body2" color="text.secondary">
            Game: {room.gameData.gameId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Stage: {room.gameData.globalStateData.curStageId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Step: {room.gameData.globalStateData.curStepId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Players: {room.gameData.players.map((p) => p.name).join(', ')}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => props.delete(room._id)}
          >
            Delete Room
          </Button>
        </CardContent>
      </Collapse>
    </Card>
  );
}
