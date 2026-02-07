/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/// <reference types="jest" />
import { GameData, SenderType } from '../../../store/slices/game';
import { localStorageGet, SESSION_ID } from '../../../store/local-storage';
import {
  addSystemMessageToGameData,
  STEP_RESPONSE_TRACKING_KEY,
  StepResponseTracking,
} from '../state-modifier-helpers';
import {
  initializeResponseTracking,
  addResponseTrackingForStep,
  recordPlayerResponseForStep,
} from '../pure-state-modifiers';
import {
  EducationalRole,
  LoginService,
  Player,
  UserRole,
} from '../../../store/slices/player/types';

// Mock the localStorage module
jest.mock('../../../store/local-storage', () => ({
  localStorageGet: jest.fn(),
  SESSION_ID: 'SESSION_ID',
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

function createMockPlayer(id: string, name: string): Player {
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

describe('pure-state-modifiers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addSystemMessageToGameData', () => {
    it('should add a system message to the chat with sessionId', () => {
      const mockSessionId = 'test-session-123';
      (localStorageGet as jest.Mock).mockReturnValue(mockSessionId);

      const gameData: GameData = {
        chat: [],
        players: [],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const message = 'Test system message';
      const result = addSystemMessageToGameData(gameData, message);

      expect(result.chat).toHaveLength(1);
      expect(result.chat[0]).toEqual({
        id: 'test-uuid-1234',
        sender: SenderType.SYSTEM,
        message: 'Test system message',
        sessionId: 'test-session-123',
      });
      expect(localStorageGet).toHaveBeenCalledWith(SESSION_ID);
    });

    it('should add system message with empty sessionId when localStorage returns null', () => {
      (localStorageGet as jest.Mock).mockReturnValue(null);

      const gameData: GameData = {
        chat: [],
        players: [],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const message = 'Test message without session';
      const result = addSystemMessageToGameData(gameData, message);

      expect(result.chat).toHaveLength(1);
      expect(result.chat[0].sessionId).toBe('');
    });

    it('should append to existing chat messages', () => {
      (localStorageGet as jest.Mock).mockReturnValue('session-456');

      const gameData: GameData = {
        chat: [
          {
            id: 'existing-msg-1',
            sender: SenderType.PLAYER,
            message: 'Existing message',
            sessionId: 'session-456',
          },
        ],
        players: [],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const message = 'New system message';
      const result = addSystemMessageToGameData(gameData, message);

      expect(result.chat).toHaveLength(2);
      expect(result.chat[0].id).toBe('existing-msg-1');
      expect(result.chat[1].sender).toBe(SenderType.SYSTEM);
      expect(result.chat[1].message).toBe('New system message');
    });

    it('should not mutate the original gameData object', () => {
      (localStorageGet as jest.Mock).mockReturnValue('session-789');

      const originalGameData: GameData = {
        chat: [],
        players: [],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const updatedGameData = addSystemMessageToGameData(
        originalGameData,
        'Test message'
      );

      expect(updatedGameData.chat.length).toBeGreaterThan(0);
      expect(originalGameData.chat.length).toBe(0);
    });
  });

  describe('initializeResponseTracking', () => {
    it("should add response tracking with empty object when it doesn't exist", () => {
      const gameData: GameData = {
        chat: [],
        players: [],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const result = initializeResponseTracking(gameData);

      const trackingItem = result.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      expect(trackingItem).toBeDefined();
      expect(trackingItem?.value).toEqual([]);
    });

    it('should not mutate the original gameData object', () => {
      const originalGameData: GameData = {
        chat: [],
        players: [],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const result = initializeResponseTracking(originalGameData);

      expect(result.globalStateData.gameStateData.length).toBe(1);
      expect(originalGameData.globalStateData.gameStateData.length).toBe(0);
    });
  });

  describe('addResponseTrackingForStep', () => {
    it('should add tracking for a new step with all proper initialization', () => {
      const gameData: GameData = {
        chat: [],
        players: [
          createMockPlayer('player1', 'Player 1'),
          createMockPlayer('player2', 'Player 2'),
          createMockPlayer('player3', 'Player 3'),
        ] as Player[],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const result = addResponseTrackingForStep(gameData, 'step-abc');

      const trackingItem = result.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      expect(trackingItem).toBeDefined();

      const tracking = trackingItem?.value as StepResponseTracking[];
      expect(tracking).toHaveLength(1);
      expect(tracking[0].stepId).toBe('step-abc');
      expect(tracking[0].requiredPlayerIds).toEqual([
        'player1',
        'player2',
        'player3',
      ]);
      expect(tracking[0].responses).toEqual({});
      expect(tracking[0].allResponsesReceivedOnce).toBe(false);
    });

    it('should handle multiple different steps independently', () => {
      const gameData: GameData = {
        chat: [],
        players: [createMockPlayer('player1', 'Player 1')],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      let result = addResponseTrackingForStep(gameData, 'step-1');
      result = addResponseTrackingForStep(result, 'step-2');
      result = addResponseTrackingForStep(result, 'step-3');

      const trackingItem = result.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      const tracking = trackingItem?.value as StepResponseTracking[];

      expect(tracking).toHaveLength(3);
      expect(tracking[0].stepId).toBe('step-1');
      expect(tracking[1].stepId).toBe('step-2');
      expect(tracking[2].stepId).toBe('step-3');
    });
  });

  describe('recordPlayerResponseForStep', () => {
    it("should record a player's first response for a step", () => {
      const gameData: GameData = {
        chat: [],
        players: [
          createMockPlayer('player1', 'Player 1'),
          createMockPlayer('player2', 'Player 2'),
        ],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const result = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'Hello world'
      );

      const trackingItem = result.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      const tracking = trackingItem?.value as StepResponseTracking[];
      const stepTracking = tracking.find((t) => t.stepId === 'step-1');

      expect(stepTracking?.responses['player1']).toBe('Hello world');
    });

    it('should append to existing player response with tab separator when player responds again', () => {
      let gameData: GameData = {
        chat: [],
        players: [createMockPlayer('player1', 'Player 1')],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'First message'
      );
      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'Second message'
      );
      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'Third message'
      );

      const trackingItem = gameData.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      const tracking = trackingItem?.value as StepResponseTracking[];
      const stepTracking = tracking.find((t) => t.stepId === 'step-1');

      expect(stepTracking?.responses['player1']).toBe(
        'First message\tSecond message\tThird message'
      );
    });

    it('should set allResponsesReceivedOnce to true when all required players have responded', () => {
      let gameData: GameData = {
        chat: [],
        players: [
          createMockPlayer('player1', 'Player 1'),
          createMockPlayer('player2', 'Player 2'),
        ],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'Response 1'
      );

      let trackingItem = gameData.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      let tracking = trackingItem?.value as StepResponseTracking[];
      let stepTracking = tracking.find((t) => t.stepId === 'step-1');
      expect(stepTracking?.allResponsesReceivedOnce).toBe(false);

      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player2',
        'Response 2'
      );

      trackingItem = gameData.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      tracking = trackingItem?.value as StepResponseTracking[];
      stepTracking = tracking.find((t) => t.stepId === 'step-1');
      expect(stepTracking?.allResponsesReceivedOnce).toBe(true);
    });

    it('should keep allResponsesReceivedOnce as false when not all players have responded yet', () => {
      let gameData: GameData = {
        chat: [],
        players: [
          createMockPlayer('player1', 'Player 1'),
          createMockPlayer('player2', 'Player 2'),
          createMockPlayer('player3', 'Player 3'),
        ],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'Response 1'
      );
      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player2',
        'Response 2'
      );

      const trackingItem = gameData.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      const tracking = trackingItem?.value as StepResponseTracking[];
      const stepTracking = tracking.find((t) => t.stepId === 'step-1');

      expect(stepTracking?.allResponsesReceivedOnce).toBe(false);
    });

    it('should handle multiple players responding to the same step', () => {
      let gameData: GameData = {
        chat: [],
        players: [
          createMockPlayer('player1', 'Player 1'),
          createMockPlayer('player2', 'Player 2'),
          createMockPlayer('player3', 'Player 3'),
        ] as Player[],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'Hello from player 1'
      );
      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player2',
        'Hello from player 2'
      );
      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player3',
        'Hello from player 3'
      );

      const trackingItem = gameData.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      const tracking = trackingItem?.value as StepResponseTracking[];
      const stepTracking = tracking.find((t) => t.stepId === 'step-1');

      expect(stepTracking?.responses['player1']).toBe('Hello from player 1');
      expect(stepTracking?.responses['player2']).toBe('Hello from player 2');
      expect(stepTracking?.responses['player3']).toBe('Hello from player 3');
      expect(stepTracking?.allResponsesReceivedOnce).toBe(true);
    });

    it('should track responses across multiple steps independently', () => {
      let gameData: GameData = {
        chat: [],
        players: [
          createMockPlayer('player1', 'Player 1'),
          createMockPlayer('player2', 'Player 2'),
        ],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      gameData = recordPlayerResponseForStep(
        gameData,
        'step-1',
        'player1',
        'Step 1 response'
      );
      gameData = recordPlayerResponseForStep(
        gameData,
        'step-2',
        'player2',
        'Step 2 response'
      );
      gameData = recordPlayerResponseForStep(
        gameData,
        'step-3',
        'player1',
        'Step 3 response'
      );

      const trackingItem = gameData.globalStateData.gameStateData.find(
        (item) => item.key === STEP_RESPONSE_TRACKING_KEY
      );
      const tracking = trackingItem?.value as StepResponseTracking[];

      expect(tracking).toHaveLength(3);

      const step1Tracking = tracking.find((t) => t.stepId === 'step-1');
      const step2Tracking = tracking.find((t) => t.stepId === 'step-2');
      const step3Tracking = tracking.find((t) => t.stepId === 'step-3');

      expect(step1Tracking?.responses['player1']).toBe('Step 1 response');
      expect(step2Tracking?.responses['player2']).toBe('Step 2 response');
      expect(step3Tracking?.responses['player1']).toBe('Step 3 response');
    });

    it('should not mutate the original gameData object', () => {
      const originalGameData: GameData = {
        chat: [],
        players: [createMockPlayer('player1', 'Player 1')],
        gameId: 'basketball',
        playerStateData: [],
        globalStateData: {
          curStageId: 'stage1',
          roomOwnerId: 'test-room-owner-id',
          curStepId: 'step1',
          gameStateData: [],
        },
      };

      const result = recordPlayerResponseForStep(
        originalGameData,
        'step-1',
        'player1',
        'Test message'
      );

      expect(result.globalStateData.gameStateData.length).toBeGreaterThan(0);
      expect(originalGameData.globalStateData.gameStateData.length).toBe(0);
    });
  });
});
