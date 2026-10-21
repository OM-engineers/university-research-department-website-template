import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  label: string;
  error?: string;
  success?: string;
};

type InputProps = BaseProps & {
  type?: 'text' | 'email' | 'checkbox';
} & InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps & {
  type: 'textarea';
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export type FormFieldProps = InputProps | TextareaProps;

export function FormField({ 
  label, 
  error, 
  success, 
  required, 
  className = '', 
  id,
  ...props 
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const isError = Boolean(error);
  const isSuccess = Boolean(success) && !isError;
  const ariaProps = {
    'aria-invalid': isError || undefined,
    'aria-describedby': isError || isSuccess ? messageId : undefined,
  };

  if (props.type === 'checkbox') {
    return (
      <label className={`flex items-center gap-3 text-[14px] text-[var(--color-text)] cursor-pointer ${className}`}>
        <input 
          type="checkbox"
          id={fieldId}
          required={required}
          className="w-[18px] h-[18px] rounded-[4px] border-[1.5px] border-[var(--color-border)] appearance-none checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent focus:ring-offset-1 transition-all"
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
        {label}
      </label>
    );
  }

  const baseInputStyles = "w-full rounded-[var(--radius)] px-3 py-2 outline-none transition-all text-[var(--color-text)] bg-[var(--color-background)] placeholder:text-[var(--color-text-muted)]";
  let stateStyles = "border border-[var(--color-border)] focus:border-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-text)]";
  
  if (isError) {
    stateStyles = "border-[1.5px] border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-1 focus:ring-[var(--color-error)]";
  } else if (isSuccess) {
    stateStyles = "border-[1.5px] border-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-1 focus:ring-[var(--color-success)]";
  }

  // "textarea" is not a valid type attribute, so keep it off the element.
  const { type: _type, ...textareaProps } = props as TextareaProps;
  const combinedStyles = `${baseInputStyles} ${stateStyles} ${className}`.trim();

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans">
      <label htmlFor={fieldId} className="text-[14px] font-semibold text-[var(--color-text)] flex items-center">
        {label} {required && <span className="ml-1 text-[var(--color-text)]">*</span>}
      </label>

      {props.type === 'textarea' ? (
        <textarea 
          id={fieldId}
          required={required}
          className={`${combinedStyles} min-h-[100px] resize-y`} 
          {...ariaProps}
          {...textareaProps}
        />
      ) : (
        <input 
          id={fieldId}
          required={required}
          className={combinedStyles} 
          {...ariaProps}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {isError && <span id={messageId} className="text-[14px] text-[var(--color-error)] mt-0.5">{error}</span>}
      {isSuccess && (
        <span id={messageId} className="text-[14px] text-[var(--color-success)] mt-0.5 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {success}
        </span>
      )}
    </div>
  );
}