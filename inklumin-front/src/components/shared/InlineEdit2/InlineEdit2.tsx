import React, { useEffect, useRef, useState } from "react";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { ActionIcon, Box, Text, TextInput } from "@mantine/core";

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  label?: string;
  labelProps?: {
    size?: string;
    weight?: string | number;
    color?: string;
  };
  // положение подписи: сверху или слева
  labelPosition?: "top" | "left";
}

export const InlineEdit2: React.FC<InlineEditProps> = ({
  value,
  onChange,
  placeholder = "Введите текст...",
  disabled = false,
  size = "sm",
  label,
  labelProps = {},
  // по умолчанию подпись располагается сверху
  labelPosition = "top",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Определяем размеры в зависимости от size prop
  const getSizeConfig = (size: string) => {
    const configs = {
      xs: { minHeight: 28, fontSize: "xs", iconSize: 14 },
      sm: { minHeight: 32, fontSize: "sm", iconSize: 16 },
      md: { minHeight: 36, fontSize: "md", iconSize: 18 },
      lg: { minHeight: 42, fontSize: "lg", iconSize: 20 },
      xl: { minHeight: 48, fontSize: "xl", iconSize: 22 },
    };
    return configs[size] || configs.sm;
  };

  const sizeConfig = getSizeConfig(size);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const saveValue = () => {
    if (editValue.trim() !== value) {
      onChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveValue();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  const handleBlur = () => {
    saveValue();
  };

  const displayValue = value || placeholder;

  return (
    <Box style={{ width: "100%" }}>
      {labelPosition === "top" && label && (
        <Text
          size={size || "sm"}
          weight={labelProps.weight || 500}
          color={labelProps.color || "dimmed"}
          mb={0}
          style={{ userSelect: "none" }}
        >
          {label}
        </Text>
      )}
      <Box
        ref={containerRef}
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: sizeConfig.minHeight,
          position: "relative",
          width: "100%",
        }}
      >
        {labelPosition === "left" && label && (
          <Text
            size={size || "sm"}
            weight={labelProps.weight || 500}
            color={labelProps.color || "dimmed"}
            mr={8}
            style={{ userSelect: "none" }}
          >
            {label}
          </Text>
        )}
        {isEditing ? (
          <>
            <TextInput
              ref={inputRef}
              value={editValue}
              onChange={(event) => setEditValue(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              size={size}
              styles={{
                root: {
                  flex: 1,
                  width: "100%",
                  marginRight: "32px",
                },
                input: {
                  border: "none",
                  borderBottom: "2px solid #228be6",
                  borderRadius: 0,
                  backgroundColor: "transparent",
                  paddingLeft: 0,
                  paddingRight: 0,
                  width: "100%",
                  boxSizing: "border-box",
                  "&:focus": {
                    borderBottom: "2px solid #1c7ed6",
                    outline: "none",
                  },
                },
              }}
            />
            <ActionIcon
              size={size}
              variant="subtle"
              color="green"
              onClick={saveValue}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                flexShrink: 0,
              }}
            >
              <IconCheck size={sizeConfig.iconSize} />
            </ActionIcon>
          </>
        ) : (
          <Box
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: sizeConfig.minHeight,
              maxWidth: "100%",
            }}
          >
            <Text
              size={sizeConfig.fontSize}
              color={value ? undefined : "dimmed"}
              onClick={startEditing}
              style={{
                wordBreak: "break-word",
                userSelect: "none",
                overflow: "hidden",
                cursor: disabled ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                minHeight: sizeConfig.minHeight,
              }}
            >
              {displayValue}
            </Text>
            {!disabled && (
              <ActionIcon
                size={size}
                variant="subtle"
                color="gray"
                onClick={startEditing}
                style={{
                  marginLeft: "8px",
                  opacity: 0.7,
                  flexShrink: 0,
                }}
              >
                <IconEdit size={sizeConfig.iconSize} />
              </ActionIcon>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
