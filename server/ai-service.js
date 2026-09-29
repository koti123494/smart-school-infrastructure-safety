export class AIProviderUnavailableError extends Error {
  constructor() {
    super('AI provider is not configured.');
    this.name = 'AIProviderUnavailableError';
  }
}

export function createAIService(provider = null) {
  return {
    async analyzeAlert(alert) {
      if (typeof provider?.analyzeAlert !== 'function') throw new AIProviderUnavailableError();
      return provider.analyzeAlert(alert);
    },

    async answerQuestion({ question, data }) {
      if (typeof provider?.answerQuestion !== 'function') throw new AIProviderUnavailableError();
      return provider.answerQuestion({ question, data });
    },
  };
}
