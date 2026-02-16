/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  ClassMembershipStatus,
  Classroom,
} from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';

export default function TeacherManageClass(props: {
  classroom?: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const {
    educationalData,
    revokeClassInviteCode,
    createNewClassInviteCode,
    updateClassNameDescription,
  } = useWithEducationalData();

  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [validUntil, setValidUntil] = React.useState('');
  const [numUses, setNumUses] = React.useState('10');
  const [className, setClassName] = React.useState('');
  const [classDescription, setClassDescription] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const studentMemberships = educationalData.classMemberships.filter(
    (cm) =>
      cm.classId === classroom?._id &&
      cm.status === ClassMembershipStatus.MEMBER
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
    if (!classroom || !validUntil || !numUses) return;
    setCreating(true);
    try {
      await createNewClassInviteCode(
        classroom._id,
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
    if (!classroom) return;
    try {
      await revokeClassInviteCode(classroom._id, code);
    } catch (err) {
      console.error('Failed to revoke invite code', err);
    }
  };

  const handleUpdateClass = async () => {
    if (!classroom) return;
    setCreating(true);
    try {
      await updateClassNameDescription(
        classroom._id,
        className,
        classDescription
      );
    } catch (err) {
      console.error('Failed to update class', err);
    } finally {
      setCreating(false);
    }
  };

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
    <div className="column spacing">
      <Typography fontSize={16} fontWeight="bold" style={{ marginTop: 40 }}>
        EDIT CLASS
      </Typography>
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
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        disabled={
          creating ||
          !className ||
          (classroom.name === className &&
            classroom.description === classDescription)
        }
        onClick={handleUpdateClass}
      >
        {creating ? 'Saving...' : 'Save Changes'}
      </Button>

      <Typography fontSize={16} fontWeight="bold" style={{ marginTop: 40 }}>
        INVITE CODES
      </Typography>

      {classroom.inviteCodes.length === 0 ? (
        <Typography variant="body2" color="error">
          No active invite codes.
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
                      onClick={() => handleRevokeInviteCode(inviteCode.code)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={() => setInviteDialogOpen(true)}
      >
        Create Invite Code
      </Button>

      <Typography fontSize={16} fontWeight="bold" style={{ marginTop: 40 }}>
        STUDENTS
      </Typography>

      {students.length === 0 ? (
        <Typography variant="body2" color="error">
          No students have joined yet
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
        </TableContainer>
      )}

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
    </div>
  );
}
