import { GoogleGenAI, Type } from "@google/genai";
import type { CowAnalysisResult } from "../types";

const model = 'gemini-2.5-flash';

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        peso_kg: {
            type: Type.INTEGER,
            description: "Peso estimado de la vaca en kilogramos. Debe ser un número entero."
        },
        raza: {
            type: Type.STRING,
            description: "La raza más probable de la vaca, por ejemplo, 'Holstein', 'Angus', 'Brahman'."
        },
        comentarios: {
            type: Type.STRING,
            description: "Un breve análisis de la condición corporal de la vaca y cualquier otra observación relevante. Máximo 2-3 frases."
        }
    },
    required: ["peso_kg", "raza", "comentarios"]
};

export const analyzeCowImage = async (base64Image: string, mimeType: string): Promise<CowAnalysisResult> => {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        throw new Error("La API Key de Google no está configurada. Asegúrate de que la variable de entorno API_KEY esté disponible.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = "Analiza la imagen de esta vaca. Estima su peso en kilogramos, identifica su raza probable y proporciona un breve comentario sobre su condición corporal. Responde únicamente en el formato JSON especificado.";
    
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };
        
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.2,
            }
        });

        const jsonString = response.text.trim();
        let result: CowAnalysisResult;

        try {
            result = JSON.parse(jsonString);
        } catch (parseError) {
             console.error("Error parsing JSON from Gemini API:", parseError);
             throw new Error("La respuesta de la IA no es un JSON válido.");
        }
        

        if (!result.peso_kg || !result.raza || !result.comentarios) {
            throw new Error("La respuesta de la IA no tiene el formato esperado.");
        }
        
        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Re-throw the error to be caught by the UI component
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("No se pudo obtener una respuesta válida de la IA.");
    }
};