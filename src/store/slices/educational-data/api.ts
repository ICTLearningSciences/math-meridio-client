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
} from './types';
import { userDataQuery } from '../player/api';
import { fullRoomQueryData } from '../../../api';
import { requireLocalStorageGet as localStorageGet } from '../../local-storage';
import { ACCESS_TOKEN_KEY } from '../../local-storage';

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
