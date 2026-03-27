import axios from 'axios';

const ML_API_URL = 'http://localhost:8000/api';

export const predictLabSeverity = async (data) => {
    try {
        const response = await axios.post(`${ML_API_URL}/lab-analysis/predict`, data);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.detail || 'Tahmin işlemi sırasında bir hata oluştu');
        }
        throw new Error('Sunucuya bağlanılamadı');
    }
};

export const getModelInfo = async () => {
    try {
        const response = await axios.get(`${ML_API_URL}/lab-analysis/model-info`);
        return response.data;
    } catch (error) {
        console.error("Model bilgi hatası:", error);
        return null;
    }
};
