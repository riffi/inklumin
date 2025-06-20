import { useState } from "react";
import { IconLink } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Box, Button, Group, Text } from "@mantine/core";
import { bookDb } from "@/entities/bookDb";
import { IBlockParameterInstance } from "@/entities/BookEntities";
import { IBlockParameter, IBlockParameterDataType } from "@/entities/ConstructorEntities";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import classes from "./ParameterViewVariantRenderer.module.css";

interface ParameterViewProps {
  dataType: string;
  value: string;
  fontSize?: number;
}

export const ParameterViewVariantRenderer = ({
  dataType,
  value,
  fontSize = 14,
}: ParameterViewProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const needsTruncation = value?.length > 500;

  // Получение связанного инстанса для blockLink
  const blockInstance = useLiveQuery(async () => {
    if (dataType === IBlockParameterDataType.blockLink && value) {
      return BlockInstanceRepository.getByUuid(bookDb, value);
    }
    return null;
  }, [value, dataType]);

  const handleToggleExpand = () => setIsExpanded(!isExpanded);

  if (dataType === IBlockParameterDataType.blockLink) {
    return (
      <Group gap={2}>
        <Text component="div" style={{ fontSize }}>
          {blockInstance?.title ?? "Не указано"}
        </Text>
        {blockInstance && (
          <ActionIcon
            size="18"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/block-instance/card?uuid=" + blockInstance.uuid);
            }}
          >
            <IconLink />
          </ActionIcon>
        )}
      </Group>
    );
  }

  if (dataType === IBlockParameterDataType.colorPicker) {
    return (
      <Box
        style={{
          margin: "10px 0px 0px 0px",
          borderRadius: 5,
          height: 20,
          width: 60,
          backgroundColor: value,
        }}
      />
    );
  }

  return (
    <Text component="div" style={{ fontSize }}>
      <div
        dangerouslySetInnerHTML={{ __html: value || "Не указано" }}
        className={`${classes.htmlContent} ${
          !isExpanded && needsTruncation ? classes.clampedContent : ""
        }`}
      />
      {needsTruncation && (
        <Button
          variant="subtle"
          size="xs"
          onClick={handleToggleExpand}
          className={classes.toggleButton}
        >
          {isExpanded ? "Свернуть" : "Показать полностью"}
        </Button>
      )}
    </Text>
  );
};
