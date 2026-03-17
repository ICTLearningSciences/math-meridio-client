/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import {
  Button,
  Card,
  CardContent,
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
import { ContentCopy } from '@mui/icons-material';

import { Classroom } from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';

export default function TeacherInviteCode(props: {
  classroom?: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { revokeClassInviteCode, createNewClassInviteCode } =
    useWithEducationalData();
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [validUntil, setValidUntil] = React.useState('');
  const [numUses, setNumUses] = React.useState('50');
  const [creating, setCreating] = React.useState(false);

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
      setNumUses('50');
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

  const handleCopyInviteCode = async (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Copied code to clipboard!', {
      position: 'top-center',
    });
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
      <ToastContainer />

      <Typography fontSize={16} fontWeight="bold">
        INVITE CODES
      </Typography>
      <Typography variant="body1" fontWeight="lighter">
        Copy and send these codes to students so they can join your class.
      </Typography>

      <Card style={{ borderRadius: 10 }}>
        <CardContent
          className="column spacing"
          style={{ position: 'relative', padding: 20 }}
        >
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
                      <TableCell>
                        <Button
                          startIcon={<ContentCopy />}
                          size="small"
                          onClick={() => handleCopyInviteCode(inviteCode.code)}
                        >
                          {inviteCode.code}
                        </Button>
                      </TableCell>
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
            </TableContainer>
          )}
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => setInviteDialogOpen(true)}
          >
            Create Invite Code
          </Button>
        </CardContent>
      </Card>

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
