/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
type Direction = 'left' | 'right';

type PayoffMatrix = {
  [K in Direction]: {
    [K2 in Direction]: number;
  };
};

type KickOutcome = 'goal' | 'saved' | 'missed';

interface KickHistoryItem {
  direction: Direction;
  outcome: KickOutcome;
}

interface GoalieAIConfig {
  initialLeft?: number;
  initialRight?: number;
  epsilon?: number;
  payoffMatrix?: PayoffMatrix;
  maxHistory?: number;
}

export default class GoalieAI {
  pDiveLeft: number;
  pDiveRight: number;
  epsilon: number;
  payoffMatrix: PayoffMatrix;
  maxHistory: number;
  kickHistory: KickHistoryItem[];

  constructor(config: GoalieAIConfig = {}) {
    this.pDiveLeft = config.initialLeft ?? 0.5;
    this.pDiveRight = config.initialRight ?? 0.5;
    this.epsilon = config.epsilon ?? 0.1;
    this.payoffMatrix = config.payoffMatrix ?? {
      left: { left: 0.3, right: 1.0 },
      right: { left: 1.0, right: 0.0 },
    };
    this.maxHistory = config.maxHistory ?? 50;
    this.kickHistory = [];
  }

  recordKick(direction: Direction, outcome: KickOutcome) {
    this.kickHistory.push({ direction, outcome });
    if (this.kickHistory.length > this.maxHistory) {
      this.kickHistory.shift();
    }
  }

  updateStrategy() {
    const total = this.kickHistory.length;
    if (total === 0) return;

    const leftCount = this.kickHistory.filter(
      (k) => k.direction === 'left'
    ).length;
    const pLeft = leftCount / total;

    const a = this.payoffMatrix.left.left;
    const b = this.payoffMatrix.left.right;
    const c = this.payoffMatrix.right.left;
    const d = this.payoffMatrix.right.right;

    const numerator = d - b;
    const denominator = a - b - (c - d);
    let q = 0.5;

    if (Math.abs(denominator) > 1e-9) {
      q = numerator / denominator;
    }

    q = Math.max(0, Math.min(1, q));
    this.pDiveLeft = (1 - this.epsilon) * q + this.epsilon * 0.5;
    this.pDiveRight = 1 - this.pDiveLeft;
  }

  getDiveDecision(rng = Math.random): Direction {
    return rng() < this.pDiveLeft ? 'left' : 'right';
  }
}
