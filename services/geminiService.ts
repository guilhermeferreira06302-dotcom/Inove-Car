
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeCarCondition = async (imageBase64: string): Promise<AnalysisResult> => {
  try {
    // Inicializa o SDK do Gemini diretamente
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Limpa o prefixo data:image/... se existir
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const prompt = `Você é um mestre em estética automotiva premium. Analise a imagem fornecida.
    
    CRITÉRIOS:
    - Sujeira pesada/barro: Lavagem detalhada.
    - Riscos/Hologramas/Pintura fosca: Polimento Técnico.
    - Bancos sujos/manchados: Higienização de bancos.
    - Chão/Carpete sujo: Limpeza de Assoalho.
    - Faróis opacos/amarelados: Polimento de Faróis.
    - Pintura limpa mas sem reflexo: Enceramento Técnico.

    Retorne APENAS o JSON com:
    condition: avaliação curta,
    issues: lista de strings,
    recommendedService: um dos nomes acima,
    explanation: Resumo curto com termos em **negrito**.`;

    // FIX: Updated to use 'gemini-3-flash-preview' and passed contents as a single Content object
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedService: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["condition", "issues", "recommendedService", "explanation"],
        },
      },
    });

    // FIX: Access .text property directly
    if (!response.text) throw new Error("Resposta da IA vazia");

    const analysis = JSON.parse(response.text);
    return { ...analysis, estimatedCost: "" };
  } catch (error: any) {
    console.error("Erro na análise Gemini:", error);
    throw new Error(error.message || "Falha ao processar análise da imagem.");
  }
};
