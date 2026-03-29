const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const findModels = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // listModels was added in newer versions of the SDK
        if (typeof genAI.listModels === 'function') {
           console.log('Fetching available models...');
           const models = await genAI.listModels();
           console.log('Available Models:', JSON.stringify(models, null, 2));
        } else {
           console.error('listModels not supported in this SDK version.');
        }
    } catch (err) {
        console.error('Model List Failed:', err.message);
    }
};

findModels();
