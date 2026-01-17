
import { AnalysisResult } from "../types";

export const analyzeCarCondition = async (imageBase64: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro na comunicação com o servidor');
    }

    return await response.json();
  } catch (error: any) {
    console.error("Frontend Analysis Error:", error);
    throw new Error(error.message || "Falha ao analisar a condição do veículo. Por favor, tente novamente.");
  }
};
