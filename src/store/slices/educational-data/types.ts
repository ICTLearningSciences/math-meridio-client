/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Room } from '../game/types';
import { Player } from '../player/types';

export interface InviteCode {
  code: string;
  validUntil?: Date;
  maxUses?: number;
  uses: number;
}

export interface Classroom {
  _id: string;
  name: string;
  description?: string;
  teacherId: string;
  inviteCodes: InviteCode[];
  createdAt: Date;
  archivedAt?: Date;
}

export const classroomDataQuery = `
    _id
    name
    description
    teacherId
    inviteCodes {
        code
        validUntil
        maxUses
        uses
    }
    createdAt
    archivedAt
  `;

export enum ClassMembershipStatus {
  MEMBER = 'Member',
  REMOVED = 'Removed',
  BLOCKED = 'Blocked',
  NONE = 'None',
}

export interface ClassMembership {
  classId: string;
  userId: string;
  status: ClassMembershipStatus;
}

export const classMembershipDataQuery = `
    classId
    userId
    status
  `;

export interface JoinClassroomResponse {
  classMembership: ClassMembership;
  classroom: Classroom;
}

export interface FetchEducationalDataHydrationResponse {
  classes: Classroom[];
  rooms: Room[];
  students: Player[];
  classMemberships: ClassMembership[];
}

export interface RoomHeartBeat {
  roomId: string;
  userId: string;
  lastHeartBeatAt: Date;
}
