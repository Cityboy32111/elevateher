"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Button
 * -------------------------------------------------------------------------- */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA4B8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[#7C9A82] text-white hover:bg-[#6B8971] active:bg-[#5A7860]",
        secondary:
          "border border-[#7C9A82] bg-transparent text-[#7C9A82] hover:bg-[#7C9A82]/10 active:bg-[#7C9A82]/20",
        ghost:
          "bg-transparent text-[#2D2D2D] hover:bg-[#2D2D2D]/5 active:bg-[#2D2D2D]/10",
        danger:
          "bg-[#C4706A] text-white hover:bg-[#B35F59] active:bg-[#A24E48]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

/* ---------------------------------------------------------------------------
 * Card
 * -------------------------------------------------------------------------- */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-[#2D2D2D]/8 bg-white p-5 shadow-sm",
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="mb-3 text-base font-semibold text-[#2D2D2D]">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
);
Card.displayName = "Card";

/* ---------------------------------------------------------------------------
 * Input
 * -------------------------------------------------------------------------- */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#2D2D2D]/70"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-lg border border-[#2D2D2D]/15 bg-white px-3 text-sm text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 transition-colors",
            "focus:border-[#8BA4B8] focus:outline-none focus:ring-2 focus:ring-[#8BA4B8]/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

/* ---------------------------------------------------------------------------
 * Textarea
 * -------------------------------------------------------------------------- */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => {
    const textareaId = id || React.useId();
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[#2D2D2D]/70"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-[100px] w-full rounded-lg border border-[#2D2D2D]/15 bg-white px-3 py-2.5 text-sm text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 transition-colors resize-y",
            "focus:border-[#8BA4B8] focus:outline-none focus:ring-2 focus:ring-[#8BA4B8]/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

/* ---------------------------------------------------------------------------
 * Select
 * -------------------------------------------------------------------------- */

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    const selectId = id || React.useId();
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[#2D2D2D]/70"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border border-[#2D2D2D]/15 bg-white px-3 pr-8 text-sm text-[#2D2D2D] transition-colors",
            "focus:border-[#8BA4B8] focus:outline-none focus:ring-2 focus:ring-[#8BA4B8]/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

/* ---------------------------------------------------------------------------
 * Badge
 * -------------------------------------------------------------------------- */

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[#7C9A82]/15 text-[#7C9A82]",
        sage: "bg-[#7C9A82]/15 text-[#7C9A82]",
        rose: "bg-[#C4A49A]/20 text-[#9A7B71]",
        blue: "bg-[#8BA4B8]/15 text-[#6B8A9E]",
        warm: "bg-[#D4A574]/15 text-[#9A7548]",
        neutral: "bg-[#2D2D2D]/8 text-[#2D2D2D]/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

/* ---------------------------------------------------------------------------
 * ProgressBar
 * -------------------------------------------------------------------------- */

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0-100 */
  value: number;
  /** Optional label shown above the bar */
  label?: string;
  /** Show percentage text */
  showValue?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, label, showValue = false, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));
    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-[#2D2D2D]/70">{label}</span>
            )}
            {showValue && (
              <span className="text-[#2D2D2D]/50">{Math.round(clamped)}%</span>
            )}
          </div>
        )}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#2D2D2D]/8">
          <div
            className="h-full rounded-full bg-[#7C9A82] transition-all duration-500 ease-out"
            style={{ width: `${clamped}%` }}
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

/* ---------------------------------------------------------------------------
 * ScaleInput (1-5 for check-ins)
 * -------------------------------------------------------------------------- */

export interface ScaleInputProps {
  /** Current selected value (1-5), or null if none selected */
  value: number | null;
  /** Callback when a value is selected */
  onChange: (value: number) => void;
  /** Labels for each point. Defaults to generic labels. */
  labels?: [string, string, string, string, string];
  /** Optional question / label */
  label?: string;
  className?: string;
  disabled?: boolean;
}

const defaultScaleLabels: [string, string, string, string, string] = [
  "Not at all",
  "A little",
  "Somewhat",
  "Quite",
  "Very much",
];

function ScaleInput({
  value,
  onChange,
  labels = defaultScaleLabels,
  label,
  className,
  disabled = false,
}: ScaleInputProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span className="text-sm font-medium text-[#2D2D2D]/70">{label}</span>
      )}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA4B8] focus-visible:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-[#7C9A82] bg-[#7C9A82]/10 text-[#7C9A82]"
                  : "border-[#2D2D2D]/10 bg-white text-[#2D2D2D]/60 hover:border-[#2D2D2D]/25 hover:bg-[#2D2D2D]/3"
              )}
            >
              <span className="text-sm font-semibold">{n}</span>
              <span className="leading-tight">{labels[n - 1]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Toggle (boolean yes / no)
 * -------------------------------------------------------------------------- */

export interface ToggleProps {
  /** Current state */
  checked: boolean;
  /** Callback when toggled */
  onChange: (checked: boolean) => void;
  /** Optional label */
  label?: string;
  className?: string;
  disabled?: boolean;
}

function Toggle({
  checked,
  onChange,
  label,
  className,
  disabled = false,
}: ToggleProps) {
  const id = React.useId();
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA4B8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-[#7C9A82]" : "bg-[#2D2D2D]/15"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer text-sm font-medium text-[#2D2D2D]/70"
        >
          {label}
        </label>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  Button,
  buttonVariants,
  Card,
  Input,
  Textarea,
  Select,
  Badge,
  badgeVariants,
  ProgressBar,
  ScaleInput,
  Toggle,
};
