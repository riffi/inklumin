import { useState } from "react";
import { IconArrowUpRight, IconLink } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance, IBlockParameterInstance } from "@/entities/BookEntities";
import { IBlock, IBlockParameter } from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { generateUUID } from "@/utils/UUIDUtils";

export interface IReferencedInstanceEditorProps {
  instance: IBlockInstance;
  block: IBlock;
  referencingParam: IBlockParameter;
}
export const ReferencedInstanceEditor = (props: IReferencedInstanceEditorProps) => {
  const navigate = useNavigate();
  const { isMobile } = useMedia();

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

  const referencingBlock = useLiveQuery<IBlock>(async () => {
    return BlockRepository.getByUuid(bookDb, props.referencingParam.blockUuid);
  }, [props.block, props.instance, props.referencingParam]);

  const availableInstances = useLiveQuery(async () => {
    if (!referencingBlock)
      return [] as { instance: IBlockInstance; param?: IBlockParameterInstance }[];

    const [instances, params] = await Promise.all([
      bookDb.blockInstances.where("blockUuid").equals(referencingBlock.uuid).toArray(),
      bookDb.blockParameterInstances
        .where("blockParameterUuid")
        .equals(props.referencingParam.uuid)
        .toArray(),
    ]);

    const referencedUuids = params
      .filter((p) => p.linkedBlockInstanceUuid === props.instance.uuid)
      .map((p) => p.blockInstanceUuid);

    const unlinkedMap = new Map<string, IBlockParameterInstance>();
    params.forEach((p) => {
      if (!p.linkedBlockInstanceUuid && !unlinkedMap.has(p.blockInstanceUuid)) {
        unlinkedMap.set(p.blockInstanceUuid, p);
      }
    });

    return instances
      .filter((inst) => !referencedUuids.includes(inst.uuid))
      .map((inst) => ({ instance: inst, param: unlinkedMap.get(inst.uuid) }));
  }, [props.referencingParam, referencingBlock, props.instance]);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedInstanceUuid, setSelectedInstanceUuid] = useState<string>("");

  const handleNavigate = (uuid: string) => {
    navigate(`/block-instance/card?uuid=${uuid}`);
  };

  const handleLink = async () => {
    if (!selectedInstanceUuid) return;
    const option = availableInstances?.find((o) => o.instance.uuid === selectedInstanceUuid);
    if (!option) return;

    if (option.param) {
      await BlockParameterInstanceRepository.updateParameterInstance(bookDb, option.param.id!, {
        linkedBlockInstanceUuid: props.instance.uuid,
      });
    } else {
      const newParam: IBlockParameterInstance = {
        uuid: generateUUID(),
        blockInstanceUuid: selectedInstanceUuid,
        blockParameterUuid: props.referencingParam.uuid,
        blockParameterGroupUuid: props.referencingParam.groupUuid,
        value: "",
        linkedBlockInstanceUuid: props.instance.uuid,
      };
      await BlockParameterInstanceRepository.addParameterInstance(bookDb, newParam);
    }
    setLinkModalOpen(false);
    setSelectedInstanceUuid("");
  };

  const renderRowContent = (title: string) => (
    <Group justify="space-between" wrap="nowrap">
      <Text lineClamp={1}>{title}</Text>
      <IconArrowUpRight size={16} stroke={1.5} />
    </Group>
  );

  return (
    <Box>
      <Group justify="flex-start" mb="xs">
        <Button
          leftSection={<IconLink size={14} />}
          variant="light"
          onClick={() => setLinkModalOpen(true)}
          disabled={!availableInstances || availableInstances.length === 0}
        >
          {`Привязать ${referencingBlock?.titleForms?.accusative || ""}`}
        </Button>
      </Group>

      {isMobile ? (
        <Stack spacing={4}>
          {referencingInstances && referencingInstances.length > 0 ? (
            referencingInstances.map((instance) => (
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
            ))
          ) : (
            <Text c="dimmed" style={{ fontStyle: "italic" }}>
              Ссылок нет
            </Text>
          )}
        </Stack>
      ) : (
        <Table highlightOnHover withBorder withColumnBorders>
          <tbody>
            {referencingInstances && referencingInstances.length > 0 ? (
              referencingInstances.map((instance) => (
                <tr
                  key={instance.uuid}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNavigate(instance.uuid)}
                >
                  <td>{renderRowContent(instance.title)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td>
                  <Text c="dimmed" style={{ fontStyle: "italic" }}>
                    Ссылок нет
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal
        opened={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title={`Привязать ${referencingBlock?.titleForms?.accusative || ""}`}
        fullScreen={isMobile}
      >
        <Select
          data={
            availableInstances?.map((ap) => ({
              value: ap.instance.uuid,
              label: ap.instance.title,
            })) || []
          }
          value={selectedInstanceUuid}
          onChange={(v) => setSelectedInstanceUuid(v || "")}
          label={referencingBlock?.titleForms?.accusative}
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={handleLink} disabled={!selectedInstanceUuid}>
            Привязать
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};
