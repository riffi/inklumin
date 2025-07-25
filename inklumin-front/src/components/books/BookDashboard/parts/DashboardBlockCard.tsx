import React from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { bookDb } from "@/entities/bookDb";
import { IBlock, IBlockStructureKind } from "@/entities/ConstructorEntities";
import { BlockInstanceRelationRepository } from "@/repository/BlockInstance/BlockInstanceRelationRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { getBlockTitle } from "@/utils/configUtils";

interface BlockCardProps {
  block: IBlock;
}

const MAX_BODY_LENGTH = 400;
const MAX_INSTANCE_COUNT = 5;
export const DashboardBlockCard = ({ block }: BlockCardProps) => {
  const navigate = useNavigate();

  const instances = useLiveQuery(() =>
    BlockInstanceRepository.getBlockInstances(bookDb, block.uuid)
  );

  const instanceUuid = instances?.[0]?.uuid;
  const parameters = useLiveQuery(async () => {
    if (!instanceUuid) return [];
    return BlockParameterInstanceRepository.getInstanceParams(bookDb, instanceUuid);
  }, [instanceUuid]);

  const allParametersEmpty =
    block.structureKind === IBlockStructureKind.single &&
    parameters?.every((param) => param.value === "" && !param.linkedBlockInstanceUuid);

  // Получаем HTML первого параметра
  const firstParamHtml = parameters?.[0]?.value || "";
  const shouldTruncate = firstParamHtml.length > MAX_BODY_LENGTH;
  const truncatedHtml = shouldTruncate
    ? `${firstParamHtml.slice(0, MAX_BODY_LENGTH)}...`
    : firstParamHtml;

  const handleNavigateToBlockManager = () => navigate(`/block-instance/manager?uuid=${block.uuid}`);

  const handleNavigateToInstanceCard = (uuid: string) => {
    navigate(`/block-instance/card?uuid=${uuid}`);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs" style={{ cursor: "pointer" }} onClick={handleNavigateToBlockManager}>
            <IconViewer icon={block?.icon} size={28} color="var(--mantine-color-blue-7)" />
            <Text fw={500} size="lg" truncate style={{ textTransform: "capitalize" }}>
              {getBlockTitle(block)}
            </Text>
            <ActionIcon variant="transparent" color="gray" onClick={handleNavigateToBlockManager}>
              <IconArrowRight size="1.2rem" />
            </ActionIcon>
          </Group>
          {allParametersEmpty && <Badge color="red">Нужно описать</Badge>}
        </Group>
        <Stack gap="xs">
          {block.description && (
            <Text
              size="sm"
              c="blue"
              fw={600}
              style={{ borderLeft: "3px solid #228be6", paddingLeft: 8 }}
            >
              {block.description}
            </Text>
          )}

          {/* Новый блок для отображения HTML параметра */}
          {block.structureKind === IBlockStructureKind.single && firstParamHtml && (
            <div>
              <div
                dangerouslySetInnerHTML={{ __html: truncatedHtml }}
                style={{
                  fontSize: "0.875rem",
                  color: "#666",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                }}
              />
              {shouldTruncate && (
                <Text size="xs" c="dimmed" mt={4}>
                  (текст обрезан, полная версия в редакторе)
                </Text>
              )}
            </div>
          )}

          {block.structureKind === IBlockStructureKind.multiple && (
            <>
              <Group gap={4}>
                <Text size="sm">Всего:</Text>
                <Badge variant="light" color="blue" radius="sm">
                  {instances?.length ?? 0}
                </Badge>
                {instances && instances.length > MAX_INSTANCE_COUNT && (
                  <Text size="sm" c="dimmed" ml="auto">
                    +{instances.length - MAX_INSTANCE_COUNT} ещё
                  </Text>
                )}
              </Group>

              <Stack gap={4}>
                {instances?.slice(0, MAX_INSTANCE_COUNT).map((instance) => (
                  <Text
                    key={instance.uuid}
                    size="sm"
                    c="dimmed"
                    style={{
                      padding: 4,
                      background: "rgba(0,0,0,0.02)",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                    onClick={() => handleNavigateToInstanceCard(instance.uuid)}
                    truncate
                  >
                    {instance.title}
                  </Text>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
