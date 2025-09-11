import { Textarea } from "@/components/ui/textarea";

// Custom Textarea Component
interface TextareaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  maxLength?: number;
  rows?: number;
}

export default function TextareaInput({
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  rows = 4,
}: TextareaInputProps) {
  return (
    <div className="space-y-1">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
        rows={rows}
        maxLength={maxLength}
      />
      {maxLength && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
