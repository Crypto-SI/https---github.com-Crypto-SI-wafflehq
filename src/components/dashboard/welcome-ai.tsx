"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateWelcomeMessageAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const initialState = {
  message: '',
  errors: {},
  welcomeMessage: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Message
        </>
      )}
    </Button>
  );
}

export function WelcomeAi() {
  const [state, formAction] = useActionState(generateWelcomeMessageAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'Failed to generate message. Please try again.') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && state.welcomeMessage) {
      navigator.clipboard.writeText(state.welcomeMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Welcome Message</CardTitle>
        <CardDescription>Generate a personalized welcome message for a new member.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">Member Name</Label>
            <Input id="memberName" name="memberName" placeholder="e.g., Vitalik Buterin" />
            {state.errors?.memberName && <p className="text-sm text-destructive">{state.errors.memberName[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Textarea id="interests" name="interests" placeholder="e.g., DeFi, NFTs, DAOs" />
             {state.errors?.interests && <p className="text-sm text-destructive">{state.errors.interests[0]}</p>}
          </div>
          <SubmitButton />
        </form>

        {state.welcomeMessage && (
          <div className="mt-6 p-4 border rounded-md bg-card relative group">
            <h4 className="font-semibold text-foreground mb-2">Generated Message:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{state.welcomeMessage}</p>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy message</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
