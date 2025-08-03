'use server';

import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';
import { z } from 'zod';

const schema = z.object({
  memberName: z.string().min(1, { message: 'Member name is required.' }),
  interests: z.string().min(1, { message: 'Interests are required.' }),
});

export async function generateWelcomeMessageAction(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    memberName: formData.get('memberName'),
    interests: formData.get('interests'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      welcomeMessage: '',
    };
  }

  try {
    const result = await generateWelcomeMessage(validatedFields.data);
    return {
      message: 'success',
      welcomeMessage: result.welcomeMessage,
      errors: {},
    };
  } catch (error) {
    return {
      message: 'Failed to generate message. Please try again.',
      welcomeMessage: '',
      errors: {},
    };
  }
}
