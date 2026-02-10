/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { ClassMembership, ClassMembershipStatus, Classroom, FetchEducationalDataHydrationResponse } from "../../src/store/slices/educational-data/types";

export interface FetchStudentEducationalDataHydrationResponseGql {
    fetchStudentDataHydration: FetchEducationalDataHydrationResponse;
}

export interface FetchInstructorEducationalDataHydrationResponseGql {
    fetchInstructorDataHydration: FetchEducationalDataHydrationResponse;
}

export function defaultClassroomData(classroomOwnerId: string, classroomId: string): Classroom {
    return {
        _id: classroomId,
        name: "My Classroom",
        description: "My Classroom Description",
        createdAt: new Date(),
        archivedAt: undefined,
        teacherId: classroomOwnerId,
        inviteCodes: [],
    }
}

export function defaultClassroomMembershipData(classroomId: string, userId: string): ClassMembership {
    return {
        classId: classroomId,
        userId: userId,
        status: ClassMembershipStatus.MEMBER,
    }
}


export function fetchStudentDataHydrationResponse(): FetchStudentEducationalDataHydrationResponseGql {
    return {
        fetchStudentDataHydration: {
            classes: [],
            rooms: [],
            students: [],
            classMemberships: [],
        }
    }
}

export function fetchInstructorDataHydrationResponse(): FetchInstructorEducationalDataHydrationResponseGql {
    return {
        fetchInstructorDataHydration: {
            classes: [],
            rooms: [],
            students: [],
            classMemberships: [],
        }
    }
}