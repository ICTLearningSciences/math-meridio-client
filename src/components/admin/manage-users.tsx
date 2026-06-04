/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { useWithWindow } from '../../hooks/use-with-window';
import {
  EducationalRole,
  Player,
  UserRole,
} from '../../store/slices/player/types';
import { fetchPlayers, updatePlayerRole } from '../../api';
import { DropdownButton } from '../button';
import { copyAndSet } from '../../helpers';
import AvatarSprite from '../avatar-sprite';

export default function AdminManageUsers(): JSX.Element {
  const { windowHeight } = useWithWindow();
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function loadPlayers() {
    setIsLoading(true);
    try {
      const players = await fetchPlayers();
      setPlayers(players);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  }

  async function updateUser(
    id: string,
    userRole?: UserRole,
    educationalRole?: EducationalRole
  ) {
    const player = await updatePlayerRole(id, userRole, educationalRole);
    const idx = players.findIndex((p) => p._id === player._id);
    if (idx !== -1) {
      setPlayers(copyAndSet(players, idx, player));
    }
  }

  React.useEffect(() => {
    loadPlayers();
  }, []);

  return (
    <div className="dashboard" style={{ minHeight: windowHeight - 230 }}>
      <div className="column spacing">
        <Typography fontSize={16} fontWeight="bold">
          USERS
        </Typography>
        <Card style={{ borderRadius: 10 }}>
          <CardContent
            className="column spacing"
            style={{
              position: 'relative',
              padding: 20,
              height: windowHeight - 350,
            }}
          >
            {isLoading ? (
              <CircularProgress />
            ) : (
              <DataGrid
                rows={players.map((p) => ({
                  ...p,
                  id: p._id,
                }))}
                columns={[
                  { field: 'id' },
                  {
                    field: 'name',
                    headerName: 'Name',
                    width: 300,
                    renderCell: (params) => (
                      <div className="row center-div spacing">
                        <AvatarSprite player={params.row} />
                        <Typography>{params.row.name}</Typography>
                      </div>
                    ),
                  },
                  {
                    field: 'lastLoginAt',
                    headerName: 'Last Activity',
                    width: 250,
                    renderCell: (params) => (
                      <Typography>
                        {params.row.lastLoginAt
                          ? new Date(params.row.lastLoginAt).toLocaleString()
                          : ''}
                      </Typography>
                    ),
                  },
                  {
                    field: 'userRole',
                    headerName: 'User Role',
                    width: 150,
                    renderCell: (params) => (
                      <DropdownButton
                        label={params.row.userRole}
                        value={params.row.userRole}
                        items={Object.values(UserRole)}
                        onSelect={(id: string) =>
                          updateUser(params.row.id, id as UserRole)
                        }
                      />
                    ),
                  },
                  {
                    field: 'educationalRole',
                    headerName: 'Educational Role',
                    width: 200,
                    renderCell: (params) => (
                      <DropdownButton
                        label={params.row.educationalRole || ''}
                        value={params.row.educationalRole}
                        items={Object.values(EducationalRole)}
                        onSelect={(id: string) =>
                          updateUser(
                            params.row.id,
                            undefined,
                            id as EducationalRole
                          )
                        }
                      />
                    ),
                  },
                ]}
                pageSize={20}
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
