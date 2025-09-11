import { Input } from "@/components/ui/input";

// Custom Text Input Component
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  maxLength?: number;
}

export default function TextInput({
  value,
  onChange,
  placeholder,
  error,
  maxLength,
}: TextInputProps) {
  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
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
