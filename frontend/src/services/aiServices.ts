import { AIRequest } from '@/types'

export async function sendMessageToAI(request, key) {
  switch(request.model) {
    case 'deepseek':
      return handleDeepseek(request, key)
    case 'gemini':
      return handleGemini(request, key);
    default:
      throw new Error(`Unsupported model: ${request.model}`);
  }
}

export async function handleDeepseek(request, token) {
    let context = '';
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
    }, token);

    return res;
}

export async function fetchDeepSeek(
  request: DeepSeekRequest,
  token: string
): Promise<DeepSeekResponse> {
  console.log('Request body is : '+JSON.stringify(request))
  const response = await fetch(
    'https://api.deepseek.com/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek fetch failed: ${errorText}`);
  }

  if(request.stream) return response;
  else return response.json();
}

export async function handleGemini(request, apiKey) {
  let context = "";
  
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
    apiKey
  );

  return res;
}

export async function fetchGeminiAPI(request, apiKey) {
  console.log("Gemini request body:", JSON.stringify(request));

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API fetch failed: ${errorText}`);
  }

  if(request.stream) return response;
  else return response.json();
}
