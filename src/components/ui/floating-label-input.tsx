"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, label, value, onChange, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(!!value);

        // Update internal state when value prop changes
        React.useEffect(() => {
            setHasValue(!!value);
        }, [value]);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            props.onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            props.onBlur?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(e.target.value.length > 0);
            onChange?.(e);
        };

        const isFloating = isFocused || hasValue;

        return (
            <div className="relative pt-2">
                <motion.label
                    initial={false}
                    animate={{
                        y: isFloating ? -24 : 0,
                        scale: isFloating ? 0.85 : 1,
                        x: isFloating ? -2 : 12,
                        color: isFocused ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute left-0 top-4 pointer-events-none origin-top-left font-medium z-10"
                >
                    {label}
                </motion.label>
                <Input
                    ref={ref}
                    className={cn("bg-transparent pt-2", className)}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
            </div>
        );
    }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
