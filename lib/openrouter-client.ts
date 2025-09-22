import axios from "axios";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string | string[];
  user?: string;
  transforms?: string[];
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseURL: string = "https://openrouter.ai/api/v1";
  private httpReferer?: string;
  private xTitle?: string;

  constructor(
    apiKey: string,
    options?: {
      httpReferer?: string;
      xTitle?: string;
    }
  ) {
    this.apiKey = apiKey;
    this.httpReferer = options?.httpReferer;
    this.xTitle = options?.xTitle;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    if (this.httpReferer) {
      headers["HTTP-Referer"] = this.httpReferer;
    }

    if (this.xTitle) {
      headers["X-Title"] = this.xTitle;
    }

    return headers;
  }

  async chatCompletion(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        request,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error: unknown) {
      // Extract the actual error message from the response
      const err = error as { message?: string; response?: { data?: unknown; status?: number; statusText?: string } };
      let errorMessage = err.message || 'Unknown error';
      if (err.response?.data) {
        try {
          const errorData = typeof err.response.data === 'string' 
            ? JSON.parse(err.response.data) 
            : err.response.data;
          errorMessage = (errorData as { error?: { message?: string }; message?: string }).error?.message || 
                        (errorData as { message?: string }).message || errorMessage;
        } catch {
          // If we can't parse the error, use the raw response
          errorMessage = String(err.response.data);
        }
      }
      console.error("OpenRouter API error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: errorMessage
      });
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }
  }

  async *chatCompletionStream(request: OpenRouterRequest): AsyncGenerator<OpenRouterStreamChunk, void, unknown> {
    const streamRequest = { ...request, stream: true };

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        streamRequest,
        {
          headers: this.getHeaders(),
          responseType: "stream",
        }
      );

      const stream = response.data;
      let buffer = "";

      for await (const chunk of stream) {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            
            if (data === "[DONE]") {
              return;
            }

            try {
              const parsed: OpenRouterStreamChunk = JSON.parse(data);
              yield parsed;
            } catch {
              // Skip invalid JSON (like comments)
              continue;
            }
          }
        }
      }
    } catch (error: unknown) {
      // Extract the actual error message from the response
      const err = error as { message?: string; response?: { data?: unknown; status?: number; statusText?: string } };
      let errorMessage = err.message || 'Unknown error';
      let errorDetails = null;
      
      if (err.response?.data) {
        try {
          // If it's a stream, we need to read it differently
          if ((err.response.data as { readable?: boolean }).readable) {
            // This is a stream, let's try to read the error message
            const chunks: Buffer[] = [];
            (err.response.data as { on: (event: string, callback: (chunk: Buffer) => void) => void }).on('data', (chunk: Buffer) => chunks.push(chunk));
            (err.response.data as { on: (event: string, callback: () => void) => void }).on('end', () => {
              const responseText = Buffer.concat(chunks).toString();
              try {
                const errorData = JSON.parse(responseText);
                errorDetails = (errorData as { error?: { message?: string }; message?: string }).error?.message || 
                              (errorData as { message?: string }).message || responseText;
              } catch {
                errorDetails = responseText;
              }
            });
            // For now, use a generic message
            errorMessage = "Bad Request - check request parameters";
          } else {
            const errorData = typeof err.response.data === 'string' 
              ? JSON.parse(err.response.data) 
              : err.response.data;
            errorMessage = (errorData as { error?: { message?: string }; message?: string }).error?.message || 
                          (errorData as { message?: string }).message || errorMessage;
            errorDetails = errorData;
          }
        } catch {
          // If we can't parse the error, use the raw response
          errorMessage = String(err.response.data);
        }
      }
      
      console.error("OpenRouter streaming error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: errorMessage,
        details: errorDetails
      });
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }
  }

  async getModels(): Promise<unknown[]> {
    const response = await axios.get(`${this.baseURL}/models`, {
      headers: this.getHeaders(),
    });

    return response.data.data;
  }
}

// Factory function to create OpenRouter client
export function createOpenRouterClient(
  apiKey: string,
  options?: {
    httpReferer?: string;
    xTitle?: string;
  }
): OpenRouterClient {
  return new OpenRouterClient(apiKey, options);
}