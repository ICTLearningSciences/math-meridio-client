/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import * as motion from "motion/react-client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button, ImageList, ImageListItem, Typography } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

import type {
  ClassMembership,
  Classroom,
} from "../../../store/slices/educational-data/types";
import { useWithEducationalData } from "../../../store/slices/educational-data/use-with-educational-data";
import AvatarSprite, { PlayerSprite } from "../../avatar-sprite";
import { ContainedButton } from "../../button";
import { useAppSelector } from "../../../store/hooks";
import { TeacherEditClass } from "./teacher-manage-class";
import { useWithWindow } from "../../../hooks/use-with-window";
import { copyAndSet } from "../../../helpers";

export function RoomSetupView(props: {
  classroom: Classroom;
}): React.ReactNode {
  const { classroom } = props;
  const { player } = useAppSelector((state) => state.playerData);
  const { educationalData, assignClassGroupsAndStart } =
    useWithEducationalData();
  const { isMobile } = useWithWindow();
  const [groupSize, setGroupSize] = React.useState<number>(3);
  const [studentMembers, setStudentMembers] = React.useState<ClassMembership[]>(
    [],
  );
  const [groups, setGroups] = React.useState<Record<number, ClassMembership[]>>(
    {},
  );
  const [starting, setStarting] = React.useState<boolean>(false);

  const studentMemberships = educationalData.classMemberships.filter(
    (cm) =>
      cm.classId === classroom._id &&
      cm.status === "Member" &&
      cm.userId !== player?._id, // ensure teacher isn't accidentally added as a member of the room
  );
  const rooms = educationalData.rooms.filter(
    (r) => r.classId === classroom._id,
  );

  React.useEffect(() => {
    const members: ClassMembership[] = [];
    for (const member of studentMemberships) {
      const cur = studentMembers.find((m) => m.userId === member.userId);
      members.push({
        ...member,
        groupId: cur?.groupId || member.groupId,
      });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStudentMembers(members);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGroups(groups);
  }, [studentMembers]);

  const getCurrentMembers = () => {
    const members: ClassMembership[] = [];
    for (const member of studentMemberships) {
      members.push({ ...member });
    }
    return members;
  };

  const randomizeGroups = (groupSize: number) => {
    const shuffled = getCurrentMembers()
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    let groupId = 1;
    for (let i = 0; i < shuffled.length; i++) {
      if (classroom.startedAt && shuffled[i].groupId) continue;
      let curGroupSize = shuffled.filter((m) => m.groupId === groupId).length;
      while (curGroupSize >= groupSize) {
        curGroupSize = shuffled.filter((m) => m.groupId === ++groupId).length;
      }
      shuffled[i].groupId = groupId;
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
        (m) => m.userId !== player?._id && m.groupId,
      );
      await assignClassGroupsAndStart(classroom._id, validMembers);
    } catch (err) {
      console.error("Failed to start class", err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="column spacing">
      <TeacherEditClass classroom={classroom} />

      <Typography style={{ marginTop: 20, fontSize: 16, fontWeight: "bold" }}>
        GROUP STUDENTS
      </Typography>
      <Typography variant="body1" style={{ fontWeight: "lighter" }}>
        Drag students around to create custom groups. Click on the randomizer
        button to randomize grouped students, and use the + and - buttons to
        create larger or smaller groups
      </Typography>

      <div className="row spacing" style={{ alignItems: "center" }}>
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
        <ImageList
          sx={{ width: "100%", height: "100%" }}
          cols={isMobile ? 1 : 3}
        >
          <DragDropContext
            onDragEnd={(event) => {
              if (!event.destination) return;
              const idx = studentMembers.findIndex(
                (s) => s.userId === event.draggableId,
              );
              if (event.destination.droppableId === "new") {
                const max = Math.max(
                  ...Object.keys(groups).map((k) => Number.parseInt(k)),
                );
                setStudentMembers(
                  copyAndSet(studentMembers, idx, {
                    ...studentMembers[idx],
                    groupId: max + 1,
                  }),
                );
              } else {
                setStudentMembers(
                  copyAndSet(studentMembers, idx, {
                    ...studentMembers[idx],
                    groupId: Number.parseInt(event.destination.droppableId),
                  }),
                );
              }
            }}
          >
            {Object.entries(groups).map(([gIdx, group]) => {
              return (
                <div key={gIdx}>
                  <Typography style={{ fontSize: 12 }}>
                    {gIdx !== "0" ? `Group ${gIdx}` : "UNASSIGNED STUDENTS"}
                  </Typography>
                  <Droppable
                    droppableId={`${gIdx}`}
                    type="PERSON"
                    direction="horizontal"
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className="row"
                        style={{
                          border: "1px solid white",
                          borderRadius: 10,
                          padding: 15,
                          justifyContent: "space-evenly",
                          backgroundColor: snapshot.isDraggingOver
                            ? "orange"
                            : gIdx === "0"
                              ? "#ef9a9a"
                              : undefined,
                        }}
                        {...provided.droppableProps}
                      >
                        {group.map((member, mIdx) => {
                          const player = educationalData.students.find(
                            (p) => p._id === member.userId,
                          );
                          const assignment = studentMemberships.find(
                            (m) => m.userId === member.userId,
                          );
                          return (
                            <ImageListItem key={member.userId}>
                              {classroom.startedAt && assignment?.groupId ? (
                                <PlayerSprite player={player} color="white" />
                              ) : (
                                <Draggable
                                  key={player?._id}
                                  draggableId={player?._id || `${mIdx}`}
                                  index={mIdx}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="column center-div"
                                      >
                                        <AvatarSprite
                                          player={player}
                                          bgColor="rgb(218, 183, 250)"
                                        />
                                        <Typography
                                          variant="body2"
                                          style={{
                                            fontSize: 12,
                                            textAlign: "center",
                                          }}
                                        >
                                          {player?.name}
                                        </Typography>
                                      </motion.div>
                                    </div>
                                  )}
                                </Draggable>
                              )}
                            </ImageListItem>
                          );
                        })}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
            <div>
              <Typography style={{ fontSize: 12 }}>New Group</Typography>
              <Droppable droppableId="new" type="PERSON" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="column center-div"
                    style={{
                      border: "1px solid white",
                      borderRadius: 10,
                      padding: 15,
                      justifyContent: "space-evenly",
                      backgroundColor: snapshot.isDraggingOver
                        ? "orange"
                        : undefined,
                    }}
                    {...provided.droppableProps}
                  >
                    <Add fontSize="large" />
                    <Typography>Drag here to create a new group</Typography>
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </ImageList>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={
          starting ||
          studentMembers.length === 0 ||
          studentMembers.some((m) => !m.groupId) ||
          educationalData.hydrationLoadStatus.status !== 2
        }
        onClick={handleStartGame}
      >
        {rooms.length === 0 ? (starting ? "Starting..." : "Start Game") : ""}
        {rooms.length > 0 ? (starting ? "Saving..." : "Save Groups") : ""}
      </Button>
    </div>
  );
}
