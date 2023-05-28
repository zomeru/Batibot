import { Configuration, OpenAIApi } from 'openai';

const createConfig = () => {
  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined');
  }

  return new Configuration({ apiKey: API_KEY });
};

export const openai = new OpenAIApi(createConfig());
