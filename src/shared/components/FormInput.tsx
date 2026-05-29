import Icon, { IconName } from '@/shared/components/Icon';

type FormInputProps = {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  icon: IconName;
  error?: string;
  rightSlot?: React.ReactNode;
};

const FormInput = ({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  icon,
  placeholder,
  error,
  rightSlot,
}: FormInputProps) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5"
    >
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark text-lg pointer-events-none">
        <Icon
          name={icon}
          className="text-text-secondary-light dark:text-text-secondary-dark text-lg pointer-events-none"
        />
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full pl-10 ${rightSlot ? 'pr-10' : 'pr-4'} py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
          error
            ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/20'
            : 'border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800'
        } text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark`}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <Icon name="error_outline" className="text-xs" />
        {error}
      </p>
    )}
  </div>
);

export default FormInput;
