/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Classroom } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { useAppDispatch } from '../../../store/hooks';
import { dismissEvents } from '../../../store/slices/player';
import {
  ErrorOutline,
  NewReleasesOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { useWithWindow } from '../../../hooks/use-with-window';

export default function TeacherEvents(props: {
  classroom?: Classroom;
}): JSX.Element {
  const dispatch = useAppDispatch();
  const { educationalData } = useWithEducationalData();
  const { windowHeight } = useWithWindow();
  const events = educationalData.events;

  React.useEffect(() => {
    dispatch(dismissEvents());
  }, []);

  return (
    <div className="dashboard" style={{ minHeight: windowHeight - 250 }}>
      <div className="column spacing">
        <Typography fontSize={16} fontWeight="bold">
          EVENTS
        </Typography>
        <Card style={{ borderRadius: 10 }}>
          <CardContent
            className="column spacing"
            style={{ position: 'relative', padding: 20 }}
          >
            {events.length === 0 ? (
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
                        Class
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Room</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...events]
                      ?.sort(
                        (a, b) =>
                          new Date(b.eventAt).getTime() -
                          new Date(a.eventAt).getTime()
                      )
                      .map((event, idx) => {
                        const player = educationalData.students.find(
                          (p) => p._id === event.userId
                        );
                        const _room = educationalData.rooms.find(
                          (r) => r._id === event.roomId
                        );
                        const _class = educationalData.classes.find(
                          (p) =>
                            p._id === event.classId || p._id === _room?.classId
                        );
                        return (
                          <TableRow key={`event-${idx}`}>
                            <TableCell>
                              {new Date(event.eventAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="row">
                                {event.event.includes(
                                  'has reported another player'
                                ) ? (
                                  <ErrorOutline
                                    fontSize="small"
                                    color="error"
                                    style={{ marginRight: 5 }}
                                  />
                                ) : event.event.endsWith(
                                    'has requested help'
                                  ) ? (
                                  <WarningAmberOutlined
                                    fontSize="small"
                                    color="warning"
                                    style={{ marginRight: 5 }}
                                  />
                                ) : event.event.includes('joined classroom') ||
                                  event.event.includes('joined room') ? (
                                  <NewReleasesOutlined
                                    fontSize="small"
                                    color="success"
                                    style={{ marginRight: 5 }}
                                  />
                                ) : undefined}
                                {event.event}
                              </div>
                            </TableCell>
                            <TableCell>{player?.name}</TableCell>
                            <TableCell>{_class?.name}</TableCell>
                            <TableCell>{_room?.name}</TableCell>
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
