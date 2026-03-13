/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { execGql } from '../../../api-helpers';
import {
  ClassMembership,
  classMembershipDataQuery,
  Classroom,
  classroomDataQuery,
  FetchEducationalDataHydrationResponse,
  JoinClassroomResponse,
  phaseReflectionsDataQuery,
} from './types';
import { userDataQuery } from '../player/api';
import { fullRoomQueryData } from '../../../api';
import { requireLocalStorageGet as localStorageGet } from '../../local-storage';
import { ACCESS_TOKEN_KEY } from '../../local-storage';
import { LearningObjective, Room } from '../game/types';
import { Connection } from '../../../types';

export async function createClassroom(): Promise<Classroom> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Classroom>(
    {
      query: `
            mutation CreateClassroom {
                createClassroom {
                    ${classroomDataQuery}
                }
            }
            `,
    },
    {
      dataPath: 'createClassroom',
      accessToken: accessToken,
    }
  );
}

export async function updateClassNameDescription(
  classId: string,
  name: string,
  description: string
): Promise<Classroom> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Classroom>(
    {
      query: `
          mutation UpdateClassNameDescription($classId: String!, $name: String!, $description: String!) {
            updateClassNameDescription(classId: $classId, name: $name, description: $description) {
                ${classroomDataQuery}
            }
          }
            `,
      variables: {
        classId,
        name,
        description,
      },
    },
    {
      dataPath: 'updateClassNameDescription',
      accessToken: accessToken,
    }
  );
}

export async function createNewClassInviteCode(
  classId: string,
  validUntil: Date,
  numUses: number
): Promise<Classroom> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Classroom>(
    {
      query: `
            mutation CreateNewClassInviteCode($classId: String!, $validUntil: Date!, $numUses: Int!) {
                createNewClassInviteCode(classId: $classId, validUntil: $validUntil, numUses: $numUses) {
                    ${classroomDataQuery}
                    }
                }
            `,
      variables: {
        classId,
        validUntil,
        numUses,
      },
    },
    {
      dataPath: 'createNewClassInviteCode',
      accessToken: accessToken,
    }
  );
}

export async function revokeClassInviteCode(
  classId: string,
  classroomCode: string
): Promise<Classroom> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Classroom>(
    {
      query: `
            mutation RevokeClassInviteCode($classId: String!, $classroomCode: String!) {
                revokeClassInviteCode(classId: $classId, classroomCode: $classroomCode) {
                    ${classroomDataQuery}
                }
            }
            `,
      variables: {
        classId,
        classroomCode,
      },
    },
    {
      dataPath: 'revokeClassInviteCode',
      accessToken: accessToken,
    }
  );
}

export async function joinClassroom(
  inviteCode: string
): Promise<JoinClassroomResponse> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<JoinClassroomResponse>(
    {
      query: `
  mutation JoinClassroom($inviteCode: String!) {
    joinClassroom(inviteCode: $inviteCode) {
        classMembership {${classMembershipDataQuery}}
        classroom {
            ${classroomDataQuery}
        }
    }
  }
            `,
      variables: {
        inviteCode,
      },
    },
    {
      dataPath: 'joinClassroom',
      accessToken: accessToken,
    }
  );
}

export async function leaveClassroom(
  classId: string
): Promise<ClassMembership> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<ClassMembership>(
    {
      query: `
  mutation LeaveClassroom($classId: String!) {
    leaveClassroom(classId: $classId) {
        ${classMembershipDataQuery}
    }
  }
            `,
      variables: {
        classId,
      },
    },
    {
      dataPath: 'leaveClassroom',
      accessToken: accessToken,
    }
  );
}

export async function removeStudentFromClass(
  studentId: string,
  classId: string
): Promise<ClassMembership> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<ClassMembership>(
    {
      query: `
  mutation RemoveStudentFromClass($studentId: String!, $classId: String!) {
    removeStudentFromClass(studentId: $studentId, classId: $classId) {
        ${classMembershipDataQuery}
    }
  }
            `,
      variables: {
        studentId,
        classId,
      },
    },
    {
      dataPath: 'removeStudentFromClass',
      accessToken: accessToken,
    }
  );
}

export async function blockStudentFromClass(
  studentId: string,
  classId: string
): Promise<ClassMembership> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<ClassMembership>(
    {
      query: `  mutation BlockStudentFromClass($studentId: String!, $classId: String!) {
    blockStudentFromClass(studentId: $studentId, classId: $classId) {
        ${classMembershipDataQuery}
    }
  }`,
      variables: {
        studentId,
        classId,
      },
    },
    {
      dataPath: 'blockStudentFromClass',
      accessToken: accessToken,
    }
  );
}

export async function unblockStudentFromClass(
  studentId: string,
  classId: string
): Promise<ClassMembership> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<ClassMembership>(
    {
      query: `  mutation UnblockStudentFromClass($studentId: String!, $classId: String!) {
    unblockStudentFromClass(studentId: $studentId, classId: $classId) {
        ${classMembershipDataQuery}
    }
  }`,
      variables: {
        studentId,
        classId,
      },
    },
    {
      dataPath: 'unblockStudentFromClass',
      accessToken: accessToken,
    }
  );
}

export async function assignStudentToGroup(
  studentId: string,
  classId: string,
  groupId: number
): Promise<ClassMembership> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<ClassMembership>(
    {
      query: `mutation AssignStudentToGroup($studentId: String!, $classId: String!, $groupId: Int!) {
    assignStudentToGroup(studentId: $studentId, classId: $classId, groupId: $groupId) {
        ${classMembershipDataQuery}
    }
  }`,
      variables: {
        studentId,
        classId,
        groupId,
      },
    },
    {
      dataPath: 'assignStudentToGroup',
      accessToken: accessToken,
    }
  );
}

export interface AssignClassGroupsAndStartResponse {
  updatedClassroom: Classroom;
  createdRooms: Room[];
}

export async function assignClassGroupsAndStart(
  classId: string,
  groups: ClassMembership[]
): Promise<AssignClassGroupsAndStartResponse> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<AssignClassGroupsAndStartResponse>(
    {
      query: `mutation AssignClassGroupsAndStart($classId: String!, $groups: [ClassMembershipInputType]!) {
    assignClassGroupsAndStart(classId: $classId, groups: $groups) {
        updatedClassroom {
            ${classroomDataQuery}
        }
        createdRooms {
            ${fullRoomQueryData}
        }
    }
  }`,
      variables: {
        classId,
        groups,
      },
    },
    {
      dataPath: 'assignClassGroupsAndStart',
      accessToken: accessToken,
    }
  );
}

export async function adjustClassroomArchiveStatus(
  classId: string,
  setArchived: boolean
): Promise<Classroom> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Classroom>(
    {
      query: `  mutation AdjustClassroomArchiveStatus($classId: String!, $setArchived: Boolean!) {
    adjustClassroomArchiveStatus(classId: $classId, setArchived: $setArchived) {
        ${classroomDataQuery}
    }
  }`,
      variables: {
        setArchived,
        classId,
      },
    },
    {
      dataPath: 'adjustClassroomArchiveStatus',
      accessToken: accessToken,
    }
  );
}

export async function fetchInstructorDataHydration(): Promise<FetchEducationalDataHydrationResponse> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<FetchEducationalDataHydrationResponse>(
    {
      query: `  query FetchInstructorDataHydration {
    fetchInstructorDataHydration {
        classes {
            ${classroomDataQuery}
        }
        rooms {
            ${fullRoomQueryData}
        }
        students {
           ${userDataQuery}
        }
        classMemberships {
            ${classMembershipDataQuery}
        }
        phaseReflections {
            ${phaseReflectionsDataQuery}
        }
        gameList {
            id
            name
        }
    }
  }`,
    },
    {
      dataPath: 'fetchInstructorDataHydration',
      accessToken: accessToken,
    }
  );
}

export async function fetchStudentDataHydration(): Promise<FetchEducationalDataHydrationResponse> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<FetchEducationalDataHydrationResponse>(
    {
      query: `  query FetchStudentDataHydration {
    fetchStudentDataHydration {
        classes {
            ${classroomDataQuery}
        }
        rooms {
            ${fullRoomQueryData}
        }
        students {
           ${userDataQuery}
        }
        classMemberships {
            ${classMembershipDataQuery}
        }
    }
  }`,
    },
    {
      dataPath: 'fetchStudentDataHydration',
      accessToken: accessToken,
    }
  );
}

export const createClassMembershipQuery = `
  mutation CreateClassMembership($classId: String!, $userEmail: String!) {
    createClassMembership(classId: $classId, userEmail: $userEmail) {
      ${classMembershipDataQuery}
    }
  }
`;

export async function createClassMembership(
  classId: string,
  userEmail: string
): Promise<ClassMembership> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<ClassMembership>(
    {
      query: createClassMembershipQuery,
      variables: {
        classId,
        userEmail,
      },
    },
    {
      dataPath: 'createClassMembership',
      accessToken: accessToken,
    }
  );
}

export const shareClassroomWithInstructorMutation = `
  mutation ShareClassroomWithInstructor($classId: String!, $instructorEmail: String!) {
    shareClassroomWithInstructor(classId: $classId, instructorEmail: $instructorEmail) {
      ${classroomDataQuery}
    }
  }
`;

export async function shareClassroomWithInstructor(
  classId: string,
  instructorEmail: string
): Promise<Classroom> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Classroom>(
    {
      query: shareClassroomWithInstructorMutation,
      variables: { classId, instructorEmail },
    },
    {
      dataPath: 'shareClassroomWithInstructor',
      accessToken: accessToken,
    }
  );
}

const assignGameToGameRoomMutation = `
  mutation AssignGameToGameRoom($roomId: String!, $gameId: String!) {
    assignGameToGameRoom(roomId: $roomId, gameId: $gameId) {
      ${fullRoomQueryData}
    }
  }
`;

export async function assignGameToGameRoom(
  roomId: string,
  gameId: string
): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Room>(
    {
      query: assignGameToGameRoomMutation,
      variables: { roomId, gameId },
    },
    {
      dataPath: 'assignGameToGameRoom',
      accessToken: accessToken,
    }
  );
}

export const setPlayerNeedsHelpInRoomMutation = `
  mutation SetNeedsHelpInGameRoom($roomId: String!, $needsHelp: Boolean!) {
    setNeedsHelpInGameRoom(roomId: $roomId, needsHelp: $needsHelp) {
        ${fullRoomQueryData}
    }
  }
`;

export async function setPlayerNeedsHelpInRoom(
  roomId: string,
  needsHelp: boolean
): Promise<Room> {
  const accessToken = localStorageGet<string>(ACCESS_TOKEN_KEY);
  return await execGql<Room>(
    {
      query: setPlayerNeedsHelpInRoomMutation,
      variables: { roomId, needsHelp },
    },
    {
      dataPath: 'setNeedsHelpInGameRoom',
      accessToken: accessToken,
    }
  );
}

export const fullLearningObjectiveData = `
  _id
  variableName
  title
  criteria
`;

export const createLearningObjectiveMutation = `
        mutation CreateNewLearningObjective($learningObjective: LearningObjectiveTypeInput!) {
          createNewLearningObjective(learningObjective: $learningObjective) {
      ${fullLearningObjectiveData}
    }
  }
`;


export async function createLearningObjective(
  learningObjective: Omit<LearningObjective, '_id'>
): Promise<LearningObjective> {
  return await execGql<LearningObjective>(
    {
      query: createLearningObjectiveMutation,
      variables: { learningObjective },
    },
    {
      dataPath: 'createNewLearningObjective',
    }
  );
}

export const updateLearningObjectiveMutation = `
        mutation UpdateLearningObjective($learningObjectiveId: String!, $learningObjective: LearningObjectiveTypeInput!) {
          updateLearningObjective(learningObjectiveId: $learningObjectiveId, learningObjective: $learningObjective) {
      ${fullLearningObjectiveData}
    }
  }
`;

export async function updateLearningObjective(
  learningObjectiveId: string,
  learningObjective: Omit<LearningObjective, '_id'>
): Promise<LearningObjective> {
  return await execGql<LearningObjective>(
    {
      query: updateLearningObjectiveMutation,
      variables: { learningObjectiveId, learningObjective },
    },
    {
      dataPath: 'updateLearningObjective',
    }
  );
}

export const fetchLearningObjectivesQuery = `
  query FetchLearningObjectives($filter: String!, $limit: Int) {
    fetchLearningObjectives(filter: $filter, limit: $limit) {
        edges {
          node {
            ${fullLearningObjectiveData}
          }
        }
    }
  }
`;

export async function fetchLearningObjectives(
  limit = 9999
): Promise<LearningObjective[]> {
  const res = await execGql<Connection<LearningObjective>>(
    {
      query: fetchLearningObjectivesQuery,
      variables: { filter: JSON.stringify({}), limit },
    },
    {
      dataPath: 'fetchLearningObjectives',
    }
  );
  return res.edges.map((edge) => edge.node);
}