/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CollectedDiscussionData } from '../../types';
import { GameStateData } from '../../store/slices/game';
import {
  DiscussionStage,
  FlowItem,
  JsonResponseData,
  PredefinedResponse,
} from './types';
import Validator, { Schema } from 'jsonschema';

function convertExpectedDataIntoSchema(
  expectedData: JsonResponseData[]
): Schema {
  const schema: Schema = {
    type: 'object',
    properties: {},
    required: [],
  };
  for (const expectedField of expectedData) {
    schema.properties![expectedField.name] = {
      type: expectedField.type,
    };
    if (expectedField.isRequired) {
      (schema.required! as string[]).push(expectedField.name);
    }
  }
  return schema;
}

// recursively convert expected data into a prompt string
export function recursivelyConvertExpectedDataToAiPromptString(
  expectedData: JsonResponseData[]
): string {
  let promptString = `Respond in JSON. Validate that your response is valid JSON. Your JSON must follow this format:\n`;
  promptString += `{\n`;

  function buildSchema(data: JsonResponseData[], indent: string): string {
    let schema = '';
    data.forEach((item, index) => {
      schema += `${indent}"${item.name}": `;
      if (item.type === 'object' && item.subData) {
        schema += `{${
          item.additionalInfo ? `\t// ${item.additionalInfo}` : ''
        }\n`;
        schema += buildSchema(item.subData, `${indent}  `);
        schema += `${indent}}\n`;
      } else {
        schema += `"${item.type}"`;
        if (item.additionalInfo) {
          schema += `\t// ${item.additionalInfo}`;
        }
      }
      if (index < data.length - 1) {
        schema += ',';
      }
      schema += '\n';
    });
    return schema;
  }

  promptString += buildSchema(expectedData, '  ');
  promptString += `}\n`;

  return promptString;
}

export function receivedExpectedData(
  expectedData: JsonResponseData[],
  jsonResponse: string
) {
  try {
    const v = new Validator.Validator();
    const schema = convertExpectedDataIntoSchema(expectedData);
    const responseJson = JSON.parse(jsonResponse);
    const result = v.validate(responseJson, schema);
    if (result.errors.length > 0) {
      console.error(result.errors);
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function getFlowForStepId(
  flow: FlowItem[],
  stepId: string
): FlowItem | undefined {
  return flow.find((flowItem) => {
    return flowItem.steps.find((step) => {
      return step.stepId === stepId;
    });
  });
}

export function processPredefinedResponses(
  processPredefinedResponses: PredefinedResponse[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateData: Record<string, any>
): PredefinedResponse[] {
  const processedPredefinedResponses = processPredefinedResponses.map(
    (response) => {
      return {
        ...response,
        message: replaceStoredDataInString(response.message, stateData),
        responseWeight: replaceStoredDataInString(
          response.responseWeight || '',
          stateData
        ),
      };
    }
  );
  return processedPredefinedResponses;
}

export function replaceStoredDataInString(
  str: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateData: Record<string, any>
): string {
  try {
    // replace all instances of {{key.data...}} in str with stored data[key][data...]
    const regex = /{{(.*?)}}/g;
    return str.trim().replace(regex, (match, key) => {
      const keys = key.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = keys.reduce((acc: Record<string, any>, k: string) => {
        return acc[k];
      }, stateData);
      return value || '';
    });
  } catch (e) {
    console.error(e);
    return str;
  }
}

export function sortMessagesByResponseWeight(
  messageList: string[],
  predefinedResponses: PredefinedResponse[]
): string[] {
  const sortedMessages = messageList.sort((a, b) => {
    const responseWeightA = predefinedResponses.find(
      (response) => response.message === a
    )?.responseWeight;
    const responseWeightB = predefinedResponses.find(
      (response) => response.message === b
    )?.responseWeight;
    try {
      if (responseWeightA && responseWeightB) {
        return parseInt(responseWeightB) - parseInt(responseWeightA);
      }
    } catch (e) {
      console.error(e);
      return 0;
    }
    return 0;
  });
  return sortedMessages;
}

export function getStepFromFlowList(stepId: string, flowsList: FlowItem[]) {
  for (const flow of flowsList) {
    const step = flow.steps.find((s) => s.stepId === stepId);
    if (step) {
      return step;
    }
  }
  return undefined;
}

export function isStageRunnable(stage: DiscussionStage) {
  return stage.flowsList.length > 0 && stage.flowsList[0].steps.length > 0;
}

export function recursiveUpdateAdditionalInfo(
  data: JsonResponseData[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateData: Record<string, any>
) {
  const copy: JsonResponseData[] = JSON.parse(JSON.stringify(data));
  for (const item of copy) {
    if (item.additionalInfo) {
      item.additionalInfo = replaceStoredDataInString(
        item.additionalInfo,
        stateData
      );
    }
    if (item.subData) {
      item.subData = recursiveUpdateAdditionalInfo(item.subData, stateData);
    }
  }
  return copy;
}

export function convertCollectedDataToGSData(
  data: CollectedDiscussionData
): GameStateData[] {
  return Object.entries(data).map(([key, value]) => {
    return {
      key,
      value,
    };
  });
}

export function checkGameAndPlayerStateForValue(
  globalGameStateData: GameStateData[],
  playerGameStateData: GameStateData[],
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
) {
  const gameDataValue = globalGameStateData.find(
    (data) => data.key === key
  )?.value;
  const playerDataValue = playerGameStateData.find(
    (data) => data.key === key
  )?.value;
  return playerDataValue === value || gameDataValue === value;
}
