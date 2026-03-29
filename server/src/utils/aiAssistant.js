const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

const getAuctionAdvice = async (auctionData, bidHistory) => {
    // Late-initialization to ensure environment variables are present
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    // Definitive list of models to try in order of preference
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    let lastError = null;

    for (const modelName of models) {
        try {
            logger.info(`AI_SENTINEL: Attempting synthesis with ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const prompt = `
                Role: Elite Real Estate Auction Strategist (GOCOMET AI).
                Asset Data: ${JSON.stringify(auctionData)}
                Live Bid History: ${JSON.stringify(bidHistory)}
                
                Directive:
                1. Provide a "Sector Overview": A 1-sentence analytical summary of why this asset is valuable.
                2. Provide a "Valuation Prediction": Based on current bidding velocity, predict the final hammer price.
                3. Provide "Tactical Advice": 1-2 sentences on exactly when and how the user should place their next bid (e.g., "Wait for the final 60 seconds", "Aggressive jump-bid now to demoralize competitors").
                
                Tone: Professional, authoritative, data-driven.
                Constraint: Total length under 100 words. Use clear headings.
            `;
            
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            if (text) {
                logger.info(`AI_SENTINEL: Success using ${modelName}`);
                return text;
            }
        } catch (error) {
            lastError = error;
            logger.warn(`AI_SENTINEL: Model ${modelName} failed - ${error.message}`);
            continue; // Try next model
        }
    }

    logger.error(`AI_SENTINEL: All models exhausted. Final error: ${lastError?.message}`);
    return "Market synthesis in progress. My neural core is currently prioritizing high-latency data streams. Please retry shortly.";
};

module.exports = { getAuctionAdvice };
