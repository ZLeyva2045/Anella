// src/components/products/detail/CustomizationOptions.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CustomizationOption } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

interface CustomizationOptionsProps {
  options?: CustomizationOption[];
}

export function CustomizationOptions({ options }: CustomizationOptionsProps) {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
        <Separator className="my-4"/>
      <Card>
        <CardHeader>
          <CardTitle>Personaliza tu Regalo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {options.map((option) => (
            <div key={option.id} className="space-y-2">
              <Label htmlFor={option.id} className="text-base font-semibold">{option.label}</Label>
              {option.type === 'text' && (
                <Input id={option.id} placeholder={option.placeholder} />
              )}
              {option.type === 'textarea' && (
                <Textarea id={option.id} placeholder={option.placeholder} />
              )}
              {option.type === 'radio' && option.choices && (
                <RadioGroup id={option.id} className="flex gap-4 pt-2">
                  {option.choices.map((choice) => (
                    <div key={choice} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice} id={`${option.id}-${choice}`} />
                      <Label htmlFor={`${option.id}-${choice}`}>{choice}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
               {option.type === 'image' && (
                <Input id={option.id} type="file" className="file:text-primary file:font-semibold" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}