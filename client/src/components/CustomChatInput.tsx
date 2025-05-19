import React from 'react';

interface CustomChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomChatInput: React.FC<CustomChatInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Type a message...",
  disabled = false
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      style={{
        flex: 1,
        backgroundColor: 'var(--dark-card)',
        color: 'black',
        caretColor: 'black',
        borderRadius: '0.5rem 0 0 0.5rem',
        padding: '0.75rem 1rem',
        outline: 'none',
        border: '1px solid #374151',
        borderRight: 'none'
      }}
    />
  );
};

export default CustomChatInput;