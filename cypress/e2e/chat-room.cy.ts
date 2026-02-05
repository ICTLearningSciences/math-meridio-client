/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, cyMockOpenAiCall, mockGQL } from "../support/functions";
import { EducationalRole } from "../fixtures/types";
import { defaultNbaStarterRoomData, createAndJoinRoomResponse } from "../fixtures/create-and-join-room";
import { joinClassroomResponse } from "../fixtures/join-class";
import { updateRoomResponse } from "../fixtures/update-room";
import { fetchRoomResponse } from "../fixtures/fetch-room";
import { defaultUser } from "../fixtures/refresh-access-token";
import { addMessageToRoom, sendMessageInGameRoomResponse } from "../fixtures/send-message-in-game-room";
import { Room, SenderType } from "../../src/store/slices/game";
import { v4 as uuidv4 } from 'uuid';
import { asyncResponseRes } from "../fixtures/llm-requests/async-response";

describe("Chat room screen", () => {
    const user = defaultUser;

    // IMPORTANT: the fetchRoom responses are the main driving force for the game state.
    it("Student can send a message in a room and get a response from the system", ()=>{
        const starterNbaRoom = defaultNbaStarterRoomData("test-class-id", user);
        const nbaRoomWithUserResponse = addMessageToRoom(starterNbaRoom, {
          id: uuidv4(),
          sender: SenderType.PLAYER,
          message: "Test Message",
          senderId: user._id,
          sessionId: "test-session-id",
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
            id: uuidv4(),
            sender: SenderType.SYSTEM,
            message: "It looks like you did not provide a proper response to my question",
            sessionId: "test-session-id",
        });

        cyMockDefault(cy,
          {
            userEducationalRole: EducationalRole.STUDENT,
            gqlQueries: [
              mockGQL('JoinClassroom', joinClassroomResponse(user, "test-class-id")),
              mockGQL('CreateAndJoinRoom', createAndJoinRoomResponse(starterNbaRoom)),
              mockGQL('UpdateRoom', [
                updateRoomResponse(starterNbaRoom),
            ]),
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
        cy.get("[data-cy='game-card-basketball']").click();
        cy.get("[data-cy='create-game-room-button']").click();
        cy.get("[data-cy='begin-game-button']").click();
        cy.contains("Simulation")

        // new user message gets triggered by room messages, so no need to send a message here

        // Assert that the generic llm request gets called
        cy.wait("@genericLlmRequest", {timeout: 8000})
        cy.wait("@genericLlmRequestStatus", {timeout: 8000})
        cy.contains("It looks like you did not provide a proper response to my question")
      })


    // Note: The logged in user during the tests will be the owner of the room and therefore manage the game state locally.
    // Note: To mock multiple students, we just need to update the room polling to have message from other users.
    it("Other student can send a message in a room and get responses from the system", ()=>{
        const starterNbaRoom = defaultNbaStarterRoomData("test-class-id", user);
        const nbaRoomWithUserResponse = addMessageToRoom(starterNbaRoom, {
          id: uuidv4(),
          sender: SenderType.PLAYER,
          message: "Other User Message",
          senderId: "other-student-id",
          sessionId: "test-session-id",
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
            id: uuidv4(),
            sender: SenderType.SYSTEM,
            message: "It looks like you did not provide a proper response to my question",
            sessionId: "test-session-id",
        });

        cyMockDefault(cy,
          {
            userEducationalRole: EducationalRole.STUDENT,
            gqlQueries: [
              mockGQL('JoinClassroom', joinClassroomResponse(user, "test-class-id")),
              mockGQL('CreateAndJoinRoom', createAndJoinRoomResponse(starterNbaRoom)),
              mockGQL('UpdateRoom', [
                updateRoomResponse(starterNbaRoom),
            ]),
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
        cy.get("[data-cy='game-card-basketball']").click();
        cy.get("[data-cy='create-game-room-button']").click();
        cy.get("[data-cy='begin-game-button']").click();
        // Assert that the generic llm request gets called, even when message from other student
        cy.wait("@genericLlmRequest", {timeout: 8000})
        cy.wait("@genericLlmRequestStatus", {timeout: 8000})
        cy.contains("It looks like you did not provide a proper response to my question")
    })

    // TODO:
    // Have the current step set to a request user input step with waitForAllStudentResponses
    // ENSURE it waits until a message comes in from all students
    
    describe("waitForAllStudentResponses is true", () => {

        // NOTE: to emulate, just add messages from each student 1 at a time in the FetchRoom responses.
        it("the game will wait for all students to respond before progressing to the next step")

        // AWAY status should be set in the playerStateData as awayForStepIds: string[] = ["step-id"]
        it("the game will continue if at least 1 student responds for the step and all others are set as AWAY for that step")

        it("if the step does not get passed, the game will NOT require all students to respond again.")
    })
})
