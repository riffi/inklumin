// components/configurator/BlockEditForm/parts/ParamManager/ParamManager.tsx
import React, { useCallback, useEffect, useState } from "react";
import { IconSettings } from "@tabler/icons-react";
import { ActionIcon, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GroupsModal } from "@/components/configurator/BlockEditForm/parts/ParamManager/modal/GroupsModal/GroupsModal";
import { ParamEditModal } from "@/components/configurator/BlockEditForm/parts/ParamManager/modal/ParamEditModal/ParamEditModal";
import { ParamTable } from "@/components/configurator/BlockEditForm/parts/ParamManager/ParamTable/ParamTable";
import { useBlockParams } from "@/components/configurator/BlockEditForm/useBlockParams";
import { useDb } from "@/hooks/useDb";
import {
  IBlock,
  IBlockParameter,
  IBlockParameterGroup,
  IBlockRelation,
} from "@/entities/ConstructorEntities";

// Added IBlockParameterGroup, though not directly used in this file, it's good for context with paramGroupList

interface ParamManagerProps {
  blockUuid: string;
  bookUuid?: string;
  useTabs?: number;
  otherBlocks: IBlock[];
}

export const ParamManager = ({ blockUuid, bookUuid, useTabs, otherBlocks }: ParamManagerProps) => {
  const [currentGroupUuid, setCurrentGroupUuid] = useState<string>();
  const [isParamModalOpened, setIsParamModalOpened] = useState(false);
  const [isGroupsModalOpened, setIsGroupsModalOpened] = useState(false);
  const [currentParam, setCurrentParam] = useState<IBlockParameter>();

  const {
    paramGroupList,
    paramList,
    saveParamGroup,
    saveParam,
    deleteParam,
    moveGroupUp,
    moveGroupDown,
    updateGroupTitle,
    deleteGroup,
    moveParamUp,
    moveParamDown,
    loadPossibleValues,
    savePossibleValues,
  } = useBlockParams(blockUuid, bookUuid, currentGroupUuid);

  useEffect(() => {
    if (paramGroupList?.length > 0 && !currentGroupUuid) {
      setCurrentGroupUuid(paramGroupList?.[0].uuid);
    }
  }, [paramGroupList, currentGroupUuid]);

  const getInitialParamData = useCallback(
    (specificGroupUuidForTab?: string): IBlockParameter => {
      const targetGroupUuidForNewParam =
        useTabs === 1 ? specificGroupUuidForTab || currentGroupUuid : undefined;
      // paramList from the hook is filtered by currentGroupUuid if currentGroupUuid is set AND useTabs is NOT 1.
      // When useTabs IS 1, paramList contains ALL params for the block.
      // For calculating order number for a NEW param in a specific group,
      // we need to count existing params in THAT group.
      const paramsInTargetGroup =
        useTabs === 1
          ? paramList?.filter((p) => p.groupUuid === targetGroupUuidForNewParam) || []
          : paramList || []; // In non-tab mode, paramList is already filtered or contains all if no group context

      return {
        uuid: "",
        title: "",
        description: "",
        groupUuid: targetGroupUuidForNewParam,
        dataType: "string",
        orderNumber: paramsInTargetGroup.length,
        blockUuid: blockUuid, // Assign blockUuid from props
      };
    },
    [useTabs, currentGroupUuid, paramList, blockUuid]
  );

  const handleMoveParamToGroup = useCallback(
    async (paramUuid: string, targetGroupUuid: string) => {
      const db = useDb(bookUuid);
      const paramToMove = await db.blockParameters.get({ uuid: paramUuid });

      if (paramToMove) {
        const updatedParam = { ...paramToMove, groupUuid: targetGroupUuid };
        await saveParam(updatedParam); // saveParam из useBlockParams
        notifications.show({
          title: "Параметр перемещен",
          message: `Параметр "${paramToMove.title}" успешно перемещен.`,
          color: "green",
        });
      } else {
        notifications.show({
          title: "Ошибка",
          message: "Не удалось найти параметр для перемещения.",
          color: "red",
        });
      }
    },
    [bookUuid, saveParam]
  );

  const handleParamModalOpen = useCallback(
    (param?: IBlockParameter) => {
      setCurrentParam(param || getInitialParamData());
      setIsParamModalOpened(true);
    },
    [getInitialParamData]
  );

  const handleSaveGroup = useCallback(
    (newTitle: string) => {
      saveParamGroup({
        uuid: "",
        blockUuid,
        title: newTitle,
        description: "",
        orderNumber: paramGroupList?.length || 0,
      });
    },
    [saveParamGroup, blockUuid, paramGroupList]
  );

  const renderTabsContent = useCallback(
    () => (
      <Tabs
        value={currentGroupUuid}
        onChange={(value) => setCurrentGroupUuid(value || paramGroupList?.[0]?.uuid)}
      >
        <Tabs.List>
          {paramGroupList?.map((group) => (
            <Tabs.Tab value={group.uuid} key={group.uuid}>
              {group.title}
            </Tabs.Tab>
          ))}
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setIsGroupsModalOpened(true)}
            ml="auto"
            mr="sm"
          >
            <IconSettings size="1rem" />
          </ActionIcon>
        </Tabs.List>
        {paramGroupList?.map((group) => (
          <Tabs.Panel value={group.uuid} key={group.uuid}>
            <ParamTable
              params={paramList?.filter((p) => p.groupUuid === group.uuid) || []}
              otherBlocks={otherBlocks}
              onAddParam={() => handleParamModalOpen(getInitialParamData(group.uuid))}
              onEditParam={handleParamModalOpen}
              onDeleteParam={deleteParam}
              onMoveParamUp={moveParamUp}
              onMoveParamDown={moveParamDown}
              paramGroupList={paramGroupList}
              onMoveParam={handleMoveParamToGroup}
              showMoveButton={paramGroupList && paramGroupList.length > 1}
              currentGroupUuid={group.uuid}
              bookUuid={bookUuid}
              blockUuid={blockUuid}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    ),
    [
      currentGroupUuid,
      paramGroupList,
      paramList,
      otherBlocks,
      handleParamModalOpen,
      deleteParam,
      moveParamUp,
      moveParamDown,
      handleMoveParamToGroup,
      bookUuid,
      blockUuid,
      useTabs,
    ]
  );

  return (
    <>
      {useTabs === 1 ? (
        renderTabsContent()
      ) : (
        <ParamTable
          params={paramList || []}
          onAddParam={() => handleParamModalOpen(getInitialParamData())}
          onEditParam={handleParamModalOpen}
          onDeleteParam={deleteParam}
          onMoveParamUp={moveParamUp}
          onMoveParamDown={moveParamDown}
          otherBlocks={otherBlocks}
          bookUuid={bookUuid}
          blockUuid={blockUuid}
        />
      )}

      {isParamModalOpened && (
        <ParamEditModal
          isOpen={isParamModalOpened}
          onClose={() => setIsParamModalOpened(false)}
          onSave={(param) => {
            notifications.show({
              title: "Параметр",
              message: `Параметр "${param.title}" сохранён`,
            });
            saveParam(param);
            setIsParamModalOpened(false);
          }}
          initialData={currentParam}
          blockUuid={blockUuid}
          bookUuid={bookUuid}
          otherBlocks={otherBlocks}
          loadPossibleValues={loadPossibleValues}
          savePossibleValues={savePossibleValues}
        />
      )}

      <GroupsModal
        opened={isGroupsModalOpened}
        onClose={() => setIsGroupsModalOpened(false)}
        paramGroupList={paramGroupList || []}
        onSaveGroup={handleSaveGroup}
        onMoveGroupUp={moveGroupUp}
        onMoveGroupDown={moveGroupDown}
        onDeleteGroup={deleteGroup}
        onUpdateGroupTitle={updateGroupTitle}
      />
    </>
  );
};
