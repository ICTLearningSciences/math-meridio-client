/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { EducationalRole, LoginService, Player, UserAccessToken, UserRole } from "./types";

export interface RefreshAccessTokenResponse {
    refreshAccessToken: UserAccessToken;
}

export const defaultUser: Player = {
    "_id": "697d7cbf998fc1238c58272e",
    "clientId": "my-player-id",
    "googleId": "110851537648449477948",
    "name": "Testing 123",
    "description": "fun",
    "avatar": [
        {
            "id": "char8",
            "type": "sprite_body",
            "description": "African, African American, Black skin, Brown skin, Dark brown skin, Darker skin, POC",
            "variant": undefined,
            "variants": []
        },
        {
            "id": "overalls",
            "type": "sprite_clothes_top",
            "description": "Human, Person, Boy, Male, Man, Guy, Dude, Girl, Female, Woman, Chick, Lady, Overalls, Jumper, Work, Coverall, T-shirt, Shirt, Short-sleeved shirt, Top",
            "variant": 8,
            "variants": [
                "black",
                "blue",
                "bluelight",
                "brown",
                "green",
                "greenlight",
                "pink",
                "purple",
                "red",
                "white"
            ]
        },
        {
            "id": "skirt",
            "type": "sprite_clothes_bottom",
            "description": "Human, Person, Girl, Female, Woman, Chick, Lady, No pattern, Plain, Simple, Skirt, Bottom, Cute, Girly",
            "variant": 5,
            "variants": [
                "black",
                "blue",
                "bluelight",
                "brown",
                "green",
                "greenlight",
                "pink",
                "purple",
                "red",
                "white"
            ]
        },
        {
            "id": "spacebuns",
            "type": "sprite_hair",
            "description": "Girl, Female, Woman, Chick, Lady, Short hair, Buns, Space buns, Bangs",
            "variant": 0,
            "variants": [
                "black",
                "blonde",
                "brown",
                "brown_light",
                "copper",
                "emerald",
                "green",
                "grey",
                "lilac",
                "navy",
                "pink",
                "purple",
                "red",
                "turquoise"
            ]
        },
        {
            "id": "",
            "type": "",
            "description": "",
            "variant": undefined,
            "variants": []
        }
    ],
    "email": "t7033080@gmail.com",
    "userRole": UserRole.USER,
    "loginService": LoginService.GOOGLE,
    "lastLoginAt": new Date("2026-02-03T03:02:35.422Z"),
    "educationalRole": EducationalRole.STUDENT
}

export function refreshAccessTokenResponse(userRole: UserRole, userEducationalRole: EducationalRole): RefreshAccessTokenResponse {
    return {
        "refreshAccessToken": {
            "user": {
                ...defaultUser,
                "userRole": userRole,
                "educationalRole": userEducationalRole
            },
            "accessToken": "fake-access-token",
            "expirationDate": "2030-02-03T03:02:35.422Z"
        }
    }
}