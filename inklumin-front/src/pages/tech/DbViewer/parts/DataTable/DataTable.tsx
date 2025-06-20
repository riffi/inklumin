import { useMemo, useState } from "react";
import { IconFilter, IconX } from "@tabler/icons-react";
import { ActionIcon, Badge, Box, Group, ScrollArea, Table, Text, Title } from "@mantine/core";
import { Filters } from "@/pages/tech/DbViewer";
import { DatabaseType, TableData, TableName } from "@/pages/tech/DbViewer/types";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";

interface DataTableProps {
  table: TableData;
  activeTab: DatabaseType;
  currentFilter?: { field: string; value: string };
  onValueClick: (key: string, value: string) => void;
  bookTables: TableData[];
  configTables: TableData[];
  onReverseRelationClick: (tableName: TableName, field: string, value: string) => void;
  filters: Filters;
  onAddFilter: (field: string, value: string) => void;
  onRemoveFilter: (field: string) => void;
  onClearAllFilters: () => void;
  onDeleteRecord: (tableName: string, id: number) => void;
  onUpdateRecord: (tableName: string, id: number, field: string, newValue: string) => void;
}

const PRIORITY_FIELDS = ["id", "uuid", "title"];
const isPriorityField = (key: string) => PRIORITY_FIELDS.includes(key);

export const DataTable = ({
  table,
  activeTab,
  onValueClick,
  bookTables,
  configTables,
  onReverseRelationClick,
  filters,
  onAddFilter,
  onRemoveFilter,
  onClearAllFilters,
  onDeleteRecord,
  onUpdateRecord,
}: DataTableProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const allKeys = Array.from(new Set(table.data.flatMap(Object.keys))).sort((a, b) => {
    const aIndex = PRIORITY_FIELDS.indexOf(a);
    const bIndex = PRIORITY_FIELDS.indexOf(b);

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Заменяем useMemo на прямой расчет для filteredData
  const filteredData = table.data.filter((item) =>
    Object.entries(filters).every(([field, value]) =>
      String(item[field]).toLowerCase().includes(value.toLowerCase())
    )
  );

  // Обновляем filterOptions без мемоизации
  const filterOptions = allKeys.reduce(
    (acc, key) => {
      acc[key] = [...new Set(table.data.map((item) => String(item[key])))].sort();
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <Box mb="xl" p="lg" bg="white">
      <HeaderSection
        tableName={table.name}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearAllFilters={onClearAllFilters}
        filters={filters}
        onRemoveFilter={onRemoveFilter}
      />

      <ScrollArea>
        <Table highlightOnHover withColumnBorders withTableBorder tableLayout="auto">
          <TableHeader
            keys={allKeys}
            isPriorityField={isPriorityField}
            filters={filters}
            onAddFilter={onAddFilter}
            onRemoveFilter={onRemoveFilter}
            filterOptions={filterOptions}
            showFilters={showFilters}
          />
          <Table.Tbody>
            {filteredData.map((item, index) => (
              <TableRow
                key={`${table.name}-row-${index}`}
                item={item}
                allKeys={allKeys}
                table={table}
                activeTab={activeTab}
                bookTables={bookTables}
                configTables={configTables}
                isPriorityField={isPriorityField}
                onValueClick={onValueClick}
                onReverseRelationClick={onReverseRelationClick}
                showFilters={showFilters}
                onAddFilter={onAddFilter}
                onDeleteRecord={onDeleteRecord}
                onUpdateRecord={onUpdateRecord}
              />
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  );
};

const HeaderSection = ({
  tableName,
  showFilters,
  onToggleFilters,
  onClearAllFilters,
  filters,
  onRemoveFilter,
}: {
  tableName: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearAllFilters: () => void;
  filters: Filters;
  onRemoveFilter: (field: string) => void;
}) => (
  <>
    <Group justify="space-between" mb="sm">
      <Title order={3}>{tableName}</Title>
      <Group gap="xs">
        <ActionIcon variant="subtle" color="blue" onClick={onToggleFilters}>
          <IconFilter size={18} />
        </ActionIcon>
        <ActionIcon variant="subtle" color="red" onClick={onClearAllFilters}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
    </Group>

    {showFilters && Object.keys(filters).length > 0 && (
      <ActiveFilters filters={filters} onRemoveFilter={onRemoveFilter} />
    )}
  </>
);

const ActiveFilters = ({
  filters,
  onRemoveFilter,
}: {
  filters: Filters;
  onRemoveFilter: (field: string) => void;
}) => (
  <Group gap="xs" mb="sm" align="center">
    <Text size="sm" c="dimmed">
      Active filters:
    </Text>
    {Object.entries(filters).map(([field, value]) => (
      <Badge
        key={field}
        variant="outline"
        rightSection={
          <ActionIcon size="xs" color="red" onClick={() => onRemoveFilter(field)}>
            <IconX size={10} />
          </ActionIcon>
        }
      >
        {field}: {value}
      </Badge>
    ))}
  </Group>
);
