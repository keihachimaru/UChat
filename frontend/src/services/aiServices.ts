import type { DeepSeekRequest } from "@/types";

type AIRequest = {
  model: string,
  conversation: any[],
  temperature: number,
  maxTokens: number,
  stream: boolean,
  rag: string | null
}

export async function sendMessageToAI(
  request: AIRequest, 
  key: string, 
  signal?: AbortSignal
) {
  console.log('hi')
  switch(request.model) {
    case 'deepseek':
      return handleDeepseek(request, key, signal)
    case 'gemini':
      return handleGemini(request, key, signal);
    default:
      throw new Error(`Unsupported model: ${request.model}`);
  }
}

export async function handleDeepseek(
  request: AIRequest, 
  token: string, 
  signal?: AbortSignal 
) {
    if (request.rag?.length) {
        // context = await calculateRAG(rag);
        console.log(request.rag)
    }

    const res = await fetchDeepSeek({
        model: "deepseek-chat",
        messages: request.conversation,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: request.stream,
        // context: request.context
        signal
    }, token);

    return res;
}

export async function fetchDeepSeek(
  request: DeepSeekRequest,
  token: string,
  signal?: AbortSignal
) {

  const response = await fetch(
    'https://api.deepseek.com/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      signal: signal?signal:null
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek fetch failed: ${errorText}`);
  }

  if(request.stream) return response;
  else return response.json();
}

export async function handleGemini(
  request: AIRequest,
  apiKey: string,
  signal?: AbortSignal
) {
  
  // If you want to support RAG later:
  if (request.rag?.length) {
    console.log(request.rag);
    // context = await calculateRAG(request.rag);
  }

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const res = await fetchGeminiAPI(
    {
      model: "gemini-2.5-flash",
      messages: request.conversation,   // must follow Gemini format
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      stream: request.stream,
      // You could pass context here if you build RAG
    },
    apiKey,
    signal
  );

  return res;
}

export async function fetchGeminiAPI(
  request: DeepSeekRequest, 
  apiKey: string, 
  signal?: AbortSignal
) {

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
      signal: signal
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API fetch failed: ${errorText}`);
  }

  if(request.stream) return response;
  else return response.json();
}
