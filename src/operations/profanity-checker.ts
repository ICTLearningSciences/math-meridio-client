/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/**
 * Checks if a given message contains profanity/offensive language
 * by using the OpenAI Chat API.
 *
 * The prompt instructs the model to answer with a single word:
 * "Yes" if profanity is present and "No" if not.
 *
 * @param message - The message to be checked.
 * @returns A promise that resolves to true if profanity is detected.
 */
// TODO: move this to hit OUR backend.
export async function checkProfanity(message: string): Promise<boolean> {
  const prompt = `Check if the following text contains any profanity or offensive language. Answer with a single word: 'Yes' if it does, and 'No' if it does not.
  
  Text: "${message}"
  
  Answer:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 5,
        temperature: 0,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return false;
    }
    const answer = data.choices[0].message.content.trim().toLowerCase();
    return answer.startsWith('yes');
  } catch (error) {
    console.error('Error checking profanity:', error);
    // In case of error, you may choose to allow the message.
    return false;
  }
}
