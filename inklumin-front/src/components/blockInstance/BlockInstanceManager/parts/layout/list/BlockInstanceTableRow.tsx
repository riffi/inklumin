import { IconArrowRightCircleFilled, IconEdit, IconTrash } from "@tabler/icons-react";
import { Badge, Box, Group, Stack, Table, Text } from "@mantine/core";
import { IBlockInstanceWithParams } from "@/components/blockInstance/BlockInstanceManager/hooks/useBlockInstanceManager";
import { ParameterViewVariantRenderer } from "@/components/shared/blockParameter/ParameterViewVariantRenderer/ParameterViewVariantRenderer";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import {
  ActionItem,
  RowActionButtons,
} from "@/components/shared/RowActionButtons/RowActionButtons";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlock, IBlockParameter, IBlockParameterDataType } from "@/entities/ConstructorEntities";
import classes from "./BlockInstanceList.module.css";

interface BlockInstanceTableRowProps {
  instance: IBlockInstanceWithParams;
  block: IBlock;
  displayedParameters?: IBlockParameter[];
  onEdit: (uuid: string) => void;
  onDelete: (instance: IBlockInstance) => void;
  onMove: (uuid: string) => void;
}

export const BlockInstanceTableRow = ({
  instance,
  block,
  displayedParameters,
  onEdit,
  onDelete,
  onMove,
}: BlockInstanceTableRowProps) => {
  const actions: ActionItem[] = [
    {
      title: "Редактировать",
      icon: <IconEdit />,
      color: "blue",
      handler: () => onEdit(instance.uuid!),
    },
    {
      title: "Переместить",
      icon: <IconArrowRightCircleFilled />,
      handler: () => onMove(instance.uuid!),
    },
    {
      title: "Удалить",
      icon: <IconTrash />,
      color: "red",
      handler: () => onDelete(instance),
    },
  ];

  return (
    <Table.Tr key={instance.uuid}>
      <Table.Td
        onClick={() => onEdit(instance.uuid!)}
        style={{ cursor: "pointer", padding: "10px 0px 10px 20px" }}
      >
        <Group gap="10" wrap="nowrap">
          <Box className={classes.iconContainer}>
            <IconViewer
              icon={instance?.icon ?? block?.icon}
              size={45}
              color="rgb(102, 102, 102)"
              backgroundColor="transparent"
            />
          </Box>
          <Stack gap={0}>
            <Text style={{ cursor: "pointer", fontSize: "1rem", lineHeight: "1.5rem" }}>
              {instance.title}
            </Text>
            {instance.description && (
              <Text size="sm" c="dimmed" mt={0}>
                {instance.description}
              </Text>
            )}
            <Group
              gap="0"
              style={{
                marginTop: "0px",
              }}
            >
              {displayedParameters?.map((param, index) => {
                const paramInstance = instance.params?.find(
                  (p) => p.blockParameterUuid === param.uuid
                );
                if (!paramInstance) return;
                return (
                  <Badge
                    key={param.uuid}
                    variant="transparent"
                    color="#BBB"
                    style={{
                      fontSize: "0.8rem",
                      textTransform: "lowercase",
                      fontWeight: 400,
                      paddingLeft: "0px",
                      borderRadius: "0",
                      cursor: "pointer",
                    }}
                  >
                    <Group
                      gap={5}
                      style={{
                        borderRight:
                          index < displayedParameters?.length - 1 ? "1px solid #EEE" : "none",
                        paddingRight: "10px",
                      }}
                    >
                      <Text size={12}>{param.title}: </Text>

                      <ParameterViewVariantRenderer
                        dataType={param.dataType}
                        value={
                          param.dataType === IBlockParameterDataType.blockLink
                            ? paramInstance?.linkedBlockInstanceUuid || ""
                            : paramInstance?.value || ""
                        }
                      />
                    </Group>
                  </Badge>
                );
              })}
            </Group>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td style={{width: '50px'}}>
        <RowActionButtons actions={actions} entityId={instance.uuid} drawerTitle="Действия" />
      </Table.Td>
    </Table.Tr>
  );
};
