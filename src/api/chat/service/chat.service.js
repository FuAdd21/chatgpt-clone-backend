import db from '../../../../db/db.config.js'
// import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite'

// const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log('API KEY:', process.env.GROQ_API_KEY?.slice(0, 8) + '...');


export const getRecentConversationRows = async (Limit = 5) => {
    const normalizedLimit = Number.parseInt(Limit, 10);
    const safeLimit = 
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0 
        ? 20: normalizedLimit;




    const [rows] = await db.execute(
        `SELECT id, role, content, created_at FROM conversations
        ORDER BY id DESC
        LIMIT ${safeLimit}`,
    );
    return rows.reverse();
};


// const generateAssistantAnswer = async ({ historyRows, question }) => {
//     // Format history for Gemini startChat
//     const formattedHistory = historyRows.map(row => ({
//         role: row.role == 'assistant' ? 'model' : 'user',
//         parts: [{ text: row.content }],
//     }));


//     // sample history format
//     // [
//     //     {
//     //         role: 'user',
//     //         parts: [{ text: 'Hello, I\'m a user.'}],
//     //     },
//     //     {
//     //         role: 'model',
//     //         parts: [{ text: 'Hello, I\'m a model.'}],
//     //     },

//     //  ]


//     const chat = geminiClient.chats.create({
//         model: GEMINI_MODEL,
//         config: {
//             maxOutputTokens: 1024,
//         },

//         history: formattedHistory,
//     });

//     const result = await chat.sendMessage({ message: question });
//     return {
//         text: result.text,
//         totalTokens: result.usageMetadata.totalTokenCount,
//     };
// };


const generateAssistantAnswer = async ({ historyRows, question }) => {
    const messages = [
        ...historyRows.map(row => ({
            role: row.role === 'assistant' ? 'assistant' : 'user',
            content: row.content,
        })),
        { role: 'user', content: question },
    ];

    const response = await groqClient.chat.completions.create({
        model: GROQ_MODEL,
        max_tokens: 1024,
        messages,
    });

    return {
        text: response.choices[0].message.content,
        totalTokens: response.usage.total_tokens,
    };
};


const getMessageById = async messageId => {
    const [rows] = await db.execute(
        'SELECT id, role, content, token_count, created_at FROM conversations where id = ? LIMIT 1',
        [messageId]
    );
    if (!rows[0].id) return null;
    return {
        id: rows[0].id,
        role: rows[0].role,
        content: rows[0].content,
        tokenCount: Number(rows[0].token_count || 0),
        createdAt: rows[0].created_at,
    };
};


export async function createConversationService(question) {
    try {
        // validation
        if (!question.trim()) {
            const error = new Error('Question is required');
            error.status = 400;
            throw error
        }


        //  insert recent conversation
        const historyRows = await getRecentConversationRows(5);

        // insert new conversations
        const [result] = await db.execute(
            'INSERT INTO conversations (content, role) VALUES (?, "user")', 
            [ question],
        );


        const { text, totalTokens} = await generateAssistantAnswer({ 
            historyRows, 
            question,
        });

        const createAssistantMessageResult = await db.execute(
            'INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)',
            ['assistant', text, totalTokens],
        );

        const userConversation = await getMessageById(result.insertId);
        const [assistantResult] = createAssistantMessageResult;
        const assistantConversation = await getMessageById(assistantResult.insertId);
        return {
            userConversation,
            assistantConversation,
        };
    } catch (error) {
        throw error;
    }
    
}