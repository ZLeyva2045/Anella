"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { recommendGift, type RecommendGiftOutput } from '@/ai/flows/gift-recommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Gift, Wand2 } from 'lucide-react';

const recommendGiftSchema = z.object({
  recipientInterests: z.string().min(10, { message: 'Please describe their interests in a bit more detail.' }),
  occasion: z.string().min(1, { message: 'Please select an occasion.' }),
  budget: z.string().min(1, { message: 'Please select a budget.' }),
});

type RecommendGiftFormValues = z.infer<typeof recommendGiftSchema>;

export function GiftRecommendation() {
  const [recommendation, setRecommendation] = useState<RecommendGiftOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RecommendGiftFormValues>({
    resolver: zodResolver(recommendGiftSchema),
    defaultValues: {
      recipientInterests: '',
      occasion: '',
      budget: '',
    },
  });

  async function onSubmit(values: RecommendGiftFormValues) {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      const result = await recommendGift(values);
      setRecommendation(result);
    } catch (e) {
      console.error(e);
      setError('Sorry, we couldn\'t generate recommendations at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="recommendations" className="container mx-auto px-4 py-16">
      <Card className="max-w-3xl mx-auto shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Need a Gift Idea?</CardTitle>
          <CardDescription>Let our AI assistant help you find the perfect personalized gift.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="occasion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occasion</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="What's the special occasion?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Birthday">Birthday</SelectItem>
                        <SelectItem value="Anniversary">Anniversary</SelectItem>
                        <SelectItem value="Wedding">Wedding</SelectItem>
                        <SelectItem value="Thank You">Thank You</SelectItem>
                        <SelectItem value="Just Because">Just Because</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Budget</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="What's your price range?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under_50_soles">Under S/50</SelectItem>
                        <SelectItem value="50_100_soles">S/50 - S/100</SelectItem>
                        <SelectItem value="100_200_soles">S/100 - S/200</SelectItem>
                        <SelectItem value="over_200_soles">Over S/200</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About the Recipient</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Loves coffee, hiking, and is a big fan of Star Wars..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Finding a Perfect Gift...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-5 w-5" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </form>
          </Form>

          {error && <p className="mt-6 text-center text-destructive">{error}</p>}
          
          {recommendation && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-2xl font-bold text-center mb-4">Here are some ideas!</h3>
              <div className="bg-primary/5 p-4 rounded-lg mb-6">
                 <p className="text-sm italic text-center"><strong>Reasoning:</strong> {recommendation.reasoning}</p>
              </div>
              <ul className="space-y-3">
                {recommendation.giftIdeas.map((idea, index) => (
                  <li key={index} className="p-4 bg-background rounded-md border flex items-start gap-3">
                     <Gift className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
