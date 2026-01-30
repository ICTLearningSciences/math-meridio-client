/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { execGql } from '../../../api-helpers';
import { EducationalRole, UserAccessToken } from './types';

export const userDataQuery = `
  _id
  googleId
  name
  description
  avatar {
    id
    type
    description
    variant
    variants
  }
  email
  userRole
  loginService
  lastLoginAt
  educationalRole
`;

export async function loginGoogle(
  accessToken: string,
  educationalLoginRole: EducationalRole
): Promise<UserAccessToken> {
  return await execGql<UserAccessToken>(
    {
      query: `
        mutation LoginGoogle($accessToken: String!, $educationalLoginRole: String!) {
          loginGoogle(accessToken: $accessToken, educationalLoginRole: $educationalLoginRole) {
            user {
              ${userDataQuery}
            }
            accessToken
          }
        }
      `,
      variables: {
        accessToken: accessToken,
        educationalLoginRole: educationalLoginRole,
      },
    },
    // login responds with set-cookie, w/o withCredentials it doesnt get stored
    {
      dataPath: 'loginGoogle',
      axiosConfig: {
        withCredentials: true,
      },
    }
  );
}

export async function refreshAccessToken(): Promise<UserAccessToken> {
  return execGql<UserAccessToken>(
    {
      query: `
        mutation RefreshAccessToken{
          refreshAccessToken{
            user {
              ${userDataQuery}
            }
            accessToken
          }
          }
      `,
    },
    // login responds with set-cookie, w/o withCredentials it doesnt get stored
    {
      dataPath: 'refreshAccessToken',
      axiosConfig: {
        withCredentials: true,
      },
    }
  );
}
