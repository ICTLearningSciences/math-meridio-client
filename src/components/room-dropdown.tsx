/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
// src/components/game/RoomDropdown.tsx
import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  Typography,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Room } from '../store/slices/game/types';
import RoomCard from './game/room-card';
interface RoomDropdownProps {
  title: string;
  rooms: Room[];
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  joinRoom: (id: string) => void;
  deleteRoom: (id: string) => void;
  ownerPresent: boolean;
}

const RoomDropdown: React.FC<RoomDropdownProps> = ({
  title,
  rooms,
  expanded,
  setExpanded,
  joinRoom,
  deleteRoom,
  ownerPresent,
}) => {
  return (
    <Card style={{ width: '100%', marginBottom: 20 }}>
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardContent
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">{title}</Typography>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </CardContent>
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {rooms.map((r) => (
            <RoomCard
              key={`room-${r._id}`}
              room={r}
              ownerPresent={ownerPresent}
              join={(id) => joinRoom(id)}
              delete={(id) => deleteRoom(id)}
            />
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default RoomDropdown;
