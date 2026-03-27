import axios from 'axios';

const API_KEY = 'AIzaSyDJByXSMq65Lx8tygQa0avUsIq0Y3JGKpM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateContent = async (prompt) => {
    try {
        const response = await axios.post(
            `${API_URL}?key=${API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            return response.data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No candidates found in response');
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
};
