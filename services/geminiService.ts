
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeCarCondition = async (imageBase64: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Você é um mestre em estética automotiva premium. Analise minuciosamente a imagem fornecida.
  
  CRITÉRIOS DE ESCOLHA:
  - Se houver sujeira pesada na pintura: Lavagem detalhada.
  - Se houver riscos leves, hologramas ou oxidação: Polimento Técnico.
  - Se a imagem mostrar bancos com manchas ou sujeira: Higienização de bancos.
  - Se a imagem mostrar o chão do carro sujo: Limpeza de Assoalho.
  - Se os faróis estiverem amarelados/opacos: Polimento de Faróis.
  - Se a pintura estiver limpa mas sem brilho ou proteção: Enceramento Técnico.

  Forneça a saída em formato JSON com estes campos em português: 
  condition (avaliação geral curta), 
  issues (lista de strings com os problemas específicos detectados), 
  recommendedService (o serviço MAIS NECESSÁRIO entre as opções acima), 
  explanation (Um resumo EXTREMAMENTE BREVE e direto ao ponto. Use poucas palavras. Foque no benefício imediato. DESTAQUE termos persuasivos como **evitar riscos**, **proteção**, **valorização** ou **restaurar o brilho** usando Markdown negrito).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1] || imageBase64,
            },
          },
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

    const result = JSON.parse(response.text || "{}");
    // Ensure estimatedCost remains in the object for type safety but as empty string
    return { ...result, estimatedCost: "" } as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Falha ao analisar a condição do veículo. Por favor, tente novamente.");
  }
};
