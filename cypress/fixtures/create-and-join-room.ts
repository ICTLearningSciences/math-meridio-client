/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Room, SenderType } from "../../src/store/slices/game/types";
import { Player } from "../../src/store/slices/player/types";
import { v4 as uuidv4 } from 'uuid';


export interface CreateAndJoinRoomResponse {
    createAndJoinRoom: Room;
}

export function defaultNbaStarterRoomData(classId: string, user: Player): Room {
    return {
        "_id": "test-room-id",
        "name": "NBA Starter Room",
        "classId": classId,
        "gameData": {
            "persistTruthGlobalStateData": [],
            "gameId": "basketball",
            "players": [
                user
            ],
            "chat": [
                {
                    id: uuidv4(),
                    sender: SenderType.SYSTEM,
                    message: `We're currently losing, and we can't change our players—but we can change our strategy. What combination of shot types will help us close the gap and come out on top?`,
                    sessionId: "test-session-id", 
                }
            ],
            "globalStateData": {
                "curStageId": "collect-variables",
                "curStepId": "d8741382-e1a9-457f-898e-e3062c23832a",
                "roomOwnerId": user._id,
                "discussionDataStringified": "",
                "gameStateData": []
            },
            "playerStateData": [
                {
                    "player": user._id,
                    "animation": "",
                    "gameStateData": []
                }
            ]
        }
    }
}

export function createAndJoinRoomResponse(roomResponse: Room): CreateAndJoinRoomResponse {
    return {
        createAndJoinRoom: roomResponse
    }
}