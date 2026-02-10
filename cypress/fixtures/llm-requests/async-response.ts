/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/**
 * 
 * @param response - Either raw text OR a stringified JSON object to add values to state
 * @returns 
 */
export function asyncResponseRes(response: string) {
    return {"response": {
            "aiServiceResponse": {
                "aiAllStepsData": [
                    {
                        "aiServiceRequestParams": {
                            "model": "gpt-4o-mini",
                            "input": [],
                            "max_output_tokens": 128000,
                            "store": false
                        },
                        "aiServiceResponse": {
                            "output_text": "{\n  \"stayed_on_topic\": \"False\"\n}"
                        },
                        "tokenUsage": {
                            "promptUsage": 295,
                            "completionUsage": 13,
                            "totalUsage": 308
                        }
                    }
                ],
                "answer": "{\n  \"stayed_on_topic\": \"False\"\n}"
            },
            "answer": "",
            "jobStatus": "COMPLETE",
            "apiError": ""
        }
    }
}