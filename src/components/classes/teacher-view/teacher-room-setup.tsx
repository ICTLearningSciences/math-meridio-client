/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import * as motion from 'motion/react-client';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable, isSortable } from '@dnd-kit/react/sortable';
import { CollisionPriority } from '@dnd-kit/abstract';
import { Button, ImageList, ImageListItem, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

import {
  ClassMembership,
  ClassMembershipStatus,
  Classroom,
} from '../../../store/slices/educational-data/types';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { Player } from '../../../store/slices/player/types';
import AvatarSprite, { PlayerSprite } from '../../avatar-sprite';
import { ContainedButton } from '../../button';
import TeacherInviteCode from './teacher-invite-code';
import { useAppSelector } from '../../../store/hooks';
import { LoadStatus } from '../../../types';

function DraggablePlayer(props: {
  player?: Player;
  group: number;
  index: number;
}): JSX.Element {
  const { player, group } = props;
  const { ref, isDragging } = useSortable({
    id: player?._id || '',
    index: props.index,
    type: 'item',
    accept: 'item',
    group: group,
  });

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.1 }}
      data-dragging={isDragging}
      className="column center-div"
    >
      <AvatarSprite player={player} bgColor="rgb(218, 183, 250)" />
      <Typography variant="body2" fontSize={12} align="center">
        {player?.name}
      </Typography>
    </motion.div>
  );
}

function DroppableGroup(props: {
  groupId: number;
  children: React.ReactNode;
}): JSX.Element {
  const { ref, isDropTarget } = useDroppable({
    id: props.groupId,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div ref={ref}>
      <Typography fontSize={12}>
        {props.groupId === -1
          ? 'UNASSIGNED STUDENTS'
          : `Group ${props.groupId}`}
      </Typography>
      <div
        className="row center-div spacing"
        style={{
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: 10,
          padding: 15,
          justifyContent: 'space-evenly',
          backgroundColor: isDropTarget
            ? 'orange'
            : props.groupId === -1
            ? '#ef9a9a'
            : undefined,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

function NewDroppableGroup(): JSX.Element {
  const { ref, isDropTarget } = useDroppable({
    id: 'new',
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div ref={ref}>
      <Typography fontSize={12}>New Group</Typography>
      <div
        className="column center-div"
        style={{
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: 10,
          padding: 15,
          backgroundColor: isDropTarget ? 'orange' : undefined,
        }}
      >
        <Add fontSize="large" style={{ marginBottom: 5 }} />
        <Typography>Drag here to create a new group</Typography>
      </div>
    </div>
  );
}

export function RoomSetupView(props: { classroom: Classroom }): JSX.Element {
  const { classroom } = props;
  const { player } = useAppSelector((state) => state.playerData);
  const { educationalData, assignClassGroupsAndStart } =
    useWithEducationalData();
  const [groupSize, setGroupSize] = React.useState<number>(3);
  const [studentMembers, setStudentMembers] = React.useState<ClassMembership[]>(
    []
  );
  const [groups, setGroups] = React.useState<Record<number, ClassMembership[]>>(
    {}
  );
  const [starting, setStarting] = React.useState<boolean>(false);

  const studentMemberships = educationalData.classMemberships.filter(
    (cm) =>
      cm.classId === classroom._id &&
      cm.status === ClassMembershipStatus.MEMBER &&
      cm.userId !== player?._id // ensure teacher isn't accidentally added as a member of the room
  );
  const rooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id
  );

  React.useEffect(() => {
    setStudentMembers(getCurrentMembers());
  }, [classroom]);

  React.useEffect(() => {
    const groups: Record<number, ClassMembership[]> = {};
    for (const member of studentMembers) {
      if (member.groupId in groups) {
        groups[member.groupId].push(member);
      } else {
        groups[member.groupId] = [member];
      }
    }
    setGroups(groups);
  }, [studentMembers]);

  const getCurrentMembers = () => {
    const members: ClassMembership[] = [];
    for (const m of studentMemberships) {
      const room = rooms.find((r) =>
        r.gameData.players.find((p) => p.email === m.userEmail)
      );
      const groupId = Number.parseInt(
        room?.name.replace('Group #', '').replace(' Solution Space', '') || '-1'
      );
      const member: ClassMembership = {
        ...m,
        groupId: groupId,
        roomId: room?._id,
      };
      members.push(member);
    }
    return members;
  };

  const randomizeGroups = (groupSize: number) => {
    const members: ClassMembership[] = getCurrentMembers();
    const shuffled = members
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    for (let i = 0; i < shuffled.length; i++) {
      if (!shuffled[i].roomId) {
        let groupId = 0;
        let groupMembers = shuffled.filter((m) => m.groupId === groupId);
        while (groupMembers && groupMembers.length >= groupSize) {
          groupId++;
          groupMembers = shuffled.filter((m) => m.groupId === groupId);
        }
        shuffled[i].groupId = groupId;
      }
    }
    setStudentMembers(shuffled);
  };

  const decreaseGroupSize = () => {
    const size = Math.max(groupSize - 1, 1);
    setGroupSize(size);
    randomizeGroups(size);
  };

  const increaseGroupSize = () => {
    const size = Math.min(groupSize + 1, 10);
    setGroupSize(size);
    randomizeGroups(size);
  };

  const handleStartGame = async () => {
    setStarting(true);
    try {
      const validMembers = studentMembers.filter(
        (m) => m.userId !== player?._id && m.groupId !== -1
      );
      await assignClassGroupsAndStart(classroom._id, validMembers);
    } catch (err) {
      console.error('Failed to start class', err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="column spacing">
      <TeacherInviteCode classroom={classroom} />

      <Typography fontSize={16} fontWeight="bold" style={{ marginTop: 20 }}>
        GROUP STUDENTS
      </Typography>
      <Typography variant="body1" fontWeight="lighter">
        Drag students around to create custom groups. Click on the randomizer
        button to randomize grouped students, and use the + and - buttons to
        create larger or smaller groups
      </Typography>

      <div className="row spacing" style={{ alignItems: 'center' }}>
        <ContainedButton
          color="secondary"
          onClick={() => randomizeGroups(groupSize)}
        >
          randomize
        </ContainedButton>
        <ContainedButton color="secondary">
          groups of
          <motion.div
            whileHover={{ scale: 1.5 }}
            style={{ marginLeft: 5, marginRight: 5, marginTop: 5 }}
            onClick={decreaseGroupSize}
          >
            <Remove style={{ fontSize: 12 }} />
          </motion.div>
          <Typography>{groupSize}</Typography>
          <motion.div
            whileHover={{ scale: 1.5 }}
            style={{ marginLeft: 5, marginRight: 5, marginTop: 5 }}
            onClick={increaseGroupSize}
          >
            <Add style={{ fontSize: 12 }} />
          </motion.div>
        </ContainedButton>
      </div>

      {studentMembers.length === 0 ? (
        <Typography variant="body2" color="error" align="center">
          No students have joined yet.
        </Typography>
      ) : (
        <ImageList sx={{ width: '100%', height: '100%' }} cols={3}>
          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled) return;
              const { source, target } = event.operation;
              if (isSortable(source) && target?.isDropTarget) {
                setStudentMembers((items) => {
                  const idx = items.findIndex((s) => s.userId === source.id);
                  if (target.id === 'new') {
                    const max = Math.max(
                      ...Object.keys(groups).map((k) => Number.parseInt(k))
                    );
                    items[idx].groupId = max + 1;
                    return [...items];
                  }
                  const targetGroupIdx = Number.parseInt(`${target?.id}`);
                  if (targetGroupIdx >= 0 && targetGroupIdx <= groupSize) {
                    items[idx].groupId = targetGroupIdx;
                  }
                  return [...items];
                });
              }
            }}
          >
            {Object.entries(groups).map(([groupId, group]) => {
              const gIdx = Number.parseInt(groupId);
              return (
                <DroppableGroup key={`group-${groupId}`} groupId={gIdx}>
                  {group.map((member, mIdx) => {
                    const p = educationalData.students.find(
                      (p) => p._id === member.userId
                    );
                    return (
                      <ImageListItem key={member.userId}>
                        {member.roomId ? (
                          <PlayerSprite player={p} color="white" />
                        ) : (
                          <DraggablePlayer
                            player={p}
                            group={member.groupId}
                            index={gIdx * groupSize + mIdx}
                          />
                        )}
                      </ImageListItem>
                    );
                  })}
                </DroppableGroup>
              );
            })}
            <NewDroppableGroup />
          </DragDropProvider>
        </ImageList>
      )}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={
          starting ||
          studentMembers.length === 0 ||
          studentMembers.some((m) => m.groupId === -1) ||
          educationalData.hydrationLoadStatus.status !== LoadStatus.DONE
        }
        onClick={handleStartGame}
      >
        {starting ? 'Starting...' : 'Start Game'}
      </Button>
    </div>
  );
}
