export type Provider = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'ollama'

export interface Settings {
  provider: Provider | null;
  model: string | null;
}

export const getSettings = (): Settings => {
  if (typeof window === 'undefined') return { provider: null, model: null };
  const settings = localStorage.getItem('settings');
  return settings ? JSON.parse(settings) : { provider: null, model: null };
}

export const saveSettings = (settings: Settings) => {
  localStorage.setItem('settings', JSON.stringify(settings));
}

export const providerOptions = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4o-latest', 'o1', 'o1-mini', 'o1-preview', 'o3-mini', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  google: ['gemini-2.0-flash-001', 'gemini-2.0-pro-exp-02-05', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-2.0-flash-thinking-exp-01-21', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
  openrouter: ['deepseek/deepseek-r1', 'qwen/qwen-turbo', 'qwen/qwen-plus', 'qwen/qwen-max', 'meta-llama/llama-3.3-70b-instruct'],
  ollama: [] // Custom input
}

export const defaultQuestions = [
  'What is the main topic of the transcript?',
  'What are the key points discussed in the transcript?',
  'What are the main takeaways from the transcript?',
  'What are the main recommendations from the transcript?',
  'What are the main insights from the transcript?',
  'What are the main conclusions from the transcript?',
  'What are the main recommendations from the transcript?',
  'What deadlines are mentioned in the transcript?',
  'What are the main next steps from the transcript?',
  'What are the main follow up questions from the transcript?',
  'What are the main follow up actions from the transcript?',
  'How can I ensure an understanding of the content discussed in the transcript?',
]