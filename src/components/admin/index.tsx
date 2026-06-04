/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { UserRole } from '../../store/slices/player/types';
import { Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs } from '../tab';
import AdminManageUsers from './manage-users';

export default function AdminPage(): JSX.Element {
  const { player } = useAppSelector((state) => state.playerData);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = Number.parseInt(searchParams.get('tab') || '0');

  React.useEffect(() => {
    if (!player || player.userRole !== UserRole.ADMIN) {
      navigate('/');
    }
  }, [player?.userRole]);

  if (player?.userRole !== UserRole.ADMIN) {
    return (
      <div className="root center-div">
        <Typography>Admins only</Typography>
      </div>
    );
  }

  return (
    <div
      className="column"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Tabs
        selectedTab={tab}
        onSelectTab={(t) => setSearchParams({ ...searchParams, tab: `${t}` })}
        tabsStyle={{ margin: '10px' }}
        tabs={[
          {
            name: 'MANAGE USERS',
            element: <AdminManageUsers />,
          },
        ]}
      />
    </div>
  );
}
