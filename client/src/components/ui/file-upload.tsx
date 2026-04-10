import React, { useRef, useState } from "react";
import { Label } from "./label";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  preview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  helperText,
  preview = false,
  id,
  ...props
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) props.onChange(e);
    const file = e.target.files?.[0];
    if (file && preview && file.type.startsWith("image/")) {
      setFileUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-1">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        className="block w-full text-sm text-gray-900  rounded-sm cursor-pointer focus:outline-none"
        onChange={handleChange}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {preview && fileUrl && (
        <img
          src={fileUrl}
          alt="Preview"
          className="mt-2 h-20 w-20 object-cover rounded"
        />
      )}
    </div>
  );
};
