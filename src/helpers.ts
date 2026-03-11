/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { ChatMessage } from './store/slices/game/types';
import axios from 'axios';
import {
  DiscussionStageStep,
  DiscussionStageStepType,
  IStage,
  StartOfPhaseStep,
} from './components/discussion-stage-builder/types';
import { DiscussionStage } from './components/discussion-stage-builder/types';
import { isDiscussionStage } from './components/discussion-stage-builder/types';
import { Avatar } from './store/slices/player/types';
import {
  SPRITE_BODY,
  SPRITE_CLOTHES,
  SPRITE_HAIR,
} from './store/slices/player/use-with-player-state';
import { SolutionGameStateData } from './types';

export const SIMULTAION_VIEWED_KEY = 'viewed-simulation';

export function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Input array is empty');
  }
  // Sorting values, preventing original array
  // from being mutated.
  values = [...values].sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
}

export function calculateSum(values: number[]): number {
  const sum = values.reduce((a, b) => a + b, 0);
  return sum;
}

export function calculateAverage(values: number[]): number {
  const avg = calculateSum(values) / values.length || 0;
  return avg;
}

export function calculatePercentSkillsMet(
  mathStandardsCompleted: Record<string, boolean>
): number {
  if (Object.values(mathStandardsCompleted).length === 0) return 0;
  let numMet = 0;
  let numTotal = 0;
  for (const isDone of Object.values(mathStandardsCompleted)) {
    if (isDone) numMet++;
    numTotal++;
  }
  return (numMet / numTotal) * 100;
}

export function getPercentString(num: number): string {
  if (Number.isNaN(num)) return '0%';
  return `${Math.round(num * 100)}%`;
}

export function getLastActivityString(date: Date): string {
  const currentDate = new Date().getTime();
  const lastActivityAt = new Date(date).getTime();
  const minsSince = Math.floor(
    Math.abs(currentDate - lastActivityAt) / (1000 * 60)
  );
  const activityStr =
    minsSince < 60
      ? `${minsSince} MINS AGO`
      : minsSince < 60 * 24
      ? `${Math.floor(minsSince / 60)} HOURS AGO`
      : `${Math.floor(minsSince / (60 * 24))} DAYS AGO`;
  return activityStr;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function equals<T>(val1: T, val2: T): boolean {
  return JSON.stringify(val1) === JSON.stringify(val2);
}

export function chatLogToString(chatLog: ChatMessage[]) {
  let chatLogString = '';

  for (let i = 0; i < chatLog.length; i++) {
    const msg = chatLog[i];
    chatLogString += `${msg.senderName || msg.sender}: ${msg.message}\n`;
  }
  return chatLogString;
}

export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
  } catch (e) {
    console.log(`Error parsing string: ${str}`);
    return false;
  }
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arrayNRandom(arr: any[], n: number): any[] {
  let len = arr.length;
  const result = new Array(n),
    taken = new Array(len);
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available');
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

export function randomInt(n: number): number {
  return Math.floor(Math.random() * n);
}

export function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function arrayGetRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[randomInt(arr.length)];
}

export function isEqual<T>(obj1: T, obj2: T): boolean {
  return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractErrorMessageFromError(err: any | unknown): string {
  if (err?.response?.data) {
    try {
      const error = JSON.stringify(err.response.data);
      return error;
    } catch (err) {
      console.error(err);
    }
  }
  if (err instanceof Error) {
    return err.message;
  } else if (axios.isAxiosError(err)) {
    return err.response?.data || err.message;
  } else {
    try {
      const error = JSON.stringify(err);
      return error;
    } catch (err) {
      return 'Cannot stringify error, unknown error structure';
    }
  }
}

export function didGameStateDataChange(
  prevGameStateData: SolutionGameStateData,
  newGameStateData: SolutionGameStateData
): boolean {
  return JSON.stringify(prevGameStateData) !== JSON.stringify(newGameStateData);
}

export function getFirstStepId(stage: IStage): string {
  if (isDiscussionStage(stage)) {
    return (stage as DiscussionStage).flowsList[0].steps[0].stepId;
  }
  return stage.clientId;
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getRandomAvatar() {
  const avatar: Avatar[] = [];
  const body = arrayGetRandom<Avatar>(SPRITE_BODY);
  if (body) {
    body.variant = body.variants ? randomInt(body.variants.length) : undefined;
    avatar.push(body);
  }
  const top = arrayGetRandom<Avatar>(
    SPRITE_CLOTHES.filter(
      (s) => s.type.endsWith('clothes_top') || s.type.endsWith('clothes_outfit')
    )
  );
  if (top) {
    top.variant = top.variants ? randomInt(top.variants.length) : undefined;
    avatar.push(top);
    if (top.type.endsWith('_top')) {
      const bottom = arrayGetRandom<Avatar>(
        SPRITE_CLOTHES.filter((s) => s.type.endsWith('clothes_bottom'))
      );
      if (bottom) {
        bottom.variant = bottom.variants
          ? randomInt(bottom.variants.length)
          : undefined;
        avatar.push(bottom);
      }
    }
  }
  const hair = arrayGetRandom<Avatar>(SPRITE_HAIR);
  if (hair) {
    hair.variant = hair.variants ? randomInt(hair.variants.length) : undefined;
    avatar.push(hair);
  }
  return avatar;
}

export function copyAndSet<T>(array: T[], idx: number, value: T): T[] {
  if (idx >= array.length || idx < 0) {
    return [...array, value];
  }
  return [...array.slice(0, idx), value, ...array.slice(idx + 1)];
}

export type GameIdentifier =
  | 'Basketball'
  | 'Concert Ticket Sales'
  | 'Test Base';
export type AllStartOfPhaseSteps = Record<GameIdentifier, StartOfPhaseStep[]>;

export function getAllStartOfPhaseSteps(
  stages: DiscussionStage[]
): AllStartOfPhaseSteps {
  const startOfPhaseSteps: AllStartOfPhaseSteps = stages.reduce(
    (acc, stage) => {
      const thisStagesSteps: DiscussionStageStep[] = stage.flowsList.flatMap(
        (flow) => flow.steps
      );
      const targetGameIdentifier = getGameIdentifierFromStageTitle(stage.title);
      if (!acc[targetGameIdentifier]) {
        acc[targetGameIdentifier] = [];
      }
      const thisStagesStartOfPhaseSteps = thisStagesSteps.filter(
        (step) => step.stepType === DiscussionStageStepType.START_OF_PHASE
      ) as StartOfPhaseStep[];
      acc[targetGameIdentifier].push(...thisStagesStartOfPhaseSteps);
      return acc;
    },
    {} as AllStartOfPhaseSteps
  );
  return startOfPhaseSteps;
}

export function getGameIdentifierFromStageTitle(title: string): GameIdentifier {
  return title.includes('Basketball')
    ? 'Basketball'
    : title.includes('Concert')
    ? 'Concert Ticket Sales'
    : 'Test Base';
}
