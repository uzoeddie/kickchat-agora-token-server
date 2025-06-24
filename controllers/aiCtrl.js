// const Anthropic = require('@anthropic-ai/sdk');
const Google = require('@google/genai');
const { mainPrompt } = require('./prompt');

const { GoogleGenAI } = Google;

// const anthropic = new Anthropic({
//     apiKey: process.env.CLAUDE_API_KEY,
// });
const genAI = new GoogleGenAI({vertexai: false, apiKey: process.env.GEMINI_API_KEY});

module.exports = {
    // async searchSoccerFacts1(req, res) {
    //     try {
    //         console.log(req.body);
    //         const { query } = req.body;
    //         if (!query || query.trim().length === 0) {
    //             return res.status(400).json({
    //                 message: 'Query is required'
    //             });
    //         }
    //         if (query.length > 50) {
    //             return res.status(400).json({
    //                 message: 'Query too long. Please keep it under 50 characters.'
    //             });
    //         }
    //         const response = await anthropic.messages.create({
    //             model: 'claude-sonnet-4-20250514',
    //             max_tokens: 1000,
    //             temperature: 0.7,
    //             messages: [
    //                 {
    //                     role: 'user',
    //                     content: mainPrompt(query)
    //                 }
    //             ]
    //         });
    //         const aiResponse = response.content[0].text;
    //         console.log(aiResponse);
    //         return res.status(200).json({message: 'Soccer facts', response: aiResponse });
    //     } catch (error) {
    //         return res.json({message: 'Error making request.'});
    //     }
    // },
    async searchSoccerFacts(req, res) {
        try {
            const { query, language } = req.body;
            if (!query || query.trim().length === 0) {
                return res.status(400).json({
                    message: 'Query is required'
                });
            }
            if (query.length > 100) {
                return res.status(400).json({
                    message: 'Query too long. Please keep it under 50 characters.'
                });
            }
            const queryGeneration = await genAI.models.generateContent({
                model: 'gemini-2.5-pro-preview-06-05',
                contents: mainPrompt(query, language),
                config: {
                    maxOutputTokens: 4096,
                    temperature: 0.7
                }
            });
            const { candidates } = queryGeneration;
            const aiResponse = candidates[0].content.parts[0].text.trim();
            return res.status(200).json({message: 'Soccer facts', response: aiResponse });
        } catch (error) {
            return res.json({message: 'Error making request.'});
        }
    }
}