/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { NotificationType } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import {
  ErrorOutline,
  NewReleasesOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { useWithWindow } from '../../../hooks/use-with-window';

export default function TeacherEvents(): JSX.Element {
  const { educationalData, dismissNotifications } = useWithEducationalData();
  const { windowHeight } = useWithWindow();
  const navigate = useNavigate();
  const notifications = educationalData.notifications;

  React.useEffect(() => {
    dismissNotifications();
  }, []);

  return (
    <div className="dashboard" style={{ minHeight: windowHeight - 250 }}>
      <div className="column spacing">
        <Typography fontSize={16} fontWeight="bold">
          NOTIFICATIONS
        </Typography>
        <Card style={{ borderRadius: 10 }}>
          <CardContent
            className="column spacing"
            style={{ position: 'relative', padding: 20 }}
          >
            {notifications.length === 0 ? (
              <Typography variant="body2" color="error">
                No events have been recorded yet
              </Typography>
            ) : (
              <TableContainer
                sx={{
                  borderRadius: 3,
                  border: 1,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        Event
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        Student
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        Classroom
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...notifications].reverse().map((event, idx) => {
                      const player = educationalData.students.find(
                        (p) => p._id === event.userId
                      );
                      const room = educationalData.rooms.find(
                        (r) => r._id === event.roomId
                      );
                      const classroom = educationalData.classes.find(
                        (p) =>
                          p._id === event.classId || p._id === room?.classId
                      );
                      return (
                        <TableRow key={`event-${idx}`}>
                          <TableCell>
                            {new Date(event.eventAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="row">
                              {event.eventType === NotificationType.REPORT ? (
                                <ErrorOutline
                                  fontSize="small"
                                  color="error"
                                  style={{ marginRight: 5 }}
                                />
                              ) : event.eventType ===
                                NotificationType.REQUEST_HELP ? (
                                <WarningAmberOutlined
                                  fontSize="small"
                                  color="warning"
                                  style={{ marginRight: 5 }}
                                />
                              ) : event.eventType === NotificationType.JOIN ? (
                                <NewReleasesOutlined
                                  fontSize="small"
                                  color="success"
                                  style={{ marginRight: 5 }}
                                />
                              ) : undefined}
                              {classroom && room ? (
                                <Link
                                  onClick={() =>
                                    navigate(
                                      `/classes/${classroom._id}/room/${room._id}`
                                    )
                                  }
                                >
                                  {event.event}
                                </Link>
                              ) : (
                                event.event
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{player?.name}</TableCell>
                          <TableCell>
                            {classroom?.name} - {room?.name}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
