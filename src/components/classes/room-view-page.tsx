/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { CircularProgress, Typography } from '@mui/material';
import { useWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import GamePage from '../game/game-page';
import withAuthorizationOnly from '../../wrap-with-authorization-only';
import { UseWithHostGameManagement } from '../../classes/authority/use-with-host-game-manage';

function RoomViewPage(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const { educationalData } = useWithEducationalData();
  const gameManagement = useOutletContext<UseWithHostGameManagement>();

  const room = educationalData.rooms.find((r) => r._id === roomId);

  if (!room) {
    return (
      <div className="root center-div">
        <CircularProgress />
        <Typography variant="body1" style={{ marginTop: 20 }}>
          Loading room...
        </Typography>
      </div>
    );
  }

  return <GamePage gameManagementContext={gameManagement} />;
}

export default withAuthorizationOnly(RoomViewPage);
