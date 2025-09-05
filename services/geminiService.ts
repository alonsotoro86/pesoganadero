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
            description: "La raza más probable de la vaca, por ejemplo, 'Holstein', 'Angus', 'Brahman', 'Jersey', 'Simmental'."
        },
        comentarios: {
            type: Type.STRING,
            description: "Análisis detallado incluyendo condición corporal, edad estimada y características distintivas."
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

    const prompt = `Analiza la imagen con máxima precisión para estimar el peso de ganado bovino.

METODOLOGÍA DE ANÁLISIS:
1. SOLO analiza si la imagen contiene claramente un animal bovino completo
2. Si la imagen es borrosa, muestra solo partes del animal, o no contiene un bovino, responde con error

CÁLCULO DE PESO PRECISO:
- Analiza el tamaño corporal relativo al frame de la imagen
- Considera la condición corporal (magro, normal, gordo)
- Identifica la edad aparente (ternero, novillo, adulto)
- Determina el sexo (toros son más pesados que vacas)
- Ajusta según la raza identificada

FACTORES DE PESO POR EDAD Y RAZA:
- TERNEROS (0-6 meses): 50-200 kg
- NOVILLOS (6-18 meses): 200-500 kg
- VACAS ADULTAS: 400-800 kg
- TOROS ADULTOS: 600-1200 kg

AJUSTES POR RAZA:
- Holstein, Simmental: +15% peso
- Angus, Hereford: peso estándar
- Jersey, Dexter: -20% peso
- Brahman: +10% peso

IDENTIFICACIÓN DE RAZA:
- Analiza color del pelaje, forma de cabeza, conformación corporal
- Considera patrones de coloración específicos
- Identifica características distintivas de cada raza

Responde únicamente en el formato JSON especificado con la máxima precisión posible.`;

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
                "No se pudo procesar la respuesta de la IA. Intenta con otra imagen.",
                'invalid_response'
            );
        }

        // Verificar si la IA indicó que no puede analizar la imagen
        if (result.comentarios && (
            result.comentarios.toLowerCase().includes('no puedo') ||
            result.comentarios.toLowerCase().includes('no se puede') ||
            result.comentarios.toLowerCase().includes('no hay animal') ||
            result.comentarios.toLowerCase().includes('no contiene') ||
            result.comentarios.toLowerCase().includes('no es visible') ||
            result.comentarios.toLowerCase().includes('borrosa') ||
            result.comentarios.toLowerCase().includes('error')
        )) {
            throw new GeminiServiceError(
                "La IA no pudo detectar un animal bovino en la imagen. Asegúrate de que la foto sea clara y muestre completamente al animal.",
                'invalid_response'
            );
        }

        // Validar campos requeridos
        if (!result.peso_kg || !result.raza || !result.comentarios) {
            throw new GeminiServiceError(
                "Respuesta incompleta del análisis. Asegúrate de que la foto sea clara y muestre completamente al animal.",
                'invalid_response'
            );
        }

        // Validar rangos de valores
        if (result.peso_kg < 30 || result.peso_kg > 2000) {
            throw new GeminiServiceError(
                "El peso estimado no parece realista. Asegúrate de que la imagen sea clara y muestre bien al animal.",
                'invalid_response'
            );
        }

        // Validar edad estimada
        const edadesValidas = ['Ternero', 'Novillo', 'Adulto'];
        if (!edadesValidas.includes(result.edad_estimada)) {
            throw new GeminiServiceError(
                "No se pudo determinar la edad del animal. Intenta con otra imagen.",
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
            return "🐄 No se pudo detectar un animal bovino en la imagen. Asegúrate de que la foto sea clara y muestre completamente al animal.";
        case 'unknown':
        default:
            return "❌ Error inesperado. Intenta nuevamente.";
    }
};