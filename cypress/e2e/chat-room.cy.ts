/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, cyMockOpenAiCall, mockGQL } from "../support/functions";
import { defaultNbaStarterRoomData, createAndJoinRoomResponse } from "../fixtures/create-and-join-room";
import { joinClassroomResponse } from "../fixtures/join-class";
import { fetchRoomResponse } from "../fixtures/fetch-room";
import { defaultUser } from "../fixtures/refresh-access-token";
import { addMessageToRoom, sendMessageInGameRoomResponse } from "../fixtures/send-message-in-game-room";
import { Room } from "../../src/store/slices/game/types";
import { v4 as uuidv4 } from 'uuid';
import { asyncResponseRes } from "../fixtures/llm-requests/async-response";
import { defaultClassroomData } from "../fixtures/fetch-educational-data-hydration";

describe("Chat room screen", () => {
  const user = defaultUser;

  // IMPORTANT: the fetchRoom responses are the main driving force for the game state.
  it("Student can send a message in a room and get a response from the system", () => {
    const classId = 'test-class-id'
    const starterNbaRoom = defaultNbaStarterRoomData(classId, user);
    const nbaRoomWithUserResponse = addMessageToRoom(starterNbaRoom, {
      messageId: uuidv4(),
      sender: 'PLAYER',
      message: "Test Message",
      senderId: user._id,
      sessionId: "test-session-id",
      phaseId: "",
    });
    const nbaRoomTriggerPromptStep: Room = {
      ...nbaRoomWithUserResponse,
      gameData: {
        ...nbaRoomWithUserResponse.gameData,
        globalStateData: {
          ...nbaRoomWithUserResponse.gameData.globalStateData,
          curStageId: "collect-variables",
          curStepId: "07e7c344-dcc0-42f3-846e-cc24314f7b9e"
        }
      }
    }
    const nbaRoomNextStepAfterPromptStep: Room = addMessageToRoom({
      ...nbaRoomWithUserResponse,
      gameData: {
        ...nbaRoomWithUserResponse.gameData,
        globalStateData: {
          ...nbaRoomWithUserResponse.gameData.globalStateData,
          curStageId: "collect-variables",
          curStepId: "b8770926-4a6a-4802-b8f3-74ec6a072cb7"
        }
      }
    }, {
      messageId: uuidv4(),
      sender: 'SYSTEM',
      message: "It looks like you did not provide a proper response to my question",
      sessionId: "test-session-id",
      phaseId: "",
    });

    cyMockDefault(cy,
      {
        userEducationalRole: 'STUDENT',
        gqlQueries: [
          mockGQL('FetchStudentDataHydration', {
            fetchStudentDataHydration: {
              classes: [defaultClassroomData(user._id, classId)],
              rooms: [starterNbaRoom],
              students: [],
              gameList: [],
              classMemberships: [
                {
                  "classId": classId,
                  "groupId": -1,
                  "userId": user._id,
                  "status": 'Member',
                }
              ],
              phaseReflections: [],
              notifications: [],
            }
          }),
          mockGQL('JoinClassroom', joinClassroomResponse(user, "test-class-id")),
          mockGQL('CreateAndJoinRoom', createAndJoinRoomResponse(starterNbaRoom)),
          mockGQL('FetchRoom', [
            fetchRoomResponse(starterNbaRoom),
            fetchRoomResponse(nbaRoomWithUserResponse),
            fetchRoomResponse(nbaRoomTriggerPromptStep),
            fetchRoomResponse(nbaRoomNextStepAfterPromptStep),
          ]),
          mockGQL('SendMessage', [
            sendMessageInGameRoomResponse(starterNbaRoom),
          ]),
        ]
      });
    cyMockOpenAiCall(cy, {
      response: asyncResponseRes("{\n  \"stayed_on_topic\": \"False\"\n}")
    });
    cy.visit("/");
    cy.get("[data-cy='join-class-invite-code-input']").type("test-invite-code");
    cy.get("[data-cy='join-class-join-button']").click();
    cy.get("[data-cy='student-classroom-card-test-class-id']").click();
    cy.contains("My Classroom")
    cy.get("[data-cy='join-room-btn']").click();
    cy.contains("Problem")

    // new user message gets triggered by room messages, so no need to send a message here

    // Assert that the generic llm request gets called
    cy.wait(5000);
    cy.contains("It looks like you did not provide a proper response to my question")
  })
})
