/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import { EducationalRole } from "../../src/store/slices/player/types";
import { joinClassroomResponse } from "../fixtures/join-class";
import { defaultUser } from "../fixtures/refresh-access-token";
import { createAndJoinRoomResponse, defaultNbaStarterRoomData } from "../fixtures/create-and-join-room";
import { fetchRoomResponse } from "../fixtures/fetch-room";

describe("Student classes screen", () => {
  const user = defaultUser;
  it("Shows students classes screen", () => {
    cyMockDefault(cy,
      {
        userEducationalRole: EducationalRole.STUDENT
      });
    cy.visit("/");
    cy.contains("My Classes")
    cy.contains("You haven't joined any classes yet.")
  })

  it("student can join a class", () => {
    cyMockDefault(cy,
      {
        userEducationalRole: EducationalRole.STUDENT,
        gqlQueries: [
          mockGQL('JoinClassroom', joinClassroomResponse(user, "test-class-id")),
        ]
      });
    cy.visit("/");
    cy.contains("My Classes")
    cy.contains("You haven't joined any classes yet.")

    cy.get("[data-cy='join-class-invite-code-input']").type("test-invite-code");
    cy.get("[data-cy='join-class-join-button']").click();
    cy.contains("My Classroom")
  })

  it("student can create a game room in a classroom", ()=>{
    const defaultRoom = defaultNbaStarterRoomData("test-class-id", user);
    cyMockDefault(cy,
      {
        userEducationalRole: EducationalRole.STUDENT,
        gqlQueries: [
          mockGQL('JoinClassroom', joinClassroomResponse(user, "test-class-id")),
          mockGQL('CreateAndJoinRoom', createAndJoinRoomResponse(defaultRoom)),
          mockGQL('FetchRoom', fetchRoomResponse(defaultRoom)),
        ]
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
  })

})
