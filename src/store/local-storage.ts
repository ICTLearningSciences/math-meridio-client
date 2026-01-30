/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export const SESSION_ID = '@sessionId';
export const ACCESS_TOKEN_KEY = '@accessToken';
export function localStorageGet<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const item = localStorage.getItem(key);
  if (!item) {
    return null;
  }
  try {
    return JSON.parse(item) as T;
  } catch (err) {
    return item as T;
  }
}

export function requireLocalStorageGet<T>(key: string): T {
  const item = localStorageGet<T>(key);
  if (!item) {
    throw new Error(`Item ${key} not found in localStorage`);
  }
  return item;
}

export function localStorageStore(key: string, value: unknown): void {
  if (typeof window === 'undefined') {
    return;
  }
  const val = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, val);
}

export function localStorageClear(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(key);
}
