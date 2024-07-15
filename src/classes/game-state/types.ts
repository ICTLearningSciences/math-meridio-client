/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Schema } from 'jsonschema';
import { TargetAiModelServiceType } from '../../types';

export interface GameObjects {
  clientId: string;
  name: string;
}

export const OpenAiServiceModel: TargetAiModelServiceType = {
  serviceName: 'OPEN_AI',
  model: 'gpt-3.5-turbo-16k',
};

export const AzureServiceModel: TargetAiModelServiceType = {
  serviceName: 'AZURE_OPEN_AI',
  model: 'ABE-GPT-3_5_turbo_16k',
};

export const GeminiServiceModel: TargetAiModelServiceType = {
  serviceName: 'GEMINI',
  model: 'gemini-pro',
};

export interface IRemoveItem {
  clientId: string;
}

export const removeItemSchema: Schema = {
  type: 'object',
  properties: {
    clientId: { type: 'string' },
  },
  required: ['clientId'],
};

export const pickAvatarSchema: Schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      description: { type: 'string' },
    },
  },
  required: ['id'],
};
