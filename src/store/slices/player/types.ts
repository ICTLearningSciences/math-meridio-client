/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface Avatar {
  type: string;
  id: string;
  description: string;
  variant?: number;
  variants?: string[];
}

export interface Player {
  _id: string;
  googleId: string;
  email: string;
  userRole: UserRole;
  loginService: LoginService;
  lastLoginAt: Date;
  educationalRole?: EducationalRole;
  clientId: string;
  name: string;
  description: string;
  avatar: Avatar[];
}

export enum UserRole {
  USER = 'USER',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  ADMIN = 'ADMIN',
}

export enum EducationalRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
}

export interface UserAccessToken {
  user: Player;
  accessToken: string;
  expirationDate: string;
}

export enum LoginService {
  GOOGLE = 'GOOGLE',
}
