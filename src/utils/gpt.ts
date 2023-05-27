import { createClient } from '@supabase/supabase-js';

import { Configuration, OpenAIApi } from 'openai';

export const chatCompletion = async (text: string, userId: number) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_API_KEY!
  );

  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY! })
  );

  // Check if user exists in the database
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('ps_id')
    .eq('ps_id', userId)
    .single();

  if (!user || userError) {
    // If user doesn't exist, create a new user
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert({ ps_id: userId })
      .select('ps_id')
      .single();

    console.log({
      newUser,
      newUserError,
    });
  }

  // Get all the user's previous messages (20 messages)
  const { data: messages, error } = await supabase
    .from('messages')
    .select('message')
    .eq('user_id', userId)
    .limit(20);

  console.log({
    messages,
    error,
  });

  // Save the user's message to the database
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({ message: text, user_id: userId })
    .select('message')
    .single();

  console.log({
    message,
    messageError,
  });

  let messagesString = '';
  // Loop through the messages and add them to the messagesString like this: "1. Message 1, 2. Message 2"
  messages?.forEach((message, index) => {
    messagesString += `${index + 1}. ${message.message}, `;
  });

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Respond to the user's messages as best, accurately, convincingly, and as human-like as you can, keep it short and straight to the point. Maximum of 5 sentences. You can also add bullets and numbers in a list in addition to the 5 sentences, but make the bullets and numbers only if the user asks for it.${
          messagesString &&
          ` Also, you can try to make your answer based on the user's previous messages, if they did not get the answer they want and they ask again, you can try to make your answer based on their previous messages. Here are the 20 previous messages of the user with the most recent numbered 1: ${messagesString}`
        }`,
      },
      { role: 'user', content: text },
    ],
  });

  if (response.data.choices.length <= 0) {
    throw new Error('ERROR: No response from OpenAI');
  }

  if (!response.data.choices[0]?.message?.content) {
    throw new Error('ERROR: No response from OpenAI');
  }

  console.log({
    content: response.data.choices[0].message.content,
  });

  return response.data.choices[0].message.content;
};
