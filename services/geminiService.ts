
import { AnalysisResult } from "../types";

export const analyzeCarCondition = async (imageBase64: string): Promise<AnalysisResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s de timeout

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("O servidor retornou um erro inesperado. Tente uma imagem menor.");
    }

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.error || "Falha na análise técnica.");
    }

    return { ...data.analysis, estimatedCost: "" };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("A análise demorou muito. Verifique sua conexão.");
    }
    throw error;
  }
};
