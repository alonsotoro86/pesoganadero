import { GoogleGenAI, Type } from "@google/genai";
import type { CowAnalysisResult } from "../types";
import { connectionService } from "./connectionService";

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

export class GeminiServiceError extends Error {
    constructor(
        message: string,
        public code: 'offline' | 'api_error' | 'invalid_response' | 'network_error' | 'unknown'
    ) {
        super(message);
        this.name = 'GeminiServiceError';
    }
}

export const analyzeCowImage = async (base64Image: string, mimeType: string): Promise<CowAnalysisResult> => {
    // Verificar conexión antes de intentar la llamada
    const connectionStatus = connectionService.getStatus();

    if (!connectionStatus.isOnline) {
        throw new GeminiServiceError(
            "Sin conexión a internet. El análisis de IA requiere conexión a internet para funcionar.",
            'offline'
        );
    }

    if (!connectionStatus.isStable) {
        throw new GeminiServiceError(
            "Conexión inestable. Intenta nuevamente cuando tengas una conexión más estable.",
            'network_error'
        );
    }

    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        throw new GeminiServiceError(
            "La API Key de Google no está configurada. Contacta al administrador del sistema.",
            'api_error'
        );
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
            throw new GeminiServiceError(
                "La respuesta de la IA no es válida. Intenta con otra imagen.",
                'invalid_response'
            );
        }

        if (!result.peso_kg || !result.raza || !result.comentarios) {
            throw new GeminiServiceError(
                "La respuesta de la IA no tiene el formato esperado. Intenta con otra imagen.",
                'invalid_response'
            );
        }

        // Validar que el peso sea razonable
        if (result.peso_kg < 50 || result.peso_kg > 1500) {
            throw new GeminiServiceError(
                "El peso estimado no parece realista. Asegúrate de que la imagen sea clara y muestre bien al animal.",
                'invalid_response'
            );
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);

        // Manejar errores específicos
        if (error instanceof GeminiServiceError) {
            throw error;
        }

        // Detectar errores de red
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new GeminiServiceError(
                "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.",
                'network_error'
            );
        }

        // Detectar errores de API
        if (error instanceof Error && error.message.includes('API')) {
            throw new GeminiServiceError(
                "Error en el servicio de IA. Intenta nuevamente en unos momentos.",
                'api_error'
            );
        }

        // Error genérico
        throw new GeminiServiceError(
            "No se pudo completar el análisis. Intenta nuevamente.",
            'unknown'
        );
    }
};

// Función para obtener mensaje de error amigable
export const getErrorMessage = (error: GeminiServiceError): string => {
    switch (error.code) {
        case 'offline':
            return "📶 Sin conexión a internet. El análisis de IA requiere conexión.";
        case 'network_error':
            return "🌐 Error de conexión. Verifica tu internet e intenta nuevamente.";
        case 'api_error':
            return "🔧 Error en el servicio. Intenta nuevamente en unos momentos.";
        case 'invalid_response':
            return "🖼️ La imagen no pudo ser analizada. Intenta con otra foto más clara.";
        case 'unknown':
        default:
            return "❌ Error inesperado. Intenta nuevamente.";
    }
};