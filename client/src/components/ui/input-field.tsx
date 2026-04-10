import React from "react";
import { Input } from "./input";
import { Label } from "./label";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, placeholder, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <Input ref={ref} id={inputId} {...props} placeholder={placeholder} />
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
InputField.displayName = "InputField";
