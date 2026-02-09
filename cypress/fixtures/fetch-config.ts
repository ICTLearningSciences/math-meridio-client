/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { AiServiceNames } from "../../src/types";
import { Config } from "../../src/store/slices/config";


export const fetchConfigResponse: { fetchConfig: Config } = {
    "fetchConfig": {
        "aiServiceModelConfigs": [
            {
                "serviceName": AiServiceNames.OPEN_AI,
                "modelList": [
                    {
                        "name": "gpt-4",
                        "maxTokens": 128000,
                        "supportsWebSearch": false
                    },
                    {
                        "name": "gpt-4-turbo-preview",
                        "maxTokens": 128000,
                        "supportsWebSearch": false
                    },
                    {
                        "name": "gpt-4o",
                        "maxTokens": 128000,
                        "supportsWebSearch": true
                    },
                    {
                        "name": "gpt-4o-mini",
                        "maxTokens": 128000,
                        "supportsWebSearch": true
                    }
                ]
            },
            {
                "serviceName": AiServiceNames.AZURE,
                "modelList": [
                    {
                        "name": "ABE-gpt-4o",
                        "maxTokens": 4096,
                        "supportsWebSearch": false
                    },
                    {
                        "name": "ABE-gpt-4o-mini",
                        "maxTokens": 4096,
                        "supportsWebSearch": false
                    }
                ]
            },
            {
                "serviceName": AiServiceNames.GEMINI,
                "modelList": [
                    {
                        "name": "gemini-2.0-flash",
                        "maxTokens": 8192,
                        "supportsWebSearch": true
                    },
                    {
                        "name": "gemini-1.5-pro-latest",
                        "maxTokens": 8192,
                        "supportsWebSearch": true
                    }
                ]
            },
            {
                "serviceName": AiServiceNames.ASK_SAGE,
                "modelList": [
                    {
                        "name": "gpt-4o-mini-gov",
                        "maxTokens": 0,
                        "supportsWebSearch": true
                    },
                    {
                        "name": "gpt4-gov",
                        "maxTokens": 0,
                        "supportsWebSearch": false
                    },
                    {
                        "name": "gpt-4o-gov",
                        "maxTokens": 0,
                        "supportsWebSearch": false
                    },
                    {
                        "name": "aws-bedrock-claude-35-sonnet-gov",
                        "maxTokens": 0,
                        "supportsWebSearch": false
                    }
                ]
            },
            {
                "serviceName": AiServiceNames.ANTHROPIC,
                "modelList": [
                    {
                        "name": "claude-3-5-sonnet-latest",
                        "maxTokens": 8192,
                        "supportsWebSearch": true
                    },
                    {
                        "name": "claude-3-7-sonnet-latest",
                        "maxTokens": 64000,
                        "supportsWebSearch": true
                    },
                    {
                        "name": "claude-3-haiku-20240307",
                        "maxTokens": 4096,
                        "supportsWebSearch": false
                    },
                    {
                        "name": "claude-3-opus-latest",
                        "maxTokens": 4096,
                        "supportsWebSearch": false
                    }
                ]
            },
            {
                "serviceName": AiServiceNames.CAMO_GPT,
                "modelList": [
                    {
                        "name": "Mistral7B",
                        "maxTokens": 4096,
                        "supportsWebSearch": false
                    }
                ]
            }
        ]
    }
}