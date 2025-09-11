// src/components/products/detail/CustomizationOptions.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CustomizationOption } from '@/lib/mock-data';

interface CustomizationOptionsProps {
  options?: CustomizationOption[];
  onCustomizationChange: (option: CustomizationOption, value: string) => void;
}

export function CustomizationOptions({ options, onCustomizationChange }: CustomizationOptionsProps) {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col gap-4 p-6 rounded-2xl neumorphic-shadow-inset bg-[#fcfbfa]">
        <h3 className="text-lg font-bold text-primary">Personaliza tu Regalo</h3>
        {options.map((option) => (
        <div key={option.id} className="space-y-2">
            <Label htmlFor={option.id} className="text-base font-semibold">{option.label}</Label>
            {option.type === 'text' && (
            <Input
                id={option.id}
                placeholder={option.placeholder}
                onChange={(e) => onCustomizationChange(option, e.target.value)}
                className="bg-background"
            />
            )}
            {option.type === 'textarea' && (
            <Textarea
                id={option.id}
                placeholder={option.placeholder}
                onChange={(e) => onCustomizationChange(option, e.target.value)}
                className="bg-background"
            />
            )}
            {option.type === 'radio' && option.choices && (
            <RadioGroup
                id={option.id}
                className="flex gap-4 pt-2"
                onValueChange={(value) => onCustomizationChange(option, value)}
            >
                {option.choices.map((choice) => (
                <div key={choice.name} className="flex items-center space-x-2">
                    <RadioGroupItem value={choice.name} id={`${option.id}-${choice.name}`} />
                    <Label htmlFor={`${option.id}-${choice.name}`} className="font-normal">{choice.name}</Label>
                </div>
                ))}
            </RadioGroup>
            )}
            {option.type === 'image' && (
                <Input
                id={option.id}
                type="file"
                className="file:text-primary file:font-semibold bg-background"
                onChange={(e) => onCustomizationChange(option, e.target.files ? e.target.files[0].name : '')}
            />
            )}
        </div>
        ))}
    </div>
  );
}
