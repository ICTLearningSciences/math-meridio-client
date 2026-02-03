/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { ACCESS_TOKEN_KEY } from "../../src/store/local-storage";
import { fetchConfigResponse } from "../fixtures/fetch-config";
import { fetchRoomsResponse } from "../fixtures/fetch-rooms";
import { fetchDiscussionStagesResponse } from "../fixtures/fetch-discussion-stages";
import { fetchEducationalDataHydrationResponse } from "../fixtures/fetch-educational-data-hydration";
import { refreshAccessTokenResponse } from "../fixtures/refresh-access-token";
import { EducationalRole, UserRole } from "../fixtures/types";

interface StaticResponse {
  /**
   * Serve a fixture as the response body.
   */
  fixture?: string;
  /**
   * Serve a static string/JSON object as the response body.
   */
  body?: string | object | object[];
  /**
   * HTTP headers to accompany the response.
   * @default {}
   */
  headers?: { [key: string]: string };
  /**
   * The HTTP status code to send.
   * @default 200
   */
  statusCode?: number;
  /**
   * If 'forceNetworkError' is truthy, Cypress will destroy the browser connection
   * and send no response. Useful for simulating a server that is not reachable.
   * Must not be set in combination with other options.
   */
  forceNetworkError?: boolean;
  /**
   * Milliseconds to delay before the response is sent.
   */
  delayMs?: number;
  /**
   * Kilobits per second to send 'body'.
   */
  throttleKbps?: number;
}

interface MockGraphQLQuery {
  query: string;
  data: any | any[];
  params?: { statusCode: number };
}
export type CypressGlobal = Cypress.cy & CyEventEmitter;

function staticResponse(s: StaticResponse): StaticResponse {
  return {
    ...{
      headers: {
        "access-control-allow-origin": window.location.origin,
        "Access-Control-Allow-Credentials": "true",
      },
      ...s,
    },
  };
}

export function cySetup(cy: CypressGlobal) {
  cy.viewport(1280, 720);
  cy.clearLocalStorage();
}

export function mockGQL(
  query: string,
  data: any | any[],
  params?: { statusCode: number }
): MockGraphQLQuery {
  return {
    query,
    data,
    params,
  };
}

export function cyInterceptGraphQL(cy: CypressGlobal, mocks: MockGraphQLQuery[]): void {
  const queryCalls: any = {};
  for (const mock of mocks) {
    queryCalls[mock.query] = 0;
  }
  cy.intercept("/graphql/graphql", (req: any) => {
    const { body } = req;
    const queryBody = body.query.replace(/\s+/g, " ").replace("\n", "").trim();
    let handled = false;
    for (const mock of mocks) {
      if (
        queryBody.match(new RegExp(`^(mutation|query) ${mock.query}[{(\\s]`))
      ) {
        const data = Array.isArray(mock.data) ? mock.data : [mock.data];
        const val = data[Math.min(queryCalls[mock.query], data.length - 1)];
        let body = val;
        req.alias = mock.query;
        req.reply(
          staticResponse({
            statusCode: mock.params?.statusCode || 200,
            body: {
              data: body,
              errors: null,
            },
          })
        );
        queryCalls[mock.query] += 1;
        handled = true;
        break;
      }
    }
    if (!handled) {
      console.error(`failed to handle query for...`);
      console.error(req);
    }
  });
}

export function cyMockLogin(cy: CypressGlobal): void {
  cy.setLocalStorage(ACCESS_TOKEN_KEY, 'fake-access-token');
  cy.setCookie('refreshTokenDev', 'fake-refresh-token', { secure: true });
}

export function cyMockDefault(
  cy: CypressGlobal,
  args: {
    userRole?: UserRole;  
    userEducationalRole?: EducationalRole;
    gqlQueries?: MockGraphQLQuery[];
  } = {}
) {
  const gqlQueries = args?.gqlQueries || [];
  cySetup(cy);
  cyMockLogin(cy);
  cyInterceptGraphQL(cy, [
    ...gqlQueries,
    // Defaults
    mockGQL(
      'RefreshAccessToken',
      refreshAccessTokenResponse(args.userRole || UserRole.USER, args.userEducationalRole || EducationalRole.STUDENT)
    ),
    mockGQL('FetchDiscussionStages', fetchDiscussionStagesResponse),
    mockGQL('FetchConfig', fetchConfigResponse),
    mockGQL('FetchStudentDataHydration', fetchEducationalDataHydrationResponse()),
    mockGQL('FetchRooms', fetchRoomsResponse()),
  ]);
}

interface MockedResData<T> {
  resData: T;
  statusCode: number;
  contentType?: string;
}

export function cyMockMultipleResponses<T>(
  cy: CypressGlobal,
  urlRegex: string,
  alias: string,
  res: MockedResData<T>[]
) {
  let numCalls = 0;
  cy.intercept(urlRegex, (req: any) => {
    const {
      statusCode: _statusCode,
      contentType,
      resData,
    } = res[numCalls % res.length];
    req.alias = alias;
    const statusCode = _statusCode
      ? Array.isArray(_statusCode)
        ? _statusCode[numCalls]
        : _statusCode
      : 200;
    req.reply(
      staticResponse({
        statusCode: statusCode,
        body: {
          data: resData,
        },
        headers: {
          "Content-Type": contentType || "application/json",
        },
      })
    );
    numCalls++;
  });
}
