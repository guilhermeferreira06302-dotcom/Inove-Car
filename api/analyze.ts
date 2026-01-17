
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60, // Aumenta o timeout para funções na Vercel
};

export default async function handler(req: Request) {
  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  };

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Método não permitido' }, 405);
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return jsonResponse({ success: false, error: 'Imagem não fornecida.' }, 400);
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return jsonResponse({ success: false, error: 'Configuração do servidor incompleta (API_KEY).' }, 500);
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

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

    if (!response.text) throw new Error("Resposta da IA vazia");

    const analysis = JSON.parse(response.text);
    return jsonResponse({ success: true, analysis });

  } catch (error: any) {
    console.error("Erro na API de análise:", error);
    return jsonResponse({ 
      success: false, 
      error: error.message || 'Falha ao processar análise da imagem.' 
    }, 500);
  }
}
