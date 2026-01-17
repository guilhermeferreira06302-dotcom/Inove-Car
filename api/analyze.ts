
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60, // Aumenta o timeout para 60 segundos (limite Vercel Hobby)
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'Nenhuma imagem fornecida' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("ERRO: API_KEY não configurada no ambiente da Vercel.");
      return new Response(JSON.stringify({ error: 'Configuração de servidor incompleta' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Limpa a string base64 se necessário
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
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
    
    return new Response(JSON.stringify({ ...result, estimatedCost: "" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Erro na API de Análise:", error);
    return new Response(JSON.stringify({ error: 'Erro ao processar imagem: ' + error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
