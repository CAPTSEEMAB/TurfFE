import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormField, PlayerFormData } from '@/types';

interface DynamicFormFieldProps {
  field: FormField;
  value: string;
  onChange: (name: string, value: string) => void;
  idPrefix?: string;
}

export const DynamicFormField = ({ 
  field, 
  value, 
  onChange, 
  idPrefix = '' 
}: DynamicFormFieldProps) => {
  const id = `${idPrefix}${field.name}`;
  
  return (
    <div className={`space-y-2 ${field.gridSpan === 2 ? 'col-span-2' : ''}`}>
      <Label htmlFor={id}>
        {field.label} {field.required && '*'}
      </Label>
      {field.type === 'textarea' ? (
        <Textarea
          id={id}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
        />
      ) : (
        <Input
          id={id}
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
        />
      )}
    </div>
  );
};

interface DynamicFormProps {
  fields: FormField[];
  values: PlayerFormData | Record<string, string>;
  onChange: (name: string, value: string) => void;
  idPrefix?: string;
  columns?: 1 | 2;
}

export const DynamicForm = ({ 
  fields, 
  values, 
  onChange, 
  idPrefix = '',
  columns = 2 
}: DynamicFormProps) => {
  return (
    <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {fields.map((field) => (
        <DynamicFormField
          key={field.name}
          field={field}
          value={values[field.name] || ''}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      ))}
    </div>
  );
};

export const PLAYER_FORM_FIELDS: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'position', label: 'Position', type: 'text', placeholder: 'e.g., PG, SF, C', required: true },
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'nationality', label: 'Nationality', type: 'text', required: true },
  { name: 'height_cm', label: 'Height (cm)', type: 'number', required: true },
  { name: 'weight_kg', label: 'Weight (kg)', type: 'number', required: true },
  { name: 'image_url', label: 'Image URL', type: 'url', gridSpan: 2 },
  { name: 'notes', label: 'Notes', type: 'text', gridSpan: 2 },
];
