/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Checking, DiscussionStageGQL, DiscussionStageStepType, NumericOperations, PromptOutputTypes } from "./types";



  export const fetchDiscussionStagesResponse: { fetchDiscussionStages: DiscussionStageGQL[] } = {
    "fetchDiscussionStages": [
      {
          "_id": "66a29af5a6746072a0133a9c",
          "clientId": "e11d3273-e0e8-4b15-a5f0-3b80e5665e01",
          "title": "7. Basketball Game - Discuss Best Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "00705c2b-cbbe-420d-bd33-d66c0ed91a7a",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "ca66c3cc-66d0-454a-b56e-b2f3088c041c",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are discussing with a student how to find the best basketball shooting strategy to maximize total points. The calculation for total points in a game is based on three shot types:\n\n(number of middle shots taken) * middle shot success rate (forty percent) * points per middle shot (two points)\n +\n (number of inside shots taken) * inside shot success rate (fifty percent) * points per inside shot (two points)\n +\n (number of outside shots taken) * outside shot success rate (thirty-six percent) * points per outside shot (three points)\n\nOnly one variable can be changed: the number of shots taken per shot type. The student has a maximum of 100 shots to distribute between the three shot types.\n\nThe optimal strategy is to take 100 outside shots, because this leads to the highest expected point total when applying the formula above. However, do not reveal this answer to the student.\n\nYour task is to guide the student toward discovering this strategy on their own. The student is in middle school (ages 11–13), so use simple, age-appropriate language and step-by-step reasoning. Begin by helping the student understand what “success rate” means and how to calculate expected points for a shot. Prompt them to compare each shot type based on how often it goes in and how many points it’s worth. Encourage them to calculate the total expected points. Ask open-ended questions that guide their thinking without giving away the answer. Reinforce the logic of expected value and help them notice which shot type produces the most points per shot on average. Use gentle redirection if they make incorrect assumptions, and build on what they understand. Your goal is to support them in discovering the best strategy by reasoning through the math themselves.",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"a0489998-4523-451c-9d72-ca673523b879\",\"name\":\"best_strategy_found\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"true/false string, set to \\\"true\\\" if the student’s strategy involves taking all 100 shots as outside shots (3-pointers). Otherwise, set to \\\"false\\\".\"},{\"clientId\":\"322c6b24-853b-4dfb-b445-a837404e3424\",\"name\":\"response_to_strategy\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"Your direct response to the student’s proposed strategy. Keep it brief, between 1–3 sentences. Do not reveal the optimal answer unless the student already discovered it.\"},{\"clientId\":\"3d181548-98a6-41f2-99a8-6c0f978faf64\",\"name\":\"inside_shot_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"Whole number only (e.g., 25). Do not include the percent symbol. Must be an integer from 0 to 100. Only include this field if the student explicitly gives a number or percent for ANY of the three shot types. The sum of inside_shot_percent, middle_shot_percent, and outside_shot_percent must not exceed 100.\"},{\"clientId\":\"25a9e4b7-1636-48cc-8a4c-23cf729fdb2f\",\"name\":\"middle_shot_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"Whole number only (e.g., 40). Do not include the percent symbol. Must be an integer from 0 to 100. Only include this field if the student explicitly gives a number or percent for ANY of the three shot types. The sum of inside_shot_percent, middle_shot_percent, and outside_shot_percent must not exceed 100.\"},{\"clientId\":\"6417e179-2069-405c-ae71-2a2ddcbfe06b\",\"name\":\"outside_shot_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"Whole number only (e.g., 35). Do not include the percent symbol. Must be an integer from 0 to 100. Only include this field if the student explicitly gives a number or percent for ANY of the three shot types. The sum of inside_shot_percent, middle_shot_percent, and outside_shot_percent must not exceed 100.\"}]",
                          "customSystemRole": "You are a basketball game master having a discussion with a student about the Best Shooting Strategy in a basketball game."
                      },
                      {
                          "lastStep": true,
                          "stepId": "74ed93f6-6884-4a07-bb66-394d2da254de",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "ca66c3cc-66d0-454a-b56e-b2f3088c041c",
                          "message": "{{response_to_strategy}}",
                          "saveResponseVariableName": "",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              }
          ]
      },
      {
          "_id": "669ee07c4815905b32891e9c",
          "clientId": "86587083-9279-4c27-8470-836f992670fc",
          "title": "2. Basketball Game - Collect Variables",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "be7a9940-5723-461c-a959-6693b3f6687d",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "d8741382-e1a9-457f-898e-e3062c23832a",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "We're currently losing, and we can't change our players—but we can change our strategy.\n\nWhat combination of shot types will help us close the gap and come out on top?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "07e7c344-dcc0-42f3-846e-cc24314f7b9e",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "We have requested that the user input a strategy for making shots in a basketball team to maximize points, or to input some information about what they think we are doing wrong.\n\nYour task is to simply determine if the user stayed on topic with their input.\n\nHere is the users input: {{user_hypothesis}}",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"c84800db-5cbc-4172-a47f-e6a0191d0365\",\"name\":\"stayed_on_topic\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"True/False: Only set to true if the user stayed on topic. Set to false if the user went off topic or didn't answer the question \"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "b76feb87-7dcb-4360-9eb0-27dc5ba1ecdb",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "b8770926-4a6a-4802-b8f3-74ec6a072cb7",
                          "conditionals": [
                              {
                                  "stateDataKey": "stayed_on_topic",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "53b0b249-057b-407b-8dca-37724b5cd97e"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "b8770926-4a6a-4802-b8f3-74ec6a072cb7",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "d8741382-e1a9-457f-898e-e3062c23832a",
                          "message": "It looks like you did not provide a proper response to my question"
                      },
                      {
                          "lastStep": false,
                          "stepId": "53b0b249-057b-407b-8dca-37724b5cd97e",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Basketball Team Performance Analysis\n\nInternal Reference Formula (Do Not Share with Student):\n\nTotal points made in a basketball game =\n    (Number of middle shots attempted × Middle shot success rate × Points per middle shot) +\n    (Number of inside shots attempted × Inside shot success rate × Points per inside shot) +\n    (Number of outside shots attempted × Outside shot success rate × Points per outside shot)\n\nThis formula calculates the total points as the sum of contributions from each shot type, where each contribution is based on the number of attempts, the success rate, and the point value of that shot type.\n\nYour Task:\n\nA student has submitted a strategy and rationale for how they believe a basketball team should shoot in order to maximize their total points.\n\nPlease evaluate the effectiveness of their strategy based on the internal formula, without revealing or referencing the formula directly. In your response, assess:\n - How well the strategy aligns with maximizing total points.\n - Whether the student's explanation shows an understanding of the key variables involved (e.g., shot type success rates, attempt volumes, and point values).\n - Any assumptions or trade-offs that may help or hurt the strategy's performance.\n\nHere is the student’s proposed strategy:\n{{user_hypothesis}}\n\nHere is their explanation for the strategy:\n{{why_their_strategy}}",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"60787e11-b513-4602-98c0-df1d663a02bc\",\"name\":\"inside_shot_percent\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"The student's desired percent of inside shots for their team to take. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of inside_shot_percent, middle_shot_percent, and outside_shot_percent must equal 100.\"},{\"clientId\":\"5b7df8e0-f877-4b41-93cf-c84615c7aa31\",\"name\":\"middle_shot_percent\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"The student's desired percent of middle shots for their team to take. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of inside_shot_percent, middle_shot_percent, and outside_shot_percent must equal 100.\"},{\"clientId\":\"34e1bd09-0d1c-4f55-96c4-4885e5bf0889\",\"name\":\"outside_shot_percent\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"The student's desired percent of outside shots for their team to take. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of inside_shot_percent, middle_shot_percent, and outside_shot_percent must equal 100.\"},{\"clientId\":\"177770d8-0788-4b4d-8e1e-a2b9edc96e17\",\"name\":\"understands_success_shots\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student mentions anything related to the chance of making a shot, shot success, shot probability, or similar concepts. Otherwise, \\\"false\\\".\"},{\"clientId\":\"6e71d584-0683-4b8b-b5e6-6dedcdb0b56b\",\"name\":\"understands_shot_points\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student mentions how many points are earned per shot type or discusses point values. Otherwise, \\\"false\\\".\"},{\"clientId\":\"89b4b546-df97-4ecd-b2a9-88595afc4600\",\"name\":\"understands_multiplication\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student shows understanding that they must multiply ALL THREE variables: number of shots attempted × success rate × points per shot. Otherwise, \\\"false\\\".\"},{\"clientId\":\"5d923150-2fa3-48ff-9821-6f918fc041a7\",\"name\":\"understands_addition\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" only if the student mentions combining or adding the point results from the three different shot types to get the total score. Otherwise, \\\"false\\\".\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": false,
                          "stepId": "65089eb5-ce4b-4a45-9178-4673dd4eb10f",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Why would this strategy be better?",
                          "saveResponseVariableName": "why_their_strategy",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "3da1be40-0080-4586-b2c3-67951a50bfe8",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Basketball Team Performance Analysis\n\nInternal Reference Formula (Do Not Share with Student):\n\nTotal points made in a basketball game =\n    (Number of middle shots attempted × Middle shot success rate × Points per middle shot) +\n    (Number of inside shots attempted × Inside shot success rate × Points per inside shot) +\n    (Number of outside shots attempted × Outside shot success rate × Points per outside shot)\n\nThis formula calculates the total points as the sum of contributions from each shot type, where each contribution is based on the number of attempts, the success rate, and the point value of that shot type.\n\nYour Task:\n\nA student has submitted a strategy and rationale for how they believe a basketball team should shoot in order to maximize their total points.\n\nPlease evaluate the effectiveness of their strategy based on the internal formula, without revealing or referencing the formula directly. In your response, assess:\n - How well the strategy aligns with maximizing total points.\n - Whether the student's explanation shows an understanding of the key variables involved (e.g., shot type success rates, attempt volumes, and point values).\n - Any assumptions or trade-offs that may help or hurt the strategy's performance.\n\nHere is the student’s proposed strategy:\n{{user_hypothesis}}\n\nHere is their explanation for the strategy:\n{{why_their_strategy}}",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"0f4c18ee-932a-4f54-9143-29d86ab3ba71\",\"name\":\"ai_response_strategy\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"Your direct response to the student. This should be 1 sentence long. Do NOT mention or reveal the equation. Give brief feedback on whether their strategy and explanation seem effective or reasonable. Speak in the first person, as if you are replying directly to the 11–14-year-old student.\"},{\"clientId\":\"933ce5bb-afed-4048-9392-c831c2b21ddd\",\"name\":\"understands_success_shots\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student mentions anything related to the chance of making a shot, shot success, shot probability, or similar concepts. Otherwise, \\\"false\\\".\"},{\"clientId\":\"2071b358-4d54-4430-b324-75be2b064552\",\"name\":\"understands_shot_points\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student mentions how many points are earned per shot type or discusses point values. Otherwise, \\\"false\\\".\"},{\"clientId\":\"6d9ad98d-279a-4773-ae4e-d8d5dbc52e93\",\"name\":\"understands_multiplication\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student shows understanding that they must multiply ALL THREE variables: number of shots attempted × success rate × points per shot. Otherwise, \\\"false\\\".\"},{\"clientId\":\"2370b351-63e5-4c15-9224-b1cbb2488146\",\"name\":\"understands_addition\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" only if the student mentions combining or adding the point results from the three different shot types to get the total score. Otherwise, \\\"false\\\".\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": true,
                          "stepId": "607ae4b5-987a-4d85-b4d1-bb6c9efaf06c",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "{{ai_response_strategy}}"
                      }
                  ]
              }
          ]
      },
      {
          "_id": "669ffad86846a2c0e2387c57",
          "clientId": "3095c6cd-d377-4660-aa4d-e79409592210",
          "title": "5. Basketball Game - Select Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "99741b46-f62c-46b6-aad9-4959873d580c",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "b202321c-6b13-46c2-9bd9-affc2185c844",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Please select a strategy from the bottom of the \"Simulation\" section to view a simulation."
                      }
                  ]
              }
          ]
      },
      {
          "_id": "66901fd2895f740300e66ac9",
          "clientId": "de0b94b9-1fc2-4ea1-995e-21a75670c16d",
          "title": "1. Basketball Game - Intro messages",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "bc5b2fda-f987-49e6-b71f-bdb84224c4ec",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "560499fd-eacd-411d-b52e-2c1ac2ec2246",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Hey everyone,\nWe’re not hitting our winning goals, even though our players are just as skilled as anyone else. The coaching staff needs you to figure out how we can improve our shot selection strategy to start winning games.\nWe can take up to 100 shots per game, and we have three types of shots to choose from:\n\n3-Pointers – high risk, high reward\n\nMid-Range Shots – medium risk, low reward\n\nInside Shots – low risk, low reward"
                      }
                  ]
              }
          ]
      },
      {
          "_id": "669ff81985d0cb7d4446281b",
          "clientId": "5421ef02-3cca-4281-a832-69ce040ed848",
          "title": "4. Basketball Game - LLM Key Concepts Conversation",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "75949ebd-3f77-43e3-a76e-cde51507820c",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "fabcb24d-7961-4147-8f0c-fff858f8cec5",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are a basketball Game Master having a discussion with an 11–14-year-old student about algorithm for determining the number of points made per game for the 3 different shot types:\n\n(number of middle shots taken) * (% middle shot success) * (# points per middle shot)\n+\n(number of inside shots taken) * (% inside shot success) * (# points per inside shot)\n+\n(number of outside shots taken) * (% outside shot success) * (# points per outside shot)\n\nIn words:\nThe total points made in a basketball game is the sum of the points from each shot type.\nFor each shot type, you multiply:\n - the number of shots taken\n - the chance of making a shot (success rate)\n - and the points scored per successful shot.\n\nDO NOT reveal or discuss the full equation to the student until they have figured it out. Only reveal or discuss the parts of the equation the student has already figured out.\n\nAssist the student in figuring out all the parts to the equation. As they provide more information, help guide them through the remaining pieces. Do NOT ask about parts of the equation that the student has already mentioned or described in the chat log. Your goal is to help the student discover and understand the complete equation on their own.\n\nEach time the student provides new input, evaluate which parts of the equation they have understood and lead them toward discovering the remaining components. Encourage curiosity and guide them through the thought process, step by step.\n\nYou are provided with the chat log for context, but focus on responding to the users most recent message, here: {{recent_response}}",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"2c753335-bcbc-4631-bea4-b48bd9b0d5e5\",\"name\":\"understands_algorithm\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" only if all three of the following fields are also \\\"true\\\": understands_multiplication, understands_addition, and understands_success_shots.\\nIf any one of those three fields is \\\"false\\\", then understands_algorithm must be \\\"false\\\".\\nIf all three are \\\"true\\\", then understands_algorithm must also be \\\"true\\\" — no exceptions.\"},{\"clientId\":\"e5cd1e53-0c43-4a0b-8272-481ecce29e2e\",\"name\":\"key_concept_ai_response\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"This is your response to the student’s most recent message. You are helping them discover the full equation on their own. Do not reveal or summarize the full equation. Guide them based on what they have or haven’t figured out.\"},{\"clientId\":\"b61b2fab-46e2-44ef-abff-6992ba612721\",\"name\":\"understands_multiplication\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student understands that all three variables must be multiplied for each shot type: number of shots taken, shot success rate, and points per shot. If the previous value {{understands_multiplication}} is \\\"true\\\", keep it as \\\"true\\\".\"},{\"clientId\":\"5d322fa9-72db-401f-b668-285372ee028e\",\"name\":\"understands_addition\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student mentions or implies that they must add the point results from all shot types to get the total points. If the previous value {{understands_addition}} is \\\"true\\\", keep it as \\\"true\\\".\"},{\"clientId\":\"0a6235e1-7c5f-42d8-bdbc-b5472e940e01\",\"name\":\"understands_success_shots\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student mentions the chance, likelihood, percentage, or probability of making a shot. If the previous value {{understands_success_shots}} is \\\"true\\\", keep it as \\\"true\\\".\"},{\"clientId\":\"13f76ca4-653c-4124-a980-4650974987e9\",\"name\":\"understands_shot_points\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the student refers to the number of points per shot (e.g., 2-point shots, 3-point shots). If the previous value {{understands_shot_points}} is \\\"true\\\", keep it as \\\"true\\\".\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": true,
                          "stepId": "363ceba5-a96c-44b4-983a-e70e7b91644e",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "",
                          "message": "{{key_concept_ai_response}}",
                          "saveResponseVariableName": "recent_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              }
          ]
      },
      {
          "_id": "669ff64815910984d28a3fb1",
          "clientId": "909a0d5a-345d-4f6e-8d9c-2e7f6cfa4714",
          "title": "3. Basketball Game - Explain Concepts",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "5234ef34-7815-45e6-a2bc-1d05fb4fcac1",
                  "name": "Flow 1 ",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "235ad4fa-b6c0-4e92-a4b3-e292b89e0472",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Please explain what variables we are able to freely change.",
                          "saveResponseVariableName": "recent_message",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "b04c586a-59b8-49ac-96fc-3f2fd7754540",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Basketball shooting strategy discussion\n\nYou are helping the user understand how points are calculated in a basketball game. Internally, the formula for calculating the total points from a shot type is:\n(number of shots taken) × (shot success rate) × (points per shot).\n\nHowever, do NOT reveal this formula to the user.\n\nThe goal is to guide the user toward realizing that the only variable they can freely control is the number of shots taken.\n\nThe user's last message contains their attempt to identify which variable can be changed. Your task is to respond thoughtfully based on the accuracy of their reasoning:\n\nIf they are correct:\n- Acknowledge their answer positively and affirm their line of thinking. Reinforce their insight with encouragement, but avoid explicitly stating or revealing the underlying formula. Instead, you can highlight how their reasoning aligns with what players can influence in real gameplay situations.\n\nIf they are incorrect or unsure:\n- Respond with empathy and gently challenge their assumption. Rather than correcting them outright, ask guiding questions or offer subtle hints to help them reconsider. Steer the conversation toward helping them realize that the only variable truly within their control is the type of shot they choose to take, whether they go for 3-pointers, mid-range, or close-range attempts. Maintain a positive and supportive tone, framing this as part of an engaging learning process.\n\nHere is the users most recent message: {{recent_message}}",
                          "responseFormat": "You are speaking with the student in the first person. Please keep your response short, 1-2 sentences max. Do not give them the direct answer. Do not mention the existence of an equation.\n\nSpeak conversationally and keep your tone supportive and curious, encouraging further thinking if needed.",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.TEXT,
                          "jsonResponseData": "[]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": false,
                          "stepId": "5a72338d-4039-4e14-b8a0-d5d6fb2a08d8",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Please explain the algorithm for determining the number of points we make in a game for a single shot type.",
                          "saveResponseVariableName": "algorithm_explanation",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "ea99c1b9-5b23-4e70-b959-51e438463f36",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Basketball Total Points Evaluation\n\nWe are testing the user's understanding of the full algorithm used to calculate total points in a basketball game. The internal algorithm is:\n\n(number of middle shots taken × % middle shot success × points per middle shot)\n+ (number of inside shots taken × % inside shot success × points per inside shot)\n+ (number of outside shots taken × % outside shot success × points per outside shot)\n\nIn words:\nThe total points made in a basketball game is the sum of the points from each shot type.\nFor each shot type, the points are calculated by multiplying:\n - the number of shots taken\n - the percentage success rate for that shot type\n - and the number of points per shot.\n\nDo NOT show or mention this formula or explanation to the user.\n\nThe user has submitted their explanation of how they believe total points are calculated.\n\nYour task:\n\n1. Review the user’s explanation: {{algorithm_explanation}}\n\n2. Evaluate whether they demonstrate understanding of:\n - Multiplying the three variables for each shot type (shots × success rate × shot value)\n - Adding the results of the three shot types together\n - Considering the success rate (likelihood of making a shot)\n - Recognizing the number of points scored per successful shot\n\n3. Based on their explanation, return true/false values for the fields below.\n\n",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"03d7a43d-4b19-45cf-86d1-a73de27922e2\",\"name\":\"understands_algorithm\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" only if all of the following fields are also \\\"true\\\": understands_multiplication, understands_addition, and understands_success_shots. Otherwise, return \\\"false\\\".\"},{\"clientId\":\"8935d910-9d40-4265-a492-b1bfb60a5c70\",\"name\":\"understands_multiplication\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the user clearly demonstrates they understand that all three variables (number of shots, shot success rate, and points per shot) must be multiplied for each shot type. Otherwise, \\\"false\\\".\"},{\"clientId\":\"34da17b7-813b-4d49-a1ad-0f51ce295070\",\"name\":\"understands_addition\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the user mentions or implies that they are combining or adding the results from each shot type to find the total points in a game. Otherwise, \\\"false\\\".\"},{\"clientId\":\"0e0ff462-fa97-4e32-9d15-f608a05d0e30\",\"name\":\"understands_success_shots\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the user refers to the chance, probability, or percentage of making a shot (i.e., the success rate). Otherwise, \\\"false\\\".\"},{\"clientId\":\"91aebe5a-b216-4b9f-84b3-049963fd21ce\",\"name\":\"understands_shot_points\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the user mentions or considers the number of points earned per shot (e.g., 2 points, 3 points, etc.). Otherwise, \\\"false\\\".\"}]",
                          "customSystemRole": ""
                      }
                  ]
              }
          ]
      },
      {
          "_id": "669ffb0915910984d28a4471",
          "clientId": "9265f1ef-2a2e-4a14-b98f-5bbf6fd879d8",
          "title": "6. Basketball Game - Discuss New Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "5350cbf7-4b2d-49fc-9acf-e5bd24e44cdb",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "5db586aa-1341-439e-a6f2-90dcab764b74",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Can we do even better than this? What strategy should we try next?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "b9eaf4b9-a9fb-4499-8e9a-24da5c182baa",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Basketball Team Performance analysis.\nThe user is trying to determine the best shooting strategy for their basketball team in order to make the most points.\n\nIn their response, we are looking to see if they understand that the best strategy to be 100 outside shots (3 pointers). We are also looking for percentage of inside shots, middle shots, and outside shots. We are also looking for the number of points given for a single inside shot, middle shot, and outside shot.\n\nHere is the users strategy: {{user_hypothesis}}",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"7c776956-b4dd-45cb-8893-e264e6a173e8\",\"name\":\"inside_shot_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"the users desired percent of inside shots for their team to take. You MUST include this variable IF AND ONLY IF you end up generating one of the three shot percentages (middle_shot_percent, inside_shot_percent, and outside_shot_percent).The three MUST not summate above 100.\"},{\"clientId\":\"73567cc0-f0d9-4bdd-bad0-2d282aa64c2c\",\"name\":\"inside_shot_points\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"the number of points the user thinks their team should receive for an inside shot. If none provided by user, leave as 0.\"},{\"clientId\":\"eae4efeb-bd42-47c8-bfec-236bbd0d8749\",\"name\":\"middle_shot_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"the users desired percent of middle shots for their team to take. You MUST include this variable IF AND ONLY IF you end up generating one of the three shot percentages (middle_shot_percent, inside_shot_percent, and outside_shot_percent). The three MUST not summate above 100.\"},{\"clientId\":\"3a90eca3-f52c-47d8-bc77-4356e09629db\",\"name\":\"mid_shot_points\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"the number of points the user thinks their team should receive for a middle shot. If none provided by user, leave as 0.\"},{\"clientId\":\"d9797216-47e8-4136-94c3-89543ce6c0f4\",\"name\":\"outside_shot_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"the users desired percent of outside shots for their team to take. You MUST include this variable IF AND ONLY IF you end up generating one of the three shot percentages (middle_shot_percent, inside_shot_percent, and outside_shot_percent). The three MUST not summate above 100.\"},{\"clientId\":\"c775465a-45e5-4ff3-adad-c00ddc542620\",\"name\":\"outside_shot_points\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"the number of points the user thinks their team should receive for an outside shot. If none provided by user, leave as 0.\"},{\"clientId\":\"dcd4db2c-7443-4bf7-97cc-709060f26801\",\"name\":\"best_strategy_found\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"true/false string, set to true if the users strategy involves doing all 100 shots as outside shots (3 pointers)\"}]",
                          "customSystemRole": ""
                      }
                  ]
              }
          ]
      },
      {
          "_id": "66a2a5b10707adab799e3ea6",
          "clientId": "bdf123b5-1fd1-4de9-bc4e-74a53623475a",
          "title": "8. Basketball Stage - Finished",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "db1d632f-911b-488a-bc45-853f57626df8",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "bd288a89-e52b-4d9a-8d32-cd0ea6517b92",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Congratulations! You found the best strategy. Please run the simulation again."
                      }
                  ]
              }
          ]
      },
      {
          "_id": "680952766609962435d837d9",
          "clientId": "1543bf48-01c4-4b1c-93cf-db1e4dcf56b7",
          "title": "1. Soccer Intro",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "491612e0-74e1-4c19-b01b-6020921b43bb",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "16aa4da0-94bf-4a9f-85a7-0b25932d5323",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Hi everyone, welcome to the Penalty Kick Challenge! We need to score more goals."
                      },
                      {
                          "lastStep": false,
                          "stepId": "49978f3a-0a68-4d96-9f34-8fd2276dd1a8",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Have you ever taken a penalty kick before? What’s your usual strategy when trying to score a goal?",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "e37c16c5-7206-4ebd-b58f-f95e38905c10",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Use simple, everyday language and avoid complex scientific terms where possible.\n If you must use one, define it simply.\nKeep the explanation short, maybe 2-3 sentences.\nUse bullet points for the key steps or ingredients.\nI have this strategy for the soccer: {{user_response}}. Please comment on my strategy.",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.TEXT,
                          "jsonResponseData": "[]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": false,
                          "stepId": "0e1a629f-6770-43ff-a487-0e0462054c6c",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "In this game, you'll choose your pattern to score goals.\n* You'll set your kicking strategy by deciding how often to kick left versus right for multiple rounds, like LLRRLLRRRL.\n* Once everyone has locked in their strategy, the simulation will run a batch of 10 kicks—whether your shot goes in or the goalkeeper makes a save. \n* After each batch of 10 kicks, you’ll see updated results showing the choices everyone made and how they affected the score. \n* I will provide feedback on your decisions to help refine your strategy."
                      },
                      {
                          "lastStep": false,
                          "stepId": "717da68b-e82c-423b-a9e2-624927cdf79c",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "In this game, your strong side is left, which means you score most of your goals that way. Use that to guide your pattern."
                      },
                      {
                          "lastStep": true,
                          "stepId": "fa3e298e-8285-4fc5-a1d1-989114a102a6",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Are you ready to take on the challenge and outsmart the goalkeeper?"
                      }
                  ]
              }
          ]
      },
      {
          "_id": "68100767ca4e3b05d89089dd",
          "clientId": "33a9f65d-92e6-441f-b512-1d4f2a53876b",
          "title": "2. Soccer Main",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "fd0fdb1d-3363-4c95-9b7e-1441bb172f53",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "d6dce6f3-418b-46d2-97c1-30de94d2844f",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Let's decide your strategy for the next 10 kicks!"
                      },
                      {
                          "lastStep": false,
                          "stepId": "5390082d-99b8-4830-b879-e7ee18e52ff8",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "You'll enter your kicking strategy in the voting panel. Once everyone has submitted their strategy, we'll run the simulation for 10 rounds. You'll get instant feedback and see how your choice affects your score. The leaderboard will track your progress, so let's see who can score the most goals!"
                      },
                      {
                          "lastStep": false,
                          "stepId": "8a4acf02-dc15-4f22-9e6a-33bac983cecd",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Ready to kick things off? Take a deep breath, think about your strategy, and make your first move!"
                      },
                      {
                          "lastStep": false,
                          "stepId": "15cdc14d-03e3-40d3-9d0c-c30042fb7952",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "What strategy would you like to take?",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "495af186-fb94-409a-9503-96ea12518fd1",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Use simple, everyday language and avoid complex scientific terms where possible.\nIf you must use one, define it simply.\nKeep the explanation short, maybe 2-3 sentences.\nUse bullet points for the key steps or ingredients.\nComment on my strategy {{user_response}} and advise me to enter the kicking sequence in Ls and Rs with length of 10 (e.g.LLLRRRRLRL). For example, if the strategy is \"I want to kick 70% left and 30% right that is because I feel the goalie reaches left more often\" you can say \"Great! That a good start. That is being said, in the next 10 rounds, you will kick 7 lefts and 3 rights. Now, enter your kicking sequence using exactly 10 letters, with only L for left and R for right. Make sure your sequence has exactly 7 Ls and 3 Rs, like this: LLLRLLRLRL.\"",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.TEXT,
                          "jsonResponseData": "[]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": false,
                          "stepId": "d9125d63-dfb9-40af-bfc6-1f14ba0d309f",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "",
                          "saveResponseVariableName": "user_kicking_seq",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "8790af68-2cf4-4faf-a9fa-ff1fa24695e6",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Use simple, everyday language and avoid complex scientific terms where possible.\n If you must use one, define it simply.\nKeep the explanation short, maybe 2-3 sentences.\nUse bullet points for the key steps or ingredients.\nIn general, comment on my kicking strategy and the kicking sequence for the next 10 rounds. Kicking strategy: {{user_response}}. Kicking sequence (L means left, R means right): {{user_kicking_seq}}",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.TEXT,
                          "jsonResponseData": "[]",
                          "customSystemRole": ""
                      }
                  ]
              }
          ]
      },
      {
          "_id": "6817c810a05a3ae02a9b52ba",
          "clientId": "4440db13-f5d4-4e48-be7f-bb869f68a055",
          "title": "3. Soccer Round End",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "e7349c04-5472-4df1-bf34-b32f94d6bd61",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "af65fc00-325d-4123-b882-0bd77ca15289",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Great, we’re all set to simulate your 10 kicks! Do you have any questions about your strategy or sequence?",
                          "saveResponseVariableName": "user_feedback",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "549d89ce-3e6c-4ec1-b0d3-a1b579ef7481",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "This is my feedback for the past round: {{user_feedback}}.\nComment on that feedback:\n- If it’s a question, answer it directly.\n- If it’s “No questions,” confirm and say “Great—let’s start the 10‑kick simulation!”\n- If it’s a suggestion or change request, say:  \n  “Got it—thanks for the feedback! You can tweak your strategy or sequence soon. We’ll begin the next round of simulation soon.”",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.TEXT,
                          "jsonResponseData": "[]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": true,
                          "stepId": "15c06ab0-f86d-4f47-8a5a-caad901ff035",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": ""
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391faf",
          "clientId": "6edb8b9f-8752-49a7-9327-acb2c80eebb9",
          "title": "(DEPRECATED) 7. Concert Ticket Sales - Discuss Best Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "26ed5d46-d0b2-48fe-8b53-5ee2f54a04b2",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "ca66c3cc-66d0-454a-b56e-b2f3088c041c",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are discussing with a student how to find the best concert ticket sales strategy to maximize total profit. The calculation for total profit from ticket sales is based on three ticket types:\n\n(number of Reserved tickets sold) * Reserved ticket sale success rate (forty percent) * profit per Reserved ticket (50 dollars)\n+\n(number of General Admission tickets sold) * General Admission ticket sale success rate (fifty percent) * profit per General Admission ticket (54 dollars)\n+\n(number of VIP tickets sold) * VIP ticket sale success rate (thirty-six percent) * profit per VIP ticket (75 dollars)\n\nOnly one variable can be changed: the number of tickets sold per ticket type. The student has a maximum of 100 tickets to distribute between the three ticket types.\n\nThe optimal strategy is to sell all 100 tickets as a mix of VIP Tickets and General Admission tickets, because this leads to the highest expected profit when applying the formula above. However, do not reveal this answer to the student.\n\nYour task is to guide the student toward discovering this strategy on their own. Use insights from the formula and the explanation to lead them with thoughtful questions and nudges. Reference or explore what they already understand, and avoid repeating what they’ve already figured out. Encourage logical reasoning and comparisons between ticket types to help them reach the best conclusion themselves.",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"b2e206d9-1a7e-40d4-92df-a355c4e44035\",\"name\":\"best_strategy_found\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"true/false string, set to true if the user's strategy involves selling all 100 tickets as a mix of VIP Tickets and General Admissions Tickets (highest profit categories)\"},{\"clientId\":\"5f3628ad-21ce-4561-b7bb-03470d78bb4e\",\"name\":\"response_to_strategy\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"Your direct response to the student’s proposed strategy. Keep it brief, between 1–3 sentences. Do not reveal the optimal answer unless the student already discovered it.\"},{\"clientId\":\"3b1e24e1-df69-4dfd-8882-da59f86a286e\",\"name\":\"vip_ticket_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"The student's desired percent of VIP tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"},{\"clientId\":\"8b07401e-a619-4d94-99fd-c1d88794362b\",\"name\":\"reserved_ticket_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"The student's desired percent of Reserved tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"},{\"clientId\":\"cd66cdd3-caf3-4dad-8a23-04a781b7a287\",\"name\":\"general_admission_ticket_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"The student's desired percent of General Admission tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"}]",
                          "customSystemRole": "You are a basketball game master having a discussion with a student about the Best Shooting Strategy in a basketball game."
                      },
                      {
                          "lastStep": true,
                          "stepId": "74ed93f6-6884-4a07-bb66-394d2da254de",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "ca66c3cc-66d0-454a-b56e-b2f3088c041c",
                          "message": "{{response_to_strategy}}",
                          "saveResponseVariableName": "",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391fb0",
          "clientId": "e20e0247-03a2-485f-b0be-b12ceb2af8b9",
          "title": "2. Concert Ticket Sales - Collect Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "d4130626-f438-44ac-b85f-56a04048c757",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "d8741382-e1a9-457f-898e-e3062c23832a",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "986bcdf1-8afc-42db-92a1-7f592049620c",
                          "message": "What mix of tickets should we sell to make the most money?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "225cc2e6-9b7b-477f-ae1e-ae00cac911ff",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Why do you think this strategy would do better?",
                          "saveResponseVariableName": "why_their_strategy",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "4790e1a4-139c-465f-89a0-a3bcb276f56b",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Concert Ticket Sales Strategy Analysis\n\nInternal Reference Formula (Do Not Share with Student):\n\nTotal revenue from ticket sales =\n    (Number of VIP tickets offered × VIP ticket conversion rate × Price per VIP ticket) +\n    (Number of Reserved tickets offered × Reserved ticket conversion rate × Price per Reserved ticket) +\n    (Number of General Admission tickets offered × General Admission ticket conversion rate × Price per General Admission ticket)\n\nThis formula calculates the total revenue as the sum of contributions from each ticket category, where each contribution is based on the number of tickets offered, the conversion rate, and the price of that ticket category.\n\nYour Task:\n\nA student has submitted a strategy and rationale for how they believe the concert venue should allocate their ticket sales among VIP, Reserved, and General Admission tickets to maximize total revenue.\n\nPlease evaluate the effectiveness of their strategy based on the internal formula, without revealing or referencing the formula directly. In your response, assess:\n- How well the strategy aligns with maximizing total revenue.\n- Whether the student's explanation shows an understanding of the key variables involved (e.g., ticket category conversion rate, quantities offered, and ticket prices).\n- Any assumptions or trade-offs that may help or hurt the strategy's performance.\n\nAdditionally, you must extract the ticket distribution from their strategy. The extracted distribution MUST add up to exactly 100 tickets across all types.\n\nHere is the student’s proposed ticket allocation strategy:\n{{user_hypothesis}}\n\nHere is their explanation for the strategy:\n{{why_their_strategy}}",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"53c0ae83-f6f0-4405-8880-d104c3a11c00\",\"name\":\"responseMessage\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"Your direct response to the student. This should be 1–2 sentences long. Do NOT mention or reveal the equation. Give brief feedback on whether their strategy and explanation seem effective or reasonable. Speak in the first person, as if you are replying directly to the student.\"},{\"clientId\":\"713f0f89-254a-41be-914c-d4e85e474462\",\"name\":\"vip_ticket_percent\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"The student's desired percent of VIP tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"},{\"clientId\":\"2236fd2a-4571-4f99-b6eb-69886d3ff1bb\",\"name\":\"reserved_ticket_percent\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"The student's desired percent of Reserved tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"},{\"clientId\":\"33460051-e51f-4ce8-ab87-3da70e153cf7\",\"name\":\"general_admission_ticket_percent\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"The student's desired percent of General Admission tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"}]",
                          "customSystemRole": ""
                      }
                  ]
              },
              {
                  "clientId": "e19c1a4c-3a96-430d-a933-ff444bd4e963",
                  "name": "Strategy Assistance",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "6867f296-2e81-4c23-a498-68de97ac6b8c",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Sounds like you’re having a hard time coming up with a strategy.\n\nLet’s try this:\nWe can sell 100 tickets total, and we get to decide how many of each type to sell. To achive the highest revenue, how many should be VIP, how many should be General Admission, and how many should be Reserved?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "986bcdf1-8afc-42db-92a1-7f592049620c",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are helping a middle school student decide how to split 100 tickets between VIP, General Admission, and Reserved to make the most revenue.\n\nInstructions:\n1. Determine if the user provided you with their strategy (must be able to account for all 100 tickets)\n2. If not, ask the user to choose how many of the 100 tickets should be each type (VIP, General Admission, Reserved).\n3. Remind them that the total must add up to 100 tickets.\n4. If the users asks a question, please provide a short answer to their questions aswell.\n\nRespond directly to the user in a warm, encouraging, and clear way.\n\nHere is the users proposed strategy: {{user_hypothesis}}\n\nPlease ONLY respond in the JSON format provided.",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"a389863f-e12c-41d0-885e-9ea620f96eba\",\"name\":\"responseMessage\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"Your response to the user.\"},{\"clientId\":\"13c1db2b-a24c-4397-99aa-abdc0240f74e\",\"name\":\"didUserProvideStrategy\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"true/false: Indicates whether the user has successfully provided their ticket distribution strategy, either explicitly listing the desired allocation of all 100 tickets across types or describing it in a way that allows us to clearly infer the full distribution.\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "f3dc9e26-41b4-49fc-9fcf-5ddbe0d67dad",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "didUserProvideStrategy",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "225cc2e6-9b7b-477f-ae1e-ae00cac911ff"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "5602f95b-b325-44d2-88fe-9e83993700ad",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "986bcdf1-8afc-42db-92a1-7f592049620c",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391fb1",
          "clientId": "f289f022-3fa7-42a1-9d3d-0642c3015867",
          "title": "5. Concert Ticket Sales - Select Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "d5b6a9a2-7be5-48db-8ace-0441cced2313",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "b202321c-6b13-46c2-9bd9-affc2185c844",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Please select a strategy from the bottom of the \"Simulation\" section to view a simulation."
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391fb2",
          "clientId": "64de5488-c851-41b3-8347-18ffa340c753",
          "title": "1. Concert Ticket Sales - Intro messages",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "511bfe4e-89bd-40af-a91e-b13c52268776",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "a199aac1-1959-4988-ab5b-bd1bb06d12e3",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Hey everyone,\nWe’re not meeting our revenue goals, even with great performers. Management needs you and the sales analyst team to help figure out how to improve our ticket sales strategy.\n\nWe can sell up to 100 tickets, and we have three types:\n\nVIP – highest revenue, hardest to sell\n\nReserved – medium revenue, easier to sell\n\nGeneral Admission – lowest revenue, easiest to sell"
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391fb3",
          "clientId": "821ea615-c727-4d3d-bd35-30f0ba3866a9",
          "title": "(DEPRECATED) 4. Concert Ticket Sales - LLM Key Concepts Conversation",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "4de90196-803c-4122-b6bb-93ffca02774c",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "f3b61e6b-25a6-416e-99c2-4dcc1f370e6a",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": ""
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391fb4",
          "clientId": "0d8f3055-373f-4726-9392-b3fd1dac8385",
          "title": "3. Concert Ticket Sales - Understanding Equation",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "af42aed7-b73e-4afe-bc39-bf751538aabf",
                  "name": "Flow 1 ",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "b6f3ef92-f18e-49cb-8985-5c33fb0b4faa",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Awesome—now that we’ve got a new strategy, let’s see how much revenue it could bring in. We’ll build a projected revenue equation to show in the APPROACH section."
                      },
                      {
                          "lastStep": false,
                          "stepId": "235ad4fa-b6c0-4e92-a4b3-e292b89e0472",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "61370212-e604-4920-a583-2a50793ab966",
                          "message": "To begin, consider how to calculate revenue from a single ticket type. We already know one variable is the number of tickets sold. What other value must we include to accurately compute total revenue for that ticket category?",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "7eb6026b-dce2-41a6-87b3-3427df72d789",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": ""
                      }
                  ]
              },
              {
                  "clientId": "d12ee7f8-8aad-47b0-8f36-c375efbf57b2",
                  "name": "Assist Understanding Single Ticket Revenue",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "61370212-e604-4920-a583-2a50793ab966",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are assisting a middle school student in understanding linear optimization through a real-life scenario about selling concert tickets. We are focusing on ensuring the student understands that the amount of money we will make from a single ticket type is based on this equation:\n\n(# of ticket type put up for sale) * (Price of ticket type) * (conversion rate of ticket type)\n\nWe are assessing if the student fully understands the equation.\n\nHere is the student's input of their current understanding:\n--- START USER INPUT ---\n{{user_response}}\n--- END USER INPUT ---\n\nYour task:\n1. Evaluate if the student shows gaps in understanding any of the three parts.\n2. Gently guide the student to discover the missing parts themselves without giving away the full equation. Do NOT reveal the equation to the user. Do NOT talk about parts of the equation that the user has not figured out yet\n3. Use warm, clear, middle-school-friendly language.\n\nRules:\n- Whenever you refer to the \"calculation,\" please instead call it the \"single ticket type revenue calculation\"",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"6527af4e-9e95-4fcc-80cd-1486a634009c\",\"name\":\"understands_ticket_prices\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"return \\\"true\\\" if the user mentions anything about the price per ticket, OR OR IF THE FOLLOWING VALUE IN PARENTHESES IS TRUE, THEN YOU MUST RETURN TRUE NO MATTER WHAT: ({{understands_ticket_prices}})\"},{\"clientId\":\"e628e9b1-a710-4ad0-87d0-c836ca9bf626\",\"name\":\"understands_conversion_rate\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"return \\\"true\\\" if the student mentions anything related to the conversion rate, how many tickets we end up selling, or similar concepts, OR IF THE FOLLOWING VALUE IN PARENTHESES IS TRUE, THEN YOU MUST RETURN TRUE NO MATTER WHAT: ({{understands_conversion_rate}})\"},{\"clientId\":\"4e7caf4c-6cf4-453f-9c7a-4bba12ddcc0a\",\"name\":\"understands_multiplication\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"return \\\"true\\\" if the user mentions anything about multipying the three variables (number of tickets, conversion rate, and profit/revenue/money per ticket), OR IF THE FOLLOWING VALUE IN PARENTHESES IS TRUE, THEN YOU MUST RETURN TRUE NO MATTER WHAT: ({{understands_multiplication}})\"},{\"clientId\":\"2e5dbc2c-ff79-435b-b07a-7c0f901e5262\",\"name\":\"responseMessage\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"your response. If understands_equation is \\\"true\\\", then don't pose a question to the user. Just congratulate them on figuring out how much money is made from a single ticket type. Please respond in 1-2 sentences.\"},{\"clientId\":\"73a9df62-b284-409b-8e63-151f535f525d\",\"name\":\"understands_equation\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the user understands the three parts to the equation: ticket price, conversion rate, and that they must multiply the parts together. IF understands_ticket_prices, understands_conversion_rate, and understands_multiplication are all \\\"true\\\", then this must also be \\\"true\\\". else \\\"false\\\"\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "58325f8a-9864-4163-93d8-425409034006",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_equation",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "bc64d1e8-492f-48bf-b293-3a177d11705e"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "4fd7ddfa-f0c8-434a-8a84-9662743d537f",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "61370212-e604-4920-a583-2a50793ab966",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              },
              {
                  "clientId": "3ce8ddf3-5eab-4bfe-9308-720de20ff818",
                  "name": "Assist Understanding Summation",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "bc64d1e8-492f-48bf-b293-3a177d11705e",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Great! Looks like we now understand how to calculate the revenue for a single ticket type."
                      },
                      {
                          "lastStep": false,
                          "stepId": "85ac34ed-9863-497d-a7fa-a9c67a1cf3e8",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Now, how do you think we can find the grand total revenue from all the tickets we are selling?",
                          "saveResponseVariableName": "algorithm_explanation",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "d460471c-96b2-445a-800b-6b0286428e05",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Concert Ticket Sales Revenue Evaluation\n\nWe are testing the user's understanding that they must add together the revenue from the three different ticket types from this algorithm in order to find the grand total revenue:\n\n(GA Ticket Projected Revenue)\n+\n(Reserved Ticket Projected Revenue)\n+\n(VIP Ticket Projected Revenue)\n\nIn words:\nThe total revenue from ticket sales is the sum of the revenue from each ticket category.\n\nDo NOT show or mention this formula or explanation to the user.\nThe user has submitted their explanation of how they believe total revenue is calculated.\nYour task:\n1. Review the user’s explanation: {{algorithm_explanation}}\n\n2. Evaluate whether they demonstrate understanding of:\n- Adding the results of the three ticket categories together\n\n3. Based on their explanation, return true/false values for the fields below.\n4. Also, in your responseMessage gently guide the student to discover the addition factor themselves without giving away the full equation.",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"a9b1fa0c-9456-4de5-95e5-bbe459ad50fb\",\"name\":\"understands_addition\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"\\\"true\\\" if the user mentions or implies that they are combining or adding the results from each ticket category to find the total revenue. Otherwise, \\\"false\\\".\"},{\"clientId\":\"aca7dead-712a-4629-a64b-b1c5c74a075e\",\"name\":\"responseMessage\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"your response message. Please respond in 1-2 sentences.\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": false,
                          "stepId": "52e1a226-3e5b-4582-ae14-9aae3d4575a5",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "{{responseMessage}}"
                      },
                      {
                          "stepId": "6ec762f5-9079-4da2-aeaa-aa3632c9c727",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_addition",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "7eb6026b-dce2-41a6-87b3-3427df72d789"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "ef7bad40-720c-43ab-a1a9-e7502da9057c",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "d460471c-96b2-445a-800b-6b0286428e05",
                          "message": "",
                          "saveResponseVariableName": "algorithm_explanation",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391fb5",
          "clientId": "80419d6d-1eca-491e-a648-8db3db951c02",
          "title": "6. Concert Ticket Sales - Determine Best Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "8f2dd162-a5ab-48e8-8d15-7bb5afb1119d",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "5db586aa-1341-439e-a6f2-90dcab764b74",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Can we do even better than this? What new ticket sales distribution strategy should we try next?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "b9eaf4b9-a9fb-4499-8e9a-24da5c182baa",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are discussing with a student how to find the best concert ticket sales strategy to maximize total revenue. The calculation for total revenue from ticket sales is based on three ticket types:\n\nprice of Reserved ticket * number of Reserved tickets up for sale * Reserved ticket conversion rate\n+\nprice of General Admission ticket * number of General Admission tickets up for sale * General Admission ticket conversion rate\n+\nprice of VIP ticket * number of VIP tickets up for sale * VIP ticket sale conversion rate\n\nOnly one variable can be changed: the number of tickets sold per ticket type. The student has a maximum of 100 tickets to distribute between the three ticket types.\n\nThe optimal strategy is to sell all 100 tickets as a mix of VIP Tickets and General Admission tickets, because this leads to the highest expected revenue when applying the formula above. However, do not reveal this answer to the student.\n\nYour task is to guide the student toward discovering the strategy of using a mix of VIP tickets and General Admission tickets, NOT reserved tickets.. Use insights from the formula and the explanation to lead them with thoughtful questions and nudges. Reference or explore what they already understand, and avoid repeating what they’ve already figured out. Encourage logical reasoning and comparisons between ticket types to help them reach the best conclusion themselves.\n\nHere is the users most recent message: {{user_hypothesis}}",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\":\"1ee06f68-5a0c-4276-9b4a-a710f8153a36\",\"name\":\"vip_ticket_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"The student's desired percent of VIP tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100. ONLY include if best_strategy_found is true\"},{\"clientId\":\"76786523-f74f-4225-af21-d44a2983c7cf\",\"name\":\"reserved_ticket_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"The student's desired percent of Reserved tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100. ONLY include if best_strategy_found is true\"},{\"clientId\":\"80203a46-0e3b-4c8b-8f61-5777de987548\",\"name\":\"general_admission_ticket_percent\",\"type\":\"string\",\"isRequired\":false,\"additionalInfo\":\"The student's desired percent of General Admission tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100. ONLY include if best_strategy_found is true\"},{\"clientId\":\"2f735a36-fe27-4fd6-a687-50033dd71eaf\",\"name\":\"best_strategy_found\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"true/false string, set to true if the user's strategy involves selling all 100 tickets as a mix of VIP Tickets and General Admissions tickets (NO reserved tickets) ENSURE that the users proposed strategy refers to ONLY VIP and General Admissions, and NOT reserved tickets\"},{\"clientId\":\"264bff7f-ad35-4939-b491-d302f81f4de2\",\"name\":\"responseMessage\",\"type\":\"string\",\"isRequired\":true,\"additionalInfo\":\"your guiding response to the user\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "a71e730d-94ee-4d39-a5f5-7c6ba05b8d91",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "best_strategy_found",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "a9a18f5c-ce3e-46d4-b0e3-32ac4694105c"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "e9680649-feaf-41a4-9c41-f192d3b1c625",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "b9eaf4b9-a9fb-4499-8e9a-24da5c182baa",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "a9a18f5c-ce3e-46d4-b0e3-32ac4694105c",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": ""
                      }
                  ]
              }
          ]
      },
      {
          "_id": "687543b3c1c6102944391fb6",
          "clientId": "d1323982-4f52-491e-b5e0-dbc70250e52b",
          "title": "8. Concert Ticket Sales - Finished",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "a73ff2eb-dd9e-428b-8b6b-8c540332255b",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "bd288a89-e52b-4d9a-8d32-cd0ea6517b92",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Congratulations! You found the best ticket sales strategy: selling only General Admission and VIP Tickets because they have the highest projected revenue. Through this activity, you discovered that total revenue depends on three things: how many tickets you sell, how often you sell them (success rate), and how much each ticket is worth. You also learned how to compare strategies by multiplying and adding across ticket types. Great work thinking it through!"
                      }
                  ]
              }
          ]
      },
      {
          "_id": "68923dbfdaba7ec53ea15e67",
          "clientId": "2f9c8097-74b1-40ff-9199-36431b6095b9",
          "title": "1. Test Base - Intro messages",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "00a90568-15c1-41ef-9d0a-3390dcf17bb4",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "a199aac1-1959-4988-ab5b-bd1bb06d12e3",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Test Base: Hey everyone,\nWe’re not meeting our revenue goals, even with great performers. Management needs you and the sales analyst team to help figure out how to improve our ticket sales strategy.\n\nWe can sell up to 100 tickets, and we have three types:\n\nVIP – highest revenue, hardest to sell\n\nReserved – medium revenue, easier to sell\n\nGeneral Admission – lowest revenue, easiest to sell"
                      }
                  ]
              }
          ]
      },
      {
          "_id": "68923dbfdaba7ec53ea15e68",
          "clientId": "2db20f92-8e48-4f2a-a23c-af94c9e7ee22",
          "title": "6. Test Base - Determine Best Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "be7e651d-fc8b-4ff4-aaf2-b858b2329645",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "5db586aa-1341-439e-a6f2-90dcab764b74",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Can we do even better than this? What new ticket sales distribution strategy should we try next?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "b9eaf4b9-a9fb-4499-8e9a-24da5c182baa",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are discussing with a student how to find the best concert ticket sales strategy to maximize total revenue. The calculation for total revenue from ticket sales is based on three ticket types:\n\nprice of Reserved ticket * number of Reserved tickets up for sale * Reserved ticket conversion rate\n+\nprice of General Admission ticket * number of General Admission tickets up for sale * General Admission ticket conversion rate\n+\nprice of VIP ticket * number of VIP tickets up for sale * VIP ticket sale conversion rate\n\nOnly one variable can be changed: the number of tickets sold per ticket type. The student has a maximum of 100 tickets to distribute between the three ticket types.\n\nThe optimal strategy is to sell all 100 tickets as a mix of VIP Tickets and General Admission tickets, because this leads to the highest expected revenue when applying the formula above. However, do not reveal this answer to the student.\n\nYour task is to guide the student toward discovering the strategy of using a mix of VIP tickets and General Admission tickets, NOT reserved tickets.. Use insights from the formula and the explanation to lead them with thoughtful questions and nudges. Reference or explore what they already understand, and avoid repeating what they’ve already figured out. Encourage logical reasoning and comparisons between ticket types to help them reach the best conclusion themselves.\n\nHere is the users most recent message: {{user_hypothesis}}",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\": \"1c7aafbd-0a0c-4b91-add3-ecde6138540d\", \"name\": \"vip_ticket_percent\", \"type\": \"string\", \"isRequired\": false, \"additionalInfo\": \"The student's desired percent of VIP tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100. ONLY include if best_strategy_found is true\"}, {\"clientId\": \"876eb3a6-c45f-4274-83c7-25743b492e59\", \"name\": \"reserved_ticket_percent\", \"type\": \"string\", \"isRequired\": false, \"additionalInfo\": \"The student's desired percent of Reserved tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100. ONLY include if best_strategy_found is true\"}, {\"clientId\": \"514f34e7-0f93-4239-bdf5-f40166bbc8f6\", \"name\": \"general_admission_ticket_percent\", \"type\": \"string\", \"isRequired\": false, \"additionalInfo\": \"The student's desired percent of General Admission tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100. ONLY include if best_strategy_found is true\"}, {\"clientId\": \"4d893d86-80cd-46bd-a050-97fb5329d9e1\", \"name\": \"best_strategy_found\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"true/false string, set to true if the user's strategy involves selling all 100 tickets as a mix of VIP Tickets and General Admissions tickets (NO reserved tickets) ENSURE that the users proposed strategy refers to ONLY VIP and General Admissions, and NOT reserved tickets\"}, {\"clientId\": \"ad413a47-706c-4356-8ca0-aa0ae76bb2a5\", \"name\": \"responseMessage\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"your guiding response to the user\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "a71e730d-94ee-4d39-a5f5-7c6ba05b8d91",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "best_strategy_found",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "a9a18f5c-ce3e-46d4-b0e3-32ac4694105c"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "e9680649-feaf-41a4-9c41-f192d3b1c625",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "b9eaf4b9-a9fb-4499-8e9a-24da5c182baa",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "a9a18f5c-ce3e-46d4-b0e3-32ac4694105c",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": ""
                      }
                  ]
              }
          ]
      },
      {
          "_id": "68923dbfdaba7ec53ea15e65",
          "clientId": "4269f917-e942-4138-8245-3f13f243c07f",
          "title": "8. Test Base - Finished",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "28d94a30-6eab-4714-be16-1f2cabc89477",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "bd288a89-e52b-4d9a-8d32-cd0ea6517b92",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Congratulations! You found the best ticket sales strategy: selling only General Admission and VIP Tickets because they have the highest projected revenue. Through this activity, you discovered that total revenue depends on three things: how many tickets you sell, how often you sell them (success rate), and how much each ticket is worth. You also learned how to compare strategies by multiplying and adding across ticket types. Great work thinking it through!"
                      }
                  ]
              }
          ]
      },
      {
          "_id": "68923dbfdaba7ec53ea15e64",
          "clientId": "b32ba455-11c3-4ec8-8821-61f435abd923",
          "title": "3. Test Base - Understanding Equation",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "9296654a-fb8b-4425-a8d3-ffb12f335b0d",
                  "name": "Flow 1 ",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "b6f3ef92-f18e-49cb-8985-5c33fb0b4faa",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Awesome—now that we’ve got a new strategy, let’s see how much revenue it could bring in. We’ll build a projected revenue equation to show in the APPROACH section."
                      },
                      {
                          "lastStep": false,
                          "stepId": "235ad4fa-b6c0-4e92-a4b3-e292b89e0472",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "61370212-e604-4920-a583-2a50793ab966",
                          "message": "To begin, consider how to calculate revenue from a single ticket type. We already know one variable is the number of tickets sold. What other value must we include to accurately compute total revenue for that ticket category?",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "7eb6026b-dce2-41a6-87b3-3427df72d789",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": ""
                      }
                  ]
              },
              {
                  "clientId": "3657c97d-c3a2-47e1-8142-503c5e1002e8",
                  "name": "Assist Understanding Single Ticket Revenue",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "61370212-e604-4920-a583-2a50793ab966",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are assisting a middle school student in understanding linear optimization through a real-life scenario about selling concert tickets. We are focusing on ensuring the student understands that the amount of money we will make from a single ticket type is based on this equation:\n\n(# of ticket type put up for sale) * (Price of ticket type) * (conversion rate of ticket type)\n\nWe are assessing if the student fully understands the equation.\n\nHere is the student's input of their current understanding:\n--- START USER INPUT ---\n{{user_response}}\n--- END USER INPUT ---\n\nYour task:\n1. Evaluate if the student shows gaps in understanding any of the three parts.\n2. Gently guide the student to discover the missing parts themselves without giving away the full equation. Do NOT reveal the equation to the user. Do NOT talk about parts of the equation that the user has not figured out yet\n3. Use warm, clear, middle-school-friendly language.\n\nRules:\n- Whenever you refer to the \"calculation,\" please instead call it the \"single ticket type revenue calculation\"",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\": \"ae4f2467-e10f-4043-ad12-dad80e0413fd\", \"name\": \"understands_ticket_prices\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the user mentions or considers the profit/money/revenue earned per ticket sold, or if this value is already true: {{understands_ticket_prices}}. Otherwise, \\\"false\\\".\"}, {\"clientId\": \"9c881b83-a8a7-4bd8-b969-191d9dc80c0e\", \"name\": \"understands_conversion_rate\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the student mentions anything related to the conversion rate, the proportion of tickets sold, the percent of tickets sold, how many tickets we end up selling, or similar concepts, or if this value is already true: {{understands_conversion_rate}}. Otherwise, \\\"false\\\".\\\"\"}, {\"clientId\": \"e6bdecab-5240-4348-aedd-4da1fd11b4a2\", \"name\": \"understands_multiplication\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the user clearly demonstrates they understand that all three variables (number of tickets, conversion rate, and profit/revenue/money per ticket) must be multiplied together, or if this value is already true: {{understands_multiplication}}. Otherwise, \\\"false\\\".\"}, {\"clientId\": \"25d45e57-648f-4256-856a-763a60b87c25\", \"name\": \"responseMessage\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"your response. If understands_equation is \\\"true\\\", then don't pose a question to the user. Just congratulate them on figuring out how much money is made from a single ticket type. Please respond in 1-2 sentences.\"}, {\"clientId\": \"cb935ab0-c2ca-40e9-89f3-8f2446a67552\", \"name\": \"understands_equation\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the user understands the three parts to the equation: ticket price, conversion rate, and that they must multiply the parts together. IF understands_ticket_prices, understands_conversion_rate, and understands_multiplication are all \\\"true\\\", then this must also be \\\"true\\\". else \\\"false\\\"\"}, {\"clientId\": \"6b580331-3ec9-43ab-a7cd-6d1cfc6419d3\", \"name\": \"num_rounds\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"Here is the starting number: {{num_rounds}}. If the starting number is missing, start at 1, RETURN the starting number incremented by 1\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "58325f8a-9864-4163-93d8-425409034006",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_equation",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "bc64d1e8-492f-48bf-b293-3a177d11705e"
                              },
                              {
                                  "stateDataKey": "num_rounds",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.GREATER_THAN_EQUALS,
                                  "expectedValue": "5",
                                  "targetStepId": "6da5ebe6-db4a-4ac6-80fc-b5bc5acccbf6"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "4fd7ddfa-f0c8-434a-8a84-9662743d537f",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "61370212-e604-4920-a583-2a50793ab966",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              },
              {
                  "clientId": "061a56be-ec14-4372-9589-23e725ee14cb",
                  "name": "Assist Understanding Summation",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "bc64d1e8-492f-48bf-b293-3a177d11705e",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Great! Looks like we now understand how to calculate the revenue for a single ticket type."
                      },
                      {
                          "lastStep": false,
                          "stepId": "85ac34ed-9863-497d-a7fa-a9c67a1cf3e8",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Now, how do you think we can find the grand total revenue from all the tickets we are selling?",
                          "saveResponseVariableName": "algorithm_explanation",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "d460471c-96b2-445a-800b-6b0286428e05",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Concert Ticket Sales Revenue Evaluation\n\nWe are testing the user's understanding that they must add together the revenue from the three different ticket types from this algorithm in order to find the grand total revenue:\n\n(GA Ticket Projected Revenue)\n+\n(Reserved Ticket Projected Revenue)\n+\n(VIP Ticket Projected Revenue)\n\nIn words:\nThe total revenue from ticket sales is the sum of the revenue from each ticket category.\n\nDo NOT show or mention this formula or explanation to the user.\nThe user has submitted their explanation of how they believe total revenue is calculated.\nYour task:\n1. Review the user’s explanation: {{algorithm_explanation}}\n\n2. Evaluate whether they demonstrate understanding of:\n- Adding the results of the three ticket categories together\n\n3. Based on their explanation, return true/false values for the fields below.\n4. Also, in your responseMessage gently guide the student to discover the addition factor themselves without giving away the full equation.",
                          "responseFormat": "",
                          "includeChatLogContext": false,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\": \"34d1782f-d2b0-40d6-8e7b-11fc39750eba\", \"name\": \"understands_addition\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the user mentions or implies that they are combining or adding the results from each ticket category to find the total revenue. Otherwise, \\\"false\\\".\"}, {\"clientId\": \"a6f4d2db-40e4-40eb-9cec-b740073a6dfb\", \"name\": \"responseMessage\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"your response message. Please respond in 1-2 sentences.\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "lastStep": false,
                          "stepId": "52e1a226-3e5b-4582-ae14-9aae3d4575a5",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "{{responseMessage}}"
                      },
                      {
                          "stepId": "6ec762f5-9079-4da2-aeaa-aa3632c9c727",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_addition",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "7eb6026b-dce2-41a6-87b3-3427df72d789"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "ef7bad40-720c-43ab-a1a9-e7502da9057c",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "d460471c-96b2-445a-800b-6b0286428e05",
                          "message": "",
                          "saveResponseVariableName": "algorithm_explanation",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              },
              {
                  "clientId": "995b7629-63f4-4d08-847f-3d367a5ef18a",
                  "name": "Breakdown Single Ticket Revenue",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "6da5ebe6-db4a-4ac6-80fc-b5bc5acccbf6",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Looks like you may be struggling to understand this portion of the equation. Let's break it down."
                      },
                      {
                          "stepId": "86975899-66df-4cc9-b03a-60ea8a6c0092",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_conversion_rate",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "false",
                                  "targetStepId": "392d18a9-7dfd-4c92-8cbd-81d6d898b66a"
                              },
                              {
                                  "stateDataKey": "understands_multiplication",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "false",
                                  "targetStepId": "392d18a9-7dfd-4c92-8cbd-81d6d898b66a"
                              },
                              {
                                  "stateDataKey": "understands_ticket_prices",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "false",
                                  "targetStepId": "928997f9-b8b0-4037-9af5-3fba5719fced"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "392d18a9-7dfd-4c92-8cbd-81d6d898b66a",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "The first thing we need to figure out is how many tickets we expect to sell. If we know how many tickets we put up for sale, what should we add to the calculation to determine how many we will expect to sell?",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "2345f5d4-b97c-48ea-8fdd-b99f4a393d16",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are assisting a middle school student in understanding linear optimization through a real-life scenario about selling concert tickets. We are focusing on this portion of a linear optimization equation, that defines how many tickets we expect to sell:\n(Price of ticket type) * (conversion rate of ticket type)\n\nWe are assessing if the student understands this equation to find the number of tickets they expect to sell.\n\nHere is the student's input of their current understanding:\n--- START USER INPUT ---\n{{user_response}}\n--- END USER INPUT ---\n\nYour task:\n1. Evaluate if the student shows gaps in understanding the equation.\n2. Gently guide the student to discover the equation themselves without giving away the equation. Do NOT reveal the equation to the user. Do NOT talk about parts of the equation that the user has not figured out yet.\n3. Use warm, clear, middle-school-friendly language.\n\nRules:\n- Whenever you refer to the \"equation\" or \"calculation\", please instead refer to it as the \"equation to determine the expected number of tickets sold.\"",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\": \"c8821729-8e81-48fc-a632-e30b3a93b522\", \"name\": \"understands_conversion_rate\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the student mentions anything related to the conversion rate, the proportion of tickets sold, the percent of tickets sold, how many tickets we end up selling, or similar concepts, or if this value is already true: {{understands_conversion_rate}}. Otherwise, \\\"false\\\".\\\"\"}, {\"clientId\": \"630c0825-b088-4f77-b448-501c04677a7b\", \"name\": \"understands_multiplication\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the user clearly demonstrates they understand that you must multiply the number of tickets up for sale and the conversion rate, or if this value is already true: {{understands_multiplication}}. Otherwise, \\\"false\\\".\"}, {\"clientId\": \"33d25206-bae6-4022-be43-9c31f412701a\", \"name\": \"responseMessage\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"your response. If understands_tickets_sold_equation is \\\"true\\\", then don't pose a question to the user. Just congratulate them on figuring out how to determine the expected number of tickets sold. Please respond in 1-2 sentences.\"}, {\"clientId\": \"04abc385-a495-4c10-9dd7-76a77a52c902\", \"name\": \"understands_tickets_sold_equation\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the user understands the parts to the equation: conversion rate, and that they must multiply the conversion rate with the number of tickets up for sale. IF understands_conversion_rate and understands_multiplication are both \\\"true\\\", then this must also be \\\"true\\\". else \\\"false\\\"\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "19d06d03-1ee1-42e5-b6ae-982a7f006540",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_tickets_sold_equation",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "d2bf811b-afe2-41c9-a604-ef99facc77d0"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "21e8527e-796a-475f-b793-5efa3c130c21",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "2345f5d4-b97c-48ea-8fdd-b99f4a393d16",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "stepId": "d2bf811b-afe2-41c9-a604-ef99facc77d0",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "bc64d1e8-492f-48bf-b293-3a177d11705e",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_ticket_prices",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "false",
                                  "targetStepId": "928997f9-b8b0-4037-9af5-3fba5719fced"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "928997f9-b8b0-4037-9af5-3fba5719fced",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "We are now only missing 1 part of the equation to determine our revenue for a single ticket type. Any ideas what that might be?",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "9bca8772-27e0-4a26-8a80-ad5aa96f5be7",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are assisting a middle school student in understanding linear optimization through a real-life scenario about selling concert tickets. We are focusing on this portion of a linear optimization equation, that defines how much revenue we expect to make from a single ticket type:\n(Price of ticket type) * (expected # of tickets sold)\n\nWe are assessing if the student understands this equation to find the revenue for a single ticket type.\n\nHere is the student's input of their current understanding:\n--- START USER INPUT ---\n{{user_response}}\n--- END USER INPUT ---\n\nYour task:\n1. Evaluate if the student shows gaps in understanding the equation.\n2. Gently guide the student to discover the equation themselves without giving away the equation. Do NOT reveal the equation to the user. Do NOT talk about parts of the equation that the user has not figured out yet.\n3. Use warm, clear, middle-school-friendly language.\n\nRules:\n- Whenever you refer to the \"equation\" or \"calculation\", please instead refer to it as the \"equation to determine the revenue for a single ticket type.\"",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\": \"0ee7ec45-b41f-4397-a947-4490983d969a\", \"name\": \"understands_ticket_prices\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"\\\"true\\\" if the user mentions or considers the profit/money/revenue earned per ticket sold, or if this value is already true: {{understands_ticket_prices}}. Otherwise, \\\"false\\\".\"}, {\"clientId\": \"d413e09c-1383-4482-9d85-aaf691b607f7\", \"name\": \"responseMessage\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"your response. If understands_equation is \\\"true\\\", then don't pose a question to the user. Just congratulate them on figuring out how to determine the revenue of a single ticket type. Please respond in 1-2 sentences.\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "f6352288-d21b-4267-ac9d-286f38bfc2e2",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "understands_ticket_prices",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "bc64d1e8-492f-48bf-b293-3a177d11705e"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "11b4880d-7e72-454a-9282-f285063fdaf2",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "9bca8772-27e0-4a26-8a80-ad5aa96f5be7",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_response",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              }
          ]
      },
      {
          "_id": "68923dbfdaba7ec53ea15e66",
          "clientId": "7bf234eb-d864-40ed-8d24-3b5ff84a3991",
          "title": "5. Test Base - Select Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "c6e08865-1aa2-4f89-af97-b460be81c0b7",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": true,
                          "stepId": "b202321c-6b13-46c2-9bd9-affc2185c844",
                          "stepType": DiscussionStageStepType.SYSTEM_MESSAGE,
                          "jumpToStepId": "",
                          "message": "Please select a strategy from the bottom of the \"Simulation\" section to view a simulation."
                      }
                  ]
              }
          ]
      },
      {
          "_id": "68923dbfdaba7ec53ea15e63",
          "clientId": "b5bf0160-a586-49e5-86e4-eb00a375000b",
          "title": "2. Test Base - Collect Strategy",
          "stageType": "discussion",
          "description": "",
          "flowsList": [
              {
                  "clientId": "8d6cb696-4e17-44a3-b7fd-a4dc5369d52c",
                  "name": "Flow 1",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "d8741382-e1a9-457f-898e-e3062c23832a",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "986bcdf1-8afc-42db-92a1-7f592049620c",
                          "message": "What mix of tickets should we sell to make the most money?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "225cc2e6-9b7b-477f-ae1e-ae00cac911ff",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Why do you think this strategy would do better?",
                          "saveResponseVariableName": "why_their_strategy",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": true,
                          "stepId": "4790e1a4-139c-465f-89a0-a3bcb276f56b",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "Context: Concert Ticket Sales Strategy Analysis\n\nInternal Reference Formula (Do Not Share with Student):\n\nTotal revenue from ticket sales =\n    (Number of VIP tickets offered × VIP ticket conversion rate × Price per VIP ticket) +\n    (Number of Reserved tickets offered × Reserved ticket conversion rate × Price per Reserved ticket) +\n    (Number of General Admission tickets offered × General Admission ticket conversion rate × Price per General Admission ticket)\n\nThis formula calculates the total revenue as the sum of contributions from each ticket category, where each contribution is based on the number of tickets offered, the conversion rate, and the price of that ticket category.\n\nYour Task:\n\nA student has submitted a strategy and rationale for how they believe the concert venue should allocate their ticket sales among VIP, Reserved, and General Admission tickets to maximize total revenue.\n\nPlease evaluate the effectiveness of their strategy based on the internal formula, without revealing or referencing the formula directly. In your response, assess:\n- How well the strategy aligns with maximizing total revenue.\n- Whether the student's explanation shows an understanding of the key variables involved (e.g., ticket category conversion rate, quantities offered, and ticket prices).\n- Any assumptions or trade-offs that may help or hurt the strategy's performance.\n\nAdditionally, you must extract the ticket distribution from their strategy. The extracted distribution MUST add up to exactly 100 tickets across all types.\n\nHere is the student’s proposed ticket allocation strategy:\n{{user_hypothesis}}\n\nHere is their explanation for the strategy:\n{{why_their_strategy}}",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\": \"dc44febf-fd11-42ef-992b-4d42f2c33685\", \"name\": \"responseMessage\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"Your direct response to the student. This should be 1\\u20132 sentences long. Do NOT mention or reveal the equation. Give brief feedback on whether their strategy and explanation seem effective or reasonable. Speak in the first person, as if you are replying directly to the student.\"}, {\"clientId\": \"d79cab13-af40-4589-8598-3731fcb3e49d\", \"name\": \"vip_ticket_percent\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"The student's desired percent of VIP tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"}, {\"clientId\": \"1ab62f64-ad9c-4397-983d-caa705379e96\", \"name\": \"reserved_ticket_percent\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"The student's desired percent of Reserved tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"}, {\"clientId\": \"2b7c5829-bc38-4d6c-b2b0-5f440c0d2662\", \"name\": \"general_admission_ticket_percent\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"The student's desired percent of General Admission tickets for the venue to offer. Must be a whole number (no decimals). Do NOT include the percent (%) symbol. The sum of vip_ticket_percent, reserved_ticket_percent, and general_admission_ticket_percent must equal 100.\"}]",
                          "customSystemRole": ""
                      }
                  ]
              },
              {
                  "clientId": "771df1dd-e389-4901-8bec-ea094f89be00",
                  "name": "Strategy Assistance",
                  "steps": [
                      {
                          "lastStep": false,
                          "stepId": "6867f296-2e81-4c23-a498-68de97ac6b8c",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": undefined,
                          "message": "Sounds like you’re having a hard time coming up with a strategy.\n\nLet’s try this:\nWe can sell 100 tickets total, and we get to decide how many of each type to sell. To achive the highest revenue, how many should be VIP, how many should be General Admission, and how many should be Reserved?",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      },
                      {
                          "lastStep": false,
                          "stepId": "986bcdf1-8afc-42db-92a1-7f592049620c",
                          "stepType": DiscussionStageStepType.PROMPT,
                          "jumpToStepId": "",
                          "promptText": "You are helping a middle school student decide how to split 100 tickets between VIP, General Admission, and Reserved to make the most revenue.\n\nInstructions:\n1. Determine if the user provided you with their strategy (must be able to account for all 100 tickets)\n2. If not, ask the user to choose how many of the 100 tickets should be each type (VIP, General Admission, Reserved).\n3. Remind them that the total must add up to 100 tickets.\n4. If the users asks a question, please provide a short answer to their questions aswell.\n\nRespond directly to the user in a warm, encouraging, and clear way.\n\nHere is the users proposed strategy: {{user_hypothesis}}\n\nPlease ONLY respond in the JSON format provided.",
                          "responseFormat": "",
                          "includeChatLogContext": true,
                          "outputDataType": PromptOutputTypes.JSON,
                          "jsonResponseData": "[{\"clientId\": \"e897378b-368e-4794-aeb4-1b1bd6aacef8\", \"name\": \"responseMessage\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"Your response to the user.\"}, {\"clientId\": \"5edadb12-31b7-4780-b649-57b8cae178df\", \"name\": \"didUserProvideStrategy\", \"type\": \"string\", \"isRequired\": true, \"additionalInfo\": \"true/false: Indicates whether the user has successfully provided their ticket distribution strategy, either explicitly listing the desired allocation of all 100 tickets across types or describing it in a way that allows us to clearly infer the full distribution.\"}]",
                          "customSystemRole": ""
                      },
                      {
                          "stepId": "f3dc9e26-41b4-49fc-9fcf-5ddbe0d67dad",
                          "stepType": DiscussionStageStepType.CONDITIONAL,
                          "lastStep": false,
                          "jumpToStepId": "",
                          "conditionals": [
                              {
                                  "stateDataKey": "didUserProvideStrategy",
                                  "checking": Checking.VALUE,
                                  "operation": NumericOperations.EQUALS,
                                  "expectedValue": "true",
                                  "targetStepId": "225cc2e6-9b7b-477f-ae1e-ae00cac911ff"
                              }
                          ]
                      },
                      {
                          "lastStep": false,
                          "stepId": "5602f95b-b325-44d2-88fe-9e83993700ad",
                          "stepType": DiscussionStageStepType.REQUEST_USER_INPUT,
                          "jumpToStepId": "986bcdf1-8afc-42db-92a1-7f592049620c",
                          "message": "{{responseMessage}}",
                          "saveResponseVariableName": "user_hypothesis",
                          "disableFreeInput": false,
                          "predefinedResponses": []
                      }
                  ]
              }
          ]
      }
  ]
}