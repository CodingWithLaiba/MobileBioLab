import React from "react";
import { Button, ButtonProps } from "./button";

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  label?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  ...props
}) => (
  <Button
    {...props}
    className={
      "inline-flex items-center justify-center gap-2 " + (props.className || "")
    }
  >
    {icon}
    {label && <span>{label}</span>}
  </Button>
);
