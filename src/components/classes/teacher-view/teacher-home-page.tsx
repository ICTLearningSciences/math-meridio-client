/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import * as motion from 'motion/react-client';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import { useSortable } from '@dnd-kit/react/sortable';
import { CollisionPriority } from '@dnd-kit/abstract';
import { Button, ImageList, ImageListItem, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

import {
  ClassMembership,
  ClassMembershipStatus,
  Classroom,
} from '../../../store/slices/educational-data/types';
import { useAppSelector } from '../../../store/hooks';
import { useWithEducationalData } from '../../../store/slices/educational-data/use-with-educational-data';
import { Player } from '../../../store/slices/player/types';
import AvatarSprite from '../../avatar-sprite';
import { ContainedButton } from '../../button';
import { getRandomAvatar } from '../../../helpers';

function DraggablePlayer(props: {
  player: Player;
  group: number;
  index: number;
}): JSX.Element {
  const { player, group } = props;
  const { ref, isDragging } = useSortable({
    id: player._id,
    index: props.index,
    type: "item",
    accept: "item",
    group: group
  });

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.1 }}
      data-dragging={isDragging}
      className="column center-div"
    >
      <AvatarSprite player={player} bgColor='rgb(218, 183, 250)' />
      <Typography variant="body2" fontSize={12} align="center">
        {player.name}
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
    <div
      ref={ref}
      className="row center-div spacing"
      style={{ borderStyle: 'solid', borderWidth: 1, borderRadius: 10, padding: 15, justifyContent: "space-evenly", backgroundColor: isDropTarget ? "orange" : undefined }}
    >
      {props.children}
    </div>
  );
}

function RoomSetupView(props: {
  classId: string;
  onStartGame: () => void;
}): JSX.Element {
  const { classId } = props;
  const { player } = useAppSelector((state) => state.playerData);
  const { educationalData } = useWithEducationalData();
  const [groupSize, setGroupSize] = React.useState<number>(3);
  const [studentMemberships, setStudentMemberships] = React.useState<
    ClassMembership[]
  >([]);
  const [groups, setGroups] = React.useState<Record<number, ClassMembership[]>>(
    {}
  );

  React.useEffect(() => {
    const members = educationalData.classMemberships.filter(
      (cm) =>
        cm.classId === props.classId &&
        cm.status === ClassMembershipStatus.MEMBER
    )
      .sort((a, b) => {
        if (a.groupId < b.groupId) return -1;
        if (a.groupId > b.groupId) return 1;
        return 0;
      })
    let groupId = 0;
    for (let i = 0; i < members.length; i++) {
      members[i] = {
        ...members[i],
        groupId: groupId,
      };
      if ((i + 1) % groupSize === 0) {
        groupId++;
      }
    }
    setStudentMemberships(members);
  }, [classId, groupSize]);

  React.useEffect(() => {
    const groups: Record<number, ClassMembership[]> = {};
    let group: ClassMembership[] = [];
    let groupId = 0;
    for (let i = 0; i < studentMemberships.length; i++) {
      group.push(studentMemberships[i]);
      if ((i + 1) % groupSize === 0) {
        groups[i] = group;
        group = [];
        groupId++;
      }
    }
    setGroups(groups);

  }, [studentMemberships]);

  const randomizeGroups = () => {
    const shuffled = studentMemberships
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    let group = 0;
    for (let i = 0; i < shuffled.length; i++) {
      shuffled[i] = {
        ...shuffled[i],
        groupId: group,
      };
      if ((i + 1) % groupSize === 0) group++;
    }
    setStudentMemberships(shuffled);
  };

  const decreaseGroupSize = () => {
    setGroupSize(Math.max(groupSize - 1, 1));
  };

  const increaseGroupSize = () => {
    setGroupSize(Math.min(groupSize + 1, 10));
  };

  // const onHandleDrag = (e: any) => {

  // }

  return (
    <div className="column spacing" style={{ marginTop: 40 }}>
      <Typography variant="body2" color="error" align="center">
        You have not yet started a game.
      </Typography>

      <Typography fontSize={16} fontWeight="bold" style={{ marginTop: 40 }}>
        GROUP STUDENTS
      </Typography>
      <Typography variant="body1" fontWeight="lighter">
        Drag students around to create custom groups. Click on the randomizer
        button to randomize grouped students, and use the + and - buttons to
        create larger or smaller groups
      </Typography>

      <div className="row spacing" style={{ alignItems: 'center' }}>
        <ContainedButton color="secondary" onClick={randomizeGroups}>
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

      {studentMemberships.length === 0 ? (
        <Typography variant="body2" color="error" align="center">
          No students have joined yet.
        </Typography>
      ) : (
        <ImageList sx={{ width: '100%', height: '100%' }} cols={3}>
          <DragDropProvider onDragEnd={(e) => {
            if (e.operation.target?.id !== undefined && e.operation.source?.id !== undefined) {
              console.log(`move player ${e.operation.source?.id} to group ${e.operation.target?.id}`)
              const idx = studentMemberships.findIndex(s => s.userId === e.operation.source?.id && s.groupId === e.operation.target?.id);
              console.log(idx);

              // studentMemberships[idx] = { ...studentMemberships[idx], groupId: e.operation.target.id as number }

              // console.log(studentMemberships);

              // setStudentMemberships(studentMemberships);
              // studentMemberships[idx].groupId = e.operation.target.id as number
            }
          }}>
            {Object.values(groups).map((groupMembers, gIdx) => {
              return (
                <DroppableGroup key={`group-${gIdx}`} groupId={gIdx}>
                  {groupMembers.map((member, mIdx) => {
                    const p = educationalData.students.find(
                      (p) => p._id === member.userId
                    );
                    return (
                      <ImageListItem key={member.userId}>
                        <DraggablePlayer
                          player={
                            p
                              ? p
                              : {
                                ...player!,
                                _id: `${member.userId}`,
                                avatar: getRandomAvatar(),
                                name: `Player${(gIdx * groupSize) + mIdx}`,
                              }
                          }
                          group={member.groupId}
                          index={(gIdx * groupSize) + mIdx}
                        />
                      </ImageListItem>
                    );
                  })}
                </DroppableGroup>
              );
            })}
          </DragDropProvider>
        </ImageList>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={props.onStartGame}
      >
        Start Game
      </Button>
    </div>
  );
}

function ActiveSessionView(): JSX.Element {
  return <div></div>;
}

export default function TeacherHome(props: {
  classroom?: Classroom;
}): JSX.Element {
  const { classroom } = props;
  const { educationalData } = useWithEducationalData();

  const gameRooms = educationalData.rooms.filter(
    (r) => r.classId === classroom?._id
  );

  const handleStartGame = () => {
    console.log('');
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

  // if (gameRooms.length === 0) {
  if (!classroom.startedAt) {
    return (
      <RoomSetupView classId={classroom._id} onStartGame={handleStartGame} />
    );
  }
  return <ActiveSessionView />;
}
