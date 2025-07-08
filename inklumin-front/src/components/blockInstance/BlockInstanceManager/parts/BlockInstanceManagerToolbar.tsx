import {
  IconCalendar,
  IconFilter,
  IconFilterOff,
  IconPlus,
  IconSearch,
  IconSortAZ,
  IconX,
} from "@tabler/icons-react";
import { ActionIcon, Button, Group, SegmentedControl, TextInput } from "@mantine/core";
import { IBlockParameter } from "@/entities/ConstructorEntities";
import { BlockInstanceSortType } from "@/stores/uiSettingsStore/uiSettingsStore";

interface IManagerToolbarProps {
  titleSearchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  isMobile: boolean;
  sortType: BlockInstanceSortType;
  onChangeSort: (value: BlockInstanceSortType) => void;
  filtersVisible: boolean;
  hasFilters: boolean;
  displayedParameters?: IBlockParameter[];
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

/**
 * Панель управления списком экземпляров
 */
export const BlockInstanceManagerToolbar = ({
  titleSearchQuery,
  onSearchChange,
  onAddClick,
  isMobile,
  sortType,
  onChangeSort,
  filtersVisible,
  hasFilters,
  displayedParameters,
  onToggleFilters,
  onClearFilters,
}: IManagerToolbarProps) => {
  return (
    <Group justify="space-between" mb="md" px={"sm"}>
      {!isMobile && (
        <Button
          onClick={onAddClick}
          leftSection={<IconPlus size="1rem" />}
          size="sm"
          variant="light"
        >
          Добавить
        </Button>
      )}

      <TextInput
        placeholder="Поиск по названию..."
        value={titleSearchQuery}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        icon={<IconSearch size="1rem" />}
        rightSection={
          titleSearchQuery ? (
            <ActionIcon onClick={() => onSearchChange("")} title="Очистить поиск">
              <IconX size="1rem" />
            </ActionIcon>
          ) : null
        }
        style={{ flexGrow: 1, marginRight: "10px" }}
      />

      {isMobile ? (
        displayedParameters?.length > 0 && (
          <Group>
            <ActionIcon onClick={onToggleFilters} variant={filtersVisible ? "filled" : "default"}>
              <IconFilter size="1rem" />
            </ActionIcon>
            {hasFilters && (
              <ActionIcon onClick={onClearFilters} variant={"default"}>
                <IconFilterOff size="1rem" />
              </ActionIcon>
            )}
          </Group>
        )
      ) : (
        <Group>
          <SegmentedControl
            value={sortType}
            onChange={(value) => onChangeSort(value as BlockInstanceSortType)}
            data={[
              { value: "date", label: <IconCalendar size="1rem" />, title: "Сортировка по дате" },
              {
                value: "title",
                label: <IconSortAZ size="1rem" />,
                title: "Сортировка по алфавиту",
              },
            ]}
          />
          {displayedParameters?.length > 0 && (
            <>
              <ActionIcon onClick={onToggleFilters} variant={filtersVisible ? "filled" : "default"}>
                <IconFilter size="1rem" />
              </ActionIcon>
              {hasFilters && (
                <ActionIcon onClick={onClearFilters} variant={"default"}>
                  <IconFilterOff size="1rem" />
                </ActionIcon>
              )}
            </>
          )}
        </Group>
      )}
    </Group>
  );
};
