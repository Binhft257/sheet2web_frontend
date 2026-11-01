import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./auth.module.css";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  labelAction?: ReactNode;
  trailingAction?: ReactNode;
  help?: ReactNode;
};

export default function AuthField({
  id,
  label,
  error,
  labelAction,
  trailingAction,
  help,
  className,
  ...inputProps
}: AuthFieldProps) {
  const describedBy =
    [
      inputProps["aria-describedby"],
      error ? `${id}-error` : undefined,
      help ? `${id}-help` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeading}>
        <label htmlFor={id}>{label}</label>
        {labelAction}
      </div>
      <div className={styles.inputWrap} data-trailing={Boolean(trailingAction)}>
        <input
          {...inputProps}
          id={id}
          className={[styles.input, className].filter(Boolean).join(" ")}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        {trailingAction ? (
          <div className={styles.trailing}>{trailingAction}</div>
        ) : null}
      </div>
      {help ? (
        <div className={styles.help} id={`${id}-help`}>
          {help}
        </div>
      ) : null}
      {error ? (
        <p className={styles.fieldError} id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthMessage({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success" | "info";
}) {
  return (
    <p
      className={styles.message}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
