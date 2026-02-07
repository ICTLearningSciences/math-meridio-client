/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Player } from '../../../store/slices/player/types';
import {
  UserRole,
  LoginService,
  EducationalRole,
} from '../../../store/slices/player/types';
import { GameData } from '../../../store/slices/game';

export function createMockPlayer(id: string, name: string): Player {
  return {
    _id: id,
    name,
    googleId: id,
    description: '',
    avatar: [],
    email: `${id}@example.com`,
    userRole: UserRole.USER,
    loginService: LoginService.GOOGLE,
    lastLoginAt: new Date(),
    educationalRole: EducationalRole.STUDENT,
    clientId: id,
  };
}

export function createBaseGameData(): GameData {
  return {
    chat: [],
    players: [
      createMockPlayer('player1', 'Player 1'),
      createMockPlayer('player2', 'Player 2'),
    ],
    gameId: 'basketball',
    playerStateData: [
      {
        player: 'player1',
        animation: '',
        gameStateData: [],
      },
      {
        player: 'player2',
        animation: '',
        gameStateData: [],
      },
    ],
    globalStateData: {
      curStageId: 'stage1',
      roomOwnerId: 'test-room-owner-id',
      discussionDataStringified: '',
      curStepId: 'step1',
      gameStateData: [],
    },
  };
}
