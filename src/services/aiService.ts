import { GoogleGenerativeAI } from '@google/generative-ai';
import { APISettings } from '../types';

class AIService {
  private googleAI: GoogleGenerativeAI | null = null;
  private zhipuAI: any = null;
  private settings: APISettings | null = null;

  updateSettings(settings: APISettings) {
    this.settings = settings;
    this.initializeProviders();
  }

  private initializeProviders() {
    if (!this.settings) return;
    // Initialize Google AI
    if (this.settings.googleApiKey) {
      try {
        this.googleAI = new GoogleGenerativeAI(this.settings.googleApiKey);
      } catch (error) {
        console.error('Failed to initialize Google AI:', error);
      }
    }
    // Initialize ZhipuAI
    if (this.settings.zhipuApiKey) {
      try {
        this.zhipuAI = { apiKey: this.settings.zhipuApiKey };
      } catch (error) {
        console.error('Failed to initialize ZhipuAI:', error);
      }
    }
  }

  async *generateStreamingResponse(
    messages: Array<{ role: string; content: string }>,
    onUpdate?: (content: string) => void
  ): AsyncGenerator<string, void, unknown> {
    if (!this.settings) {
      yield "Please configure your API keys in the settings first.";
      return;
    }

    // Define a system prompt for educational responses
    const systemPrompt = `
      You are a helpful AI tutor. Provide clear, educational responses that help users learn effectively.
      Use markdown formatting with headings, lists, and code blocks to structure your answers.
      If the user asks for examples, provide practical examples.
      If the user asks for explanations, break down complex concepts into simple terms.
      If the user asks for a quiz, create a quiz question or practice problem based on the topic.
    `;

    try {
      if (this.settings.selectedModel === 'google') {
        yield* this.generateGoogleResponse(messages, systemPrompt, onUpdate);
      } else {
        yield* this.generateZhipuResponse(messages, systemPrompt, onUpdate);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      yield "I apologize, but I encountered an error while processing your request. Please check your API key and try again.";
    }
  }

  private async *generateGoogleResponse(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    onUpdate?: (content: string) => void
  ): AsyncGenerator<string, void, unknown> {
    if (!this.googleAI) {
      yield "Google AI is not properly configured.";
      return;
    }

    // For Google Gemini, include the system prompt as the first message
    const messagesWithSystemPrompt = [
      { role: 'user', content: systemPrompt },
      ...messages,
    ];

    const model = this.googleAI.getGenerativeModel({
      model: 'gemma-3-27b-it',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const chat = model.startChat({
      history: messagesWithSystemPrompt.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const lastMessage = messagesWithSystemPrompt[messagesWithSystemPrompt.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      if (onUpdate) {
        onUpdate(fullResponse);
      }
      yield chunkText;
    }
  }

  private async *generateZhipuResponse(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    onUpdate?: (content: string) => void
  ): AsyncGenerator<string, void, unknown> {
    if (!this.zhipuAI?.apiKey) {
      yield "ZhipuAI is not properly configured.";
      return;
    }

    // For ZhipuAI, include the system prompt as the first message
    const messagesWithSystemPrompt = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.zhipuAI.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GLM-4.5-Flash',
        messages: messagesWithSystemPrompt.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      yield `Error: ${response.status} ${response.statusText}`;
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield "Error: Unable to read response stream";
      return;
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                if (onUpdate) {
                  onUpdate(fullResponse);
                }
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async generateResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
    const systemPrompt = `
      You are a helpful AI tutor. Provide clear, educational responses that help users learn effectively.
      Use markdown formatting with headings, lists, and code blocks to structure your answers.
      If the user asks for examples, provide practical examples.
      If the user asks for explanations, break down complex concepts into simple terms.
      If the user asks for a quiz, create a quiz question or practice problem based on the topic.
    `;

    let fullResponse = '';
    for await (const chunk of this.generateStreamingResponse(messages)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }
}

export const aiService = new AIService();
