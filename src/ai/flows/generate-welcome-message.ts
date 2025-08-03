'use server';

/**
 * @fileOverview A flow for generating personalized welcome messages for new CryptoWaffle members.
 *
 * - generateWelcomeMessage - A function that generates a personalized welcome message.
 * - GenerateWelcomeMessageInput - The input type for the generateWelcomeMessage function.
 * - GenerateWelcomeMessageOutput - The return type for the generateWelcomeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWelcomeMessageInputSchema = z.object({
  memberName: z.string().describe('The name of the new CryptoWaffle member.'),
  interests: z.string().describe('The interests of the new CryptoWaffle member, e.g., DeFi, NFTs, etc.'),
});
export type GenerateWelcomeMessageInput = z.infer<typeof GenerateWelcomeMessageInputSchema>;

const GenerateWelcomeMessageOutputSchema = z.object({
  welcomeMessage: z.string().describe('The personalized welcome message for the new CryptoWaffle member.'),
});
export type GenerateWelcomeMessageOutput = z.infer<typeof GenerateWelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input: GenerateWelcomeMessageInput): Promise<GenerateWelcomeMessageOutput> {
  return generateWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWelcomeMessagePrompt',
  input: {schema: GenerateWelcomeMessageInputSchema},
  output: {schema: GenerateWelcomeMessageOutputSchema},
  prompt: `You are a friendly and welcoming representative of CryptoWaffle, a community dedicated to cryptocurrency and blockchain technology. 
  Your goal is to create a personalized welcome message for new members, making them feel excited and informed about their membership.

  Use the following information about the new member to tailor the welcome message:

  Member Name: {{{memberName}}}
  Interests: {{{interests}}}

  The welcome message should:
  - Be enthusiastic and engaging.
  - Briefly highlight the benefits of being a CryptoWaffle member.
  - Mention the member's interests and how CryptoWaffle can help them explore those interests.
  - Encourage the member to actively participate in the community.
  - End with a warm invitation to reach out with any questions.
  `,
});

const generateWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generateWelcomeMessageFlow',
    inputSchema: GenerateWelcomeMessageInputSchema,
    outputSchema: GenerateWelcomeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
