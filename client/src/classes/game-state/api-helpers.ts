/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Validator, { Schema } from "jsonschema";
import { GenericLlmRequest } from "../../types";
import { execHttp } from "../../api-helpers";
import { syncLlmRequest } from "../../hooks/use-with-synchronous-polling";
import { CancelToken } from "axios";

export async function jsonLlmRequest<T>(
  llmRequest: GenericLlmRequest,
  jsonSchema: Schema,
  cancelToken?: CancelToken
): Promise<T> {
  const res = await syncLlmRequest(llmRequest, cancelToken);
  const v = new Validator.Validator();
  const resJson: T = JSON.parse(res.answer);
  const validationResult = v.validate(resJson, jsonSchema);
  if (validationResult.errors.length > 0) {
    throw new Error(
      `Response does not match expected schema: ${JSON.stringify(
        validationResult.errors
      )}`
    );
  }
  return resJson;
}
