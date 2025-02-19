const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatAnthropic } = require("@langchain/anthropic");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOllama } = require("@langchain/ollama");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { z } = require('zod');
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const { PromptTemplate } = require("@langchain/core/prompts");

// Get settings from database
function getSettings() {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const settings = stmt.all().reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
    return settings;
}

// Format transcript by parsing the JSON and creating a formatted string
// Speaker: Text
function cleanTranscript(transcript) {
    let formattedTranscript = '';
    for (const item of transcript['speakers']) {
        formattedTranscript += `${item['speaker']}: ${item['text']}\n`;
    }
    return formattedTranscript;
}

async function getSummary(model, transcript) {
    const parser = StructuredOutputParser.fromZodSchema(z.object({
        summary: z.string().describe('The summary of the transcript.')
    }));

    const formatInstructions = parser.getFormatInstructions();

    const messages = [
        new SystemMessage(`
            You are an AI trained to summarize voice recording transcriptions. Your task is to produce a detailed summary of the transcription in markdown format. Please follow the instructions below:

            Summary Instructions:
            - Detailed Summary: Provide a comprehensive, clear summary of the main points discussed in the transcription. Structure your summary with clear headings, subheadings, and bullet points if necessary.
            - All newlines in the transcription should be encoded as \\n
            - All quotes should be escaped using backslashes (e.g., \\"Example\\" or \\'Example\\').
            - Use markdown formatting for headings, bullet points, and emphasis where relevant.
            - Do not include the original transcription in the summary.
            - Focus on the following: 1) key topics discussed, 2) important statements, names, and terms, 3) significant dates and times, 4) any other significant actions or events.
            - Ensure that the summary is easy to follow and clear, breaking down complex points into digestible pieces.

            Response Format:
            ${formatInstructions}
        `),
        new HumanMessage(`Here is the transcript to summarize: \`\`\`${transcript}\`\`\``)
    ];

    const response = await model.invoke(messages);
    return parser.parse(response.content);
}

async function getQuestion(model, transcript) {
    const parser = StructuredOutputParser.fromZodSchema(z.object({
        questions: z.array(z.string()).describe('An array of questions to ask.')
    }));

    const formatInstructions = parser.getFormatInstructions();

    const messages = [
        new SystemMessage(`
           You are an AI designed to generate thought-provoking follow-up questions based on a transcription of a conversation, meeting, or presentation. Your goal is to provide insightful and clarifying questions that encourage deeper discussion and understanding.

           Question Generation Instructions:
           - Relevance: Ensure all questions are directly related to the key topics discussed in the transcription.
           - Depth: Ask meaningful, open-ended questions that prompt deeper thought rather than simple yes/no responses.
           - Clarity: Ensure each question is clearly worded and easy to understand.
           - Variety: Include a mix of clarifying, exploratory, and strategic questions.
           - Context Awareness: If a speaker is introducing a concept, feature, or idea, generate questions that help refine its scope, feasibility, and impact.

           Response Format:
           ${formatInstructions}
        `),
        new HumanMessage(`Here is the transcript to create questions from: \`\`\`${transcript}\`\`\``)
    ];

    const response = await model.invoke(messages);
    return parser.parse(response.content);
}

async function getFlashcard(model, transcript) {
    const parser = StructuredOutputParser.fromZodSchema(z.object({
        flashcards: z.array(z.object({
            front: z.string().describe('The front of the flashcard.'),
            back: z.string().describe('The back of the flashcard.')
        })).describe('An array of flashcards.')
    }));

    const formatInstructions = parser.getFormatInstructions();

    const messages = [
        new SystemMessage(`
            You are an AI trained to generate educational flashcards based on a transcription. Your goal is to create concise, effective flashcards that help users review and test their understanding of the material.

            Flashcard Generation Instructions:
            - Question & Answer Format: Each flashcard should contain a question on one side and a concise, informative answer on the other.
            - Key Concepts: Focus on core topics, definitions, important facts, key figures, significant dates, and essential takeaways.
            - Clarity: Ensure each flashcard is clear and easy to understand.
            - Engagement: Where appropriate, phrase questions in a way that encourages critical thinking rather than rote memorization.
            - Variety: Mix fact-based, conceptual, and application-based questions.
            - Avoid Overlapping Content: Ensure that flashcards do not cover the same information or concepts.
            - Length: Keep flashcards concise, typically 1-3 sentences per side.

            Response Format:
            ${formatInstructions}
        `),
        new HumanMessage(`Here is the transcript to create flashcards from: \`\`\`${transcript}\`\`\``)
    ];

    const response = await model.invoke(messages);
    return parser.parse(response.content);
}

async function getAnswer(model, transcript, question) {
    const parser = StructuredOutputParser.fromZodSchema(z.object({
        answer: z.string().describe('The answer to the question.')
    }));

    const formatInstructions = parser.getFormatInstructions();

    const messages = [
        new SystemMessage(`
            You are an AI trained to answer questions based on a transcription. Your goal is to provide a detailed and accurate answer to the question.

            Answer Instructions:
            - Provide a detailed, accurate, and concise answer to the question.
            - Use markdown formatting for headings, bullet points, and emphasis where relevant.
            - If the question is not directly related to the transcription, politely decline to answer.

            Response Format:
            ${formatInstructions}
        `),
        new HumanMessage(`Here is the transcript: \`\`\`${transcript}\`\`\`. The question is: \`\`\`${question}\`\`\`.`)
    ];

    const response = await model.invoke(messages);
    return parser.parse(response.content);
}

// Initialize the appropriate chat model based on provider
function initializeModel(provider, modelName) {
    switch (provider) {
        case 'anthropic':
            return new ChatAnthropic({
                model: modelName
            });
        case 'openai':
            return new ChatOpenAI({
                model: modelName
            });
        case 'google':
            return new ChatGoogleGenerativeAI({
                modelName: modelName
            });
        case 'ollama':
            return new ChatOllama({
                baseUrl: process.env.OLLAMA_BASE_URL,
                apiKey: process.env.OLLAMA_API_KEY,
                model: modelName
            });
        case 'openrouter':
            return new ChatOpenAI({
                model: modelName,
                apiKey: process.env.OPENROUTER_API_KEY,
                configuration: {
                    baseURL: process.env.OPENROUTER_BASE_URL,
                }
            });
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

// Get transcript by ID
function getTranscript(id) {
    const stmt = db.prepare('SELECT transcript FROM transcripts WHERE id = ?');
    const result = stmt.get(id);
    if (!result) throw new Error('Transcript not found');
    return JSON.parse(result.transcript);
}

// Save generated content
function saveContent(transcriptId, contentType, content) {
    const stmt = db.prepare(`
        INSERT INTO content (transcript_id, content_type, content_response)
        VALUES (?, ?, ?)
    `);
    return stmt.run(transcriptId, contentType, JSON.stringify(content));
}

// Get existing content
function getExistingContent(transcriptId, contentType) {
    const stmt = db.prepare(`
        SELECT content_response FROM content 
        WHERE transcript_id = ? AND content_type = ?
    `);
    const result = stmt.get(transcriptId, contentType);
    return result ? JSON.parse(result.content_response) : null;
}

// Generate summary
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: 'Transcript ID is required' });
        }
        
        // Check for existing summary
        const existing = getExistingContent(id, 'summary');
        if (existing && req.query.regenerate !== 'true') {
            return res.json({ content: existing });
        }

        const transcript = getTranscript(id);
        const settings = getSettings();
        const model = initializeModel(settings.provider, settings.model);

        const summary = await getSummary(model, cleanTranscript(transcript));
        saveContent(id, 'summary', summary);
        res.json({ content: summary });
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate flashcards
router.get('/flashcards/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: 'Transcript ID is required' });
        }

        // Check for existing flashcards
        const existing = getExistingContent(id, 'flashcards');
        if (existing && req.query.regenerate !== 'true') {
            return res.json({ content: { flashcards: existing.flashcards } });
        }

        const transcript = getTranscript(id);
        const settings = getSettings();
        const model = initializeModel(settings.provider, settings.model);

        const flashcards = await getFlashcard(model, cleanTranscript(transcript));
        saveContent(id, 'flashcards', flashcards);
        res.json({ content: flashcards });
    } catch (error) {
        console.error('Flashcards error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate questions
router.get('/questions/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: 'Transcript ID is required' });
        }

        // Check for existing questions
        const existing = getExistingContent(id, 'questions');
        if (existing && req.query.regenerate !== 'true') {
            return res.json({ content: { questions: existing.questions } });
        }

        const transcript = getTranscript(id);
        const settings = getSettings();
        const model = initializeModel(settings.provider, settings.model);

        const questions = await getQuestion(model, cleanTranscript(transcript));
        saveContent(id, 'questions', questions);
        res.json({ content: questions });
    } catch (error) {
        console.error('Questions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Answer specific question
router.post('/question/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { question } = req.body;

        if (!question || !id) {
            return res.status(400).json({ error: 'Question and transcript ID are required' });
        }

        const transcript = getTranscript(id);
        const settings = getSettings();
        const model = initializeModel(settings.provider, settings.model);

        const answer = await getAnswer(model, cleanTranscript(transcript), question);
        res.json({ content: answer });
    } catch (error) {
        console.error('Question answer error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;