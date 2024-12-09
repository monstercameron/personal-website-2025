/**
 * File: src/aiengine.js
 */

import OpenAI from "openai";
import { data } from "./dataset/data.js";
import dotenv from "dotenv";
import { generateSmallPrompt, generateBigPrompt } from "./prompts/prompts.js";

// Load environment variables from .env file
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Defaults to this environment variable
});

// Environment variables with default fallbacks
const SMALL_PROMPT_MODEL = process.env.SMALL_PROMPT_MODEL || "gpt-3.5-turbo";
const BIG_PROMPT_MODEL = process.env.BIG_PROMPT_MODEL || "gpt-4";
const SMALL_PROMPT_MAX_TOKENS =
  parseInt(process.env.SMALL_PROMPT_MAX_TOKENS, 10) || 10;
const BIG_PROMPT_MAX_TOKENS =
  parseInt(process.env.BIG_PROMPT_MAX_TOKENS, 10) || 1000;
const DEFAULT_TEMPERATURE = parseFloat(process.env.DEFAULT_TEMPERATURE) || 0.7;

/**
 * Calls the OpenAI API with the given parameters.
 * @param {string} model - The OpenAI model to use.
 * @param {string} prompt - The prompt to send to the API.
 * @param {number} maxTokens - The maximum number of tokens to generate.
 * @param {number} [temperature=DEFAULT_TEMPERATURE] - The sampling temperature.
 * @returns {Promise<[Object|null, Error|null]>} - Returns a response object or an error.
 */
const callOpenAI = async (
  model,
  prompt,
  maxTokens,
  temperature = DEFAULT_TEMPERATURE
) => {
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });
    return [response, null];
  } catch (error) {
    console.error(
      `Error calling OpenAI API with model ${model}:`,
      error.message || error
    );
    return [null, error];
  }
};

/**
 * Handles the small prompt logic to identify the topic.
 * @param {string} userQuery - The user's query.
 * @param {Object} data - An object containing known topics.
 * @returns {Promise<[string|null, Error|null]>} - The identified topic or an error.
 */
const handleSmallPrompt = async (userQuery, data) => {
  const prompt = generateSmallPrompt(userQuery, data);
  //   console.log("Small prompt:", prompt);
  const [response, error] = await callOpenAI(
    SMALL_PROMPT_MODEL,
    prompt,
    SMALL_PROMPT_MAX_TOKENS,
    0
  );
  if (error) {
    console.error("Error during small prompt:", error.message || error);
    return [null, error];
  }
  const topic = response.choices[0].message.content.trim();
  return [topic, null];
};

/**
 * Handles the big prompt logic to generate content.
 * @param {string} topic - The identified topic.
 * @param {string} userQuery - The user's query.
 * @param {Object} data - An object containing known topics and their datasets.
 * @returns {Promise<[string|null, Error|null]>} - The generated content or an error.
 */
const handleBigPrompt = async (topic, userQuery, data) => {
  const datasetForTopic = JSON.stringify(data[topic], null, 2);
  const prompt = generateBigPrompt(topic, datasetForTopic, userQuery);
  //   console.log("Big prompt:", prompt);
  const [response, error] = await callOpenAI(
    BIG_PROMPT_MODEL,
    prompt,
    BIG_PROMPT_MAX_TOKENS
  );
  if (error) {
    console.error("Error during big prompt:", error.message || error);
    return [null, error];
  }
  const content = response.choices[0].message.content;
  return [content, null];
};

/**
 * Express controller to handle user queries and generate content using OpenAI API.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
const websiteController = async (req, res) => {
  const { query: userQuery = "" } = req.query;

  console.log("Request received", {
    userQuery,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  if (!userQuery) {
    console.error("No query provided by the user.");
    return res.status(400).json({ error: "No query provided." });
  }

  console.log("Step 1: Identifying topic using small prompt...");
  const [topic, smallError] = await handleSmallPrompt(userQuery, data);
  if (smallError) {
    console.error("Error identifying topic:", smallError.message || smallError);
    return res.status(500).json({ error: "Error identifying topic." });
  }

  console.log("Identified topic:", topic);

  if (!data[topic]) {
    console.error(`Invalid topic identified: "${topic}".`);
    return res.status(400).json({
      error: "Unable to identify a valid topic for the provided query.",
    });
  }

  console.log("Step 2: Generating content using big prompt...");
  const [finalContent, bigError] = await handleBigPrompt(
    topic,
    userQuery,
    data
  );
  if (bigError) {
    console.error("Error generating content:", bigError.message || bigError);
    return res.status(500).json({ error: "Error generating content." });
  }

  console.log("Content generated successfully.");
  console.log("Step 3: Sending content to client.");

  res.status(200).send(finalContent);
};

export default websiteController;
