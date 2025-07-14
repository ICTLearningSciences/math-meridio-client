# This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
# Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
#
# The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
import os
from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure your OpenAI API key is set in your environment variables.
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/check_profanity", methods=["POST"])
def check_profanity():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "No message provided"}), 400

    message = data["message"]

    # Create a prompt to ask ChatGPT whether the text contains profanity.
    prompt = (
        "Check if the following text contains any profanity or offensive language. "
        "Answer with a single word: 'Yes' if it does, and 'No' if it does not.\n\n"
        f"Text: \"{message}\"\n\n"
        "Answer:"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",    
            messages=[{"role": "user", "content": prompt}],
            max_tokens=5,
            n=1,
            temperature=0
        )
        answer = response.choices[0].message.content.strip().lower()
        is_profane = answer.startswith("yes")
        return jsonify({"is_profane": is_profane, "answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run on port 5000 (or change as needed)
    app.run(debug=True, port=5001)
