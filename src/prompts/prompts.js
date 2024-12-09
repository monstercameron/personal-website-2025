/**
 * Generates the small prompt for identifying the topic.
 * @param {string} userQuery - The user's query.
 * @param {Object} data - An object containing known topics.
 * @returns {string} - The generated small prompt.
 */
export const generateSmallPrompt = (userQuery, data) => `
You are a metadata inference engine. The user has provided a query about some website content. The website has various topics like "topicA", "topicB", etc.
Your job is to identify which topic from the known topics is most relevant to the user's query.
Known topics: ${Object.keys(data).join(", ")}

User query: "${userQuery}"

Based on the known topics, respond with exactly one topic name from the list.
If you are unsure, pick the closest relevant topic.
`;

/**
 * Generates the big prompt for content generation.
 * @param {string} topic - The identified topic.
 * @param {string} datasetForTopic - The dataset content for the topic (JSON string or formatted data).
 * @param {string} userQuery - The user's query.
 * @returns {string} - The generated big prompt.
 */
export const generateBigPrompt = (topic, datasetForTopic, userQuery) => `
You are a web content generator. The user wants a structured HTML snippet related to the topic identified: "${topic}". 
Follow these rules:
- The result should be an HTML snippet with proper tags.
- Include headings, paragraphs, and possibly lists based on the dataset content.
- Make sure the structure is semantic and user-friendly.
- Adapt the dataset into a user-friendly presentation. The user query is context: "${userQuery}"

Dataset to include for the topic "${topic}":
\`\`\`json
${datasetForTopic}
\`\`\`

Produce a clean HTML structure. For example:
<div
    class="p-4 border border-green-500 text-green-500 bg-black font-mono mt-6 mb-6 shadow-[0_0_10px_2px_rgba(0,255,0,0.5)] crt-spawn">
    <h2 class="text-xl font-bold mb-2">Block Title</h2>
    <p>Data Line 1: <span class="font-bold">Value 1</span></p>
    <p>Data Line 2: <span class="font-bold">Value 2</span></p>
    <p>Data Line 3: <span class="font-bold">Value 3</span></p>
</div>

Now generate the requested HTML using the dataset above.

Rules:
Only return the HTML text
Do not markdown
Do not include \`\`\`html or other markdown tags
use the css style given in the example, do not use other styles unless instructed
`;


