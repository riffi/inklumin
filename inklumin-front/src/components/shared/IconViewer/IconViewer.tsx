import React from "react";
import * as Gi from "react-icons/gi";
import { Box, Image as MantineImage } from "@mantine/core";
import { IIcon, IIconKind } from "@/entities/ConstructorEntities";

interface IconViewerProps {
  icon?: IIcon;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: React.CSSProperties; // Добавляем пропс для стилей
  showNoImage?: boolean;
}

export const IconViewer = ({
  icon,
  size = 24,
  color = "black",
  backgroundColor = "#fff",
  style,
  showNoImage,
}: IconViewerProps) => {
  const isIconEmpty = !icon || (icon && !icon.iconName && !icon.iconBase64);

  const combinedStyle = {
    color,
    backgroundColor,
    padding: `3px 5px`,
    borderRadius: "3px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style, // Переданные стили перезаписывают базовые
  };

  if (isIconEmpty) {
    return (
      <Box style={combinedStyle}>
        {showNoImage && <MantineImage src="/no-image.png" alt="Нет иконки" radius="sm" />}
      </Box>
    );
  }

  const IconComponent = icon && icon.iconKind === "gameIcons" ? Gi[icon.iconName] : null;

  if (icon?.iconKind === IIconKind.custom) {
    return (
      <Box>
        <MantineImage
          src={icon?.iconBase64}
          alt="Пользовательская иконка"
          style={{
            width: `${size + 10}px`,
            marginRight: "5px",
          }}
          radius="sm"
        />
      </Box>
    );
  }

  return (
    <Box style={combinedStyle}>
      {IconComponent ? <>{React.createElement(IconComponent, { size })}</> : <></>}
    </Box>
  );
};
