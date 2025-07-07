import {IconArrowUpRight, IconLink} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import {ActionIcon, Box, Group, Stack, Table, Text, UnstyledButton} from "@mantine/core";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlock, IBlockParameter } from "@/entities/ConstructorEntities";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import {useMedia} from "@/providers/MediaQueryProvider/MediaQueryProvider";

export interface IReferencedInstanceEditorProps {
  instance: IBlockInstance;
  block: IBlock;
  referencingParam: IBlockParameter;
}
export const ReferencedInstanceEditor = (props: IReferencedInstanceEditorProps) => {
  const navigate = useNavigate();
  const {isMobile} = useMedia()

  const referencingInstances = useLiveQuery(async () => {
    const referencedParameterInstances = await bookDb.blockParameterInstances
      .where("blockParameterUuid")
      .equals(props.referencingParam.uuid)
      .filter((pi) => pi.linkedBlockInstanceUuid === props.instance.uuid)
      .toArray();

    const blockInstanceUuids = referencedParameterInstances.map((pi) => pi.blockInstanceUuid);
    const referencedBlockInstances = await bookDb.blockInstances
      .where("uuid")
      .anyOf(blockInstanceUuids)
      .toArray();

    return referencedBlockInstances;
  }, [props.referencingParam, props.block, props.instance]);


  if (!referencingInstances?.length) {
    return (
        <Box>
          <Text c="dimmed" style={{ fontStyle: "italic" }}>
            Ссылок нет
          </Text>
        </Box>
    );
  }

  const handleNavigate = (uuid: string) => {
    navigate(`/block-instance/card?uuid=${uuid}`);
  };

  const renderRowContent = (title: string) => (
      <Group justify="space-between" wrap="nowrap">
        <Text lineClamp={1}>{title}</Text>
        <IconArrowUpRight size={16} stroke={1.5} />
      </Group>
  );

  return (
      <Box>

        {isMobile ? (
            <Stack spacing={4}>
              {referencingInstances.map((instance) => (
                  <UnstyledButton
                      key={instance.uuid}
                      onClick={() => handleNavigate(instance.uuid)}
                      sx={(theme) => ({
                        display: "block",
                        width: "100%",
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                        "&:hover": {
                          backgroundColor: theme.colors.gray[0],
                        },
                      })}
                  >
                    {renderRowContent(instance.title)}
                  </UnstyledButton>
              ))}
            </Stack>
        ) : (
            <Table highlightOnHover withBorder withColumnBorders>
              <tbody>
              {referencingInstances.map((instance) => (
                  <tr
                      key={instance.uuid}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleNavigate(instance.uuid)}
                  >
                    <td>{renderRowContent(instance.title)}</td>
                  </tr>
              ))}
              </tbody>
            </Table>
        )}
      </Box>
  );
};

