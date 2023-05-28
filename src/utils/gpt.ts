import { supabase, openai } from '../config';

export const chatCompletion = async (text: string, userId: number) => {
  const pageSendingId = process.env.PAGE_SENDING_ID!;
  let previousMessages: { message: string }[] | null = null;

  // Only save the user's id, not the our page's id
  if (userId !== parseInt(pageSendingId)) {
    // Check if user exists in the database
    const { data: user } = await supabase
      .from('users')
      .select('ps_id')
      .eq('ps_id', userId)
      .single();

    if (!user) {
      // If user doesn't exist, create a new user
      const { data: newUser } = await supabase
        .from('users')
        .insert({ ps_id: userId })
        .select('ps_id')
        .single();

      if (newUser) console.log('New user created:', newUser);
    }

    // Get all the user's previous messages (10 messages)
    const { data: userPreviousMessages } = await supabase
      .from('messages')
      .select('message')
      .eq('user_id', userId)
      .limit(10);

    if (userPreviousMessages) {
      previousMessages = userPreviousMessages;
    }

    // Save the user's message to the database
    const { data: message } = await supabase
      .from('messages')
      .insert({ message: text, user_id: userId });
    console.log('New message saved:', message);
  }

  let messagesString = '';
  // Loop through the messages and add them to the messagesString
  // format 1. message\n2. message\n3. message\n
  if (previousMessages?.length) {
    previousMessages?.forEach((message, index) => {
      messagesString += `${index + 1}. ${message.message}\n`;
    });
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Respond to the user's messages as best, accurately, convincingly, and as human-like as you can, keep it short and straight to the point. Maximum of 5 sentences. You can also add bullets and numbers in a list in addition to the 5 sentences, but add then only if the user asks for it.${
          messagesString &&
          ` Also, you can try to make your answer based on the user's previous messages, if they did not get the answer they want and they ask again. Here are the 20 previous messages of the user, the most recent is always number 1:\n${messagesString}`
        }`,
      },
      { role: 'user', content: text },
    ],
  });

  if (
    response.data.choices.length <= 0 ||
    !response.data.choices[0]?.message?.content
  ) {
    return 'Sorry, something went wrong on our end. Please try again.';
  }

  console.log({
    content: response.data.choices[0].message.content,
  });

  return response.data.choices[0].message.content;
};
