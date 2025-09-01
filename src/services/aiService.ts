import { GoogleGenerativeAI } from '@google/generative-ai';
import { APISettings } from '../types';

class AIService {
  private googleAI: GoogleGenerativeAI | null = null;
  private zhipuAI: any = null;
  private settings: APISettings | null = null;
  private language: 'en' | 'mr' = 'en';

  updateSettings(settings: APISettings, language: 'en' | 'mr') {
    this.settings = settings;
    this.language = language;
    this.initializeProviders();
  }

  private initializeProviders() {
    if (!this.settings) return;

    if (this.settings.googleApiKey) {
      try {
        this.googleAI = new GoogleGenerativeAI(this.settings.googleApiKey);
      } catch (error) {
        console.error('Failed to initialize Google AI:', error);
      }
    }

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
    language: 'en' | 'mr',
    onUpdate?: (content: string) => void
  ): AsyncGenerator<string, void, unknown> {
    if (!this.settings) {
      yield language === 'en'
        ? "Please configure your API keys in the settings first."
        : "कृपया प्रथम सेटिंग्जमध्ये आपली API की कॉन्फिगर करा.";
      return;
    }

    const systemPrompt = language === 'en'
      ? `
        You are a helpful AI tutor. Provide clear, educational responses that help users learn effectively.
        Use markdown formatting with headings, lists, and code blocks to structure your answers.
        If the user asks for examples, provide practical examples.
        If the user asks for explanations, break down complex concepts into simple terms.
        If the user asks for a quiz, create a quiz question or practice problem based on the topic.
      `
      : `
        तुम्ही एक उपयुक्त एआय शिक्षक आहात. वापरकर्त्यांना प्रभावीपणे शिकण्यास मदत करण्यासाठी स्पष्ट, शैक्षणिक प्रतिसाद द्या.
        आपले उत्तर संरचित करण्यासाठी मार्कडाउन स्वरूपण, शीर्षके, यादी आणि कोड ब्लॉक वापरा.
        जर वापरकर्त्याने उदाहरणे मागितली, तर व्यावहारिक उदाहरणे द्या.
        जर वापरकर्त्याने स्पष्टीकरण मागितले, तर जटिल संकल्पना साध्या भाषेत समजावून सांगा.
        जर वापरकर्त्याने क्विझ मागितली, तर विषयावर आधारित क्विझ प्रश्न किंवा सराव समस्या तयार करा.
        सर्व प्रतिसाद मराठीत द्या.
      `;

    try {
      if (this.settings.selectedModel === 'google' && this.googleAI) {
        yield* this.generateGoogleResponse(messages, systemPrompt, onUpdate);
      } else if (this.settings.selectedModel === 'zhipu' && this.zhipuAI) {
        yield* this.generateZhipuResponse(messages, systemPrompt, onUpdate);
      } else {
        yield language === 'en'
          ? "Selected model is not available or API key is missing."
          : "निवडलेले मॉडेल उपलब्ध नाही किंवा API की गहाळ आहे.";
      }
    } catch (error) {
      console.error('Error generating response:', error);
      yield language === 'en'
        ? "I apologize, but I encountered an error while processing your request. Please check your API key and try again."
        : "मला माफ करा, परंतु तुमच्या विनंतीवर प्रक्रिया करताना मला त्रुटी आली. कृपया तुमची API की तपासा आणि पुन्हा प्रयत्न करा.";
    }
  }

  private async *generateGoogleResponse(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    onUpdate?: (content: string) => void
  ): AsyncGenerator<string, void, unknown> {
    if (!this.googleAI) {
      yield this.language === 'en'
        ? "Google AI is not initialized. Please check your API key."
        : "गूगल एआय सुरू झाले नाही. कृपया आपली API की तपासा.";
      return;
    }

    const model = this.googleAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const prompt = systemPrompt + '\n\n' + messages[messages.length - 1].content;
    const result = await chat.sendMessageStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (onUpdate) onUpdate(text);
      yield text;
    }
  }

  private async *generateZhipuResponse(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    onUpdate?: (content: string) => void
  ): AsyncGenerator<string, void, unknown> {
    // Placeholder for ZhipuAI implementation
    yield this.language === 'en'
      ? "ZhipuAI is not fully implemented yet."
      : "झिपूएआय अद्याप पूर्णपणे लागू केले गेले नाही.";
  }
}

export const aiService = new AIService();
