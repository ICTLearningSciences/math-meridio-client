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
import { useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useWithEducationalData } from '../../store/slices/educational-data/use-with-educational-data';
import { LoadStatus } from '../../types';
import { ClassMembershipStatus } from '../../store/slices/educational-data/types';

export default function TeacherSelectedClassPage(): JSX.Element {
  const { classId } = useParams<{ classId: string }>();
  const {
    createNewClassInviteCode,
    revokeClassInviteCode,
    updateClassNameDescription,
    educationalData,
  } = useWithEducationalData();

  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [validUntil, setValidUntil] = React.useState('');
  const [numUses, setNumUses] = React.useState('10');
  const [creating, setCreating] = React.useState(false);
  const [className, setClassName] = React.useState('');
  const [classDescription, setClassDescription] = React.useState('');
  const [updating, setUpdating] = React.useState(false);

  const classroom = educationalData.classes.find((c) => c._id === classId);
  const classRooms = educationalData.rooms.filter((r) => r.classId === classId);
  const studentMemberships = educationalData.classMemberships.filter(
    (cm) => cm.classId === classId && cm.status === ClassMembershipStatus.MEMBER
  );
  const students = educationalData.students.filter((s) =>
    studentMemberships.some((sm) => sm.userId === s._id)
  );

  React.useEffect(() => {
    if (classroom) {
      setClassName(classroom.name);
      setClassDescription(classroom.description || '');
    }
  }, [classroom]);

  const handleCreateInviteCode = async () => {
    if (!classId || !validUntil || !numUses) return;
    setCreating(true);
    try {
      await createNewClassInviteCode(
        classId,
        new Date(validUntil),
        parseInt(numUses)
      );
      setInviteDialogOpen(false);
      setValidUntil('');
      setNumUses('10');
    } catch (err) {
      console.error('Failed to create invite code', err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeInviteCode = async (code: string) => {
    if (!classId) return;
    try {
      await revokeClassInviteCode(classId, code);
    } catch (err) {
      console.error('Failed to revoke invite code', err);
    }
  };

  const handleUpdateClass = async () => {
    if (!classId) return;
    setUpdating(true);
    try {
      await updateClassNameDescription(classId, className, classDescription);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Failed to update class', err);
    } finally {
      setUpdating(false);
    }
  };

  if (educationalData.hydrationLoadStatus.status === LoadStatus.IN_PROGRESS) {
    return (
      <div className="root center-div">
        <CircularProgress />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="root center-div">
        <Typography variant="h6" color="error">
          Classroom not found
        </Typography>
      </div>
    );
  }

  return (
    <div
      className="column"
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div
        className="row"
        style={{
          width: '90%',
          maxWidth: 1000,
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <Typography variant="h4" style={{ marginBottom: 10 }}>
            {classroom.name}
          </Typography>
          {classroom.description && (
            <Typography variant="body1" color="text.secondary">
              {classroom.description}
            </Typography>
          )}
        </div>
        <Button variant="outlined" onClick={() => setEditDialogOpen(true)}>
          Edit Class
        </Button>
      </div>

      <div className="column" style={{ width: '90%', maxWidth: 1000, gap: 30 }}>
        {/* Invite Codes Section */}
        <Card>
          <CardContent>
            <div
              className="row"
              style={{ justifyContent: 'space-between', marginBottom: 15 }}
            >
              <Typography variant="h6">Invite Codes</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setInviteDialogOpen(true)}
              >
                Create Invite Code
              </Button>
            </div>
            {classroom.inviteCodes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No active invite codes
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Uses</TableCell>
                    <TableCell>Max Uses</TableCell>
                    <TableCell>Valid Until</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classroom.inviteCodes.map((inviteCode) => (
                    <TableRow key={inviteCode.code}>
                      <TableCell>{inviteCode.code}</TableCell>
                      <TableCell>{inviteCode.uses}</TableCell>
                      <TableCell>{inviteCode.maxUses || 'Unlimited'}</TableCell>
                      <TableCell>
                        {inviteCode.validUntil
                          ? new Date(inviteCode.validUntil).toLocaleDateString()
                          : 'No expiration'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            handleRevokeInviteCode(inviteCode.code)
                          }
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Rooms Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" style={{ marginBottom: 15 }}>
              Game Rooms ({classRooms.length})
            </Typography>
            {classRooms.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No game rooms yet
              </Typography>
            ) : (
              classRooms.map((room) => {
                const roomStudents = room.gameData.players.filter((p) =>
                  students.some((s) => s._id === p._id)
                );

                return (
                  <Card
                    key={room._id}
                    variant="outlined"
                    style={{ marginBottom: 15 }}
                  >
                    <CardContent>
                      <Typography variant="h6">{room.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Game: {room.gameData.gameId}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        style={{ marginBottom: 10 }}
                      >
                        {roomStudents.length} students
                      </Typography>

                      {roomStudents.length > 0 && (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Student Name</TableCell>
                              <TableCell>Messages Sent</TableCell>
                              <TableCell>Join Time</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {roomStudents.map((student) => {
                              const messageCount = room.gameData.chat.filter(
                                (msg) => msg.senderId === student._id
                              ).length;

                              return (
                                <TableRow key={student._id}>
                                  <TableCell>{student.name}</TableCell>
                                  <TableCell>{messageCount}</TableCell>
                                  <TableCell>
                                    {new Date(
                                      student.lastLoginAt
                                    ).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Students Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" style={{ marginBottom: 15 }}>
              Students ({students.length})
            </Typography>
            {students.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No students have joined yet
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Last Login</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {new Date(student.lastLoginAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Invite Code Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => !creating && setInviteDialogOpen(false)}
      >
        <DialogTitle>Create Invite Code</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Valid Until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ marginTop: 10, marginBottom: 20 }}
          />
          <TextField
            fullWidth
            label="Max Uses"
            type="number"
            value={numUses}
            onChange={(e) => setNumUses(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setInviteDialogOpen(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateInviteCode}
            variant="contained"
            disabled={creating || !validUntil || !numUses}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !updating && setEditDialogOpen(false)}
      >
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            style={{ marginTop: 10, marginBottom: 20 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={classDescription}
            onChange={(e) => setClassDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateClass}
            variant="contained"
            disabled={updating || !className}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
