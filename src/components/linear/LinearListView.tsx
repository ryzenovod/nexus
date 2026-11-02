import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NexusTask, Assignee } from '../../types/nexus';
import { LinearIssueRow } from './LinearIssueRow';

interface LinearListViewProps {
  tasks: NexusTask[];
  selectedAssignee: Assignee;
  selectedTaskId: string | null;
  onToggleTask: (id: string) => void;
  onSelectTask: (task: NexusTask) => void;
}

interface GroupDefinition {
  id: string;
  title: string;
  matcher: (t: NexusTask) => boolean;
}

const isHubPlaceholder = (t: NexusTask): boolean => {
  const title = (t.title || '').toLowerCase().trim();
  return ['ванная', 'балкон', 'комната', 'кухня', 'доп.', 'дополнительно', 'прихожая'].includes(title);
};

export const LinearListView: React.FC<LinearListViewProps> = ({
  tasks,
  selectedAssignee,
  selectedTaskId,
  onToggleTask,
  onSelectTask,
}) => {
  // Collapsed state for accordion groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Filter tasks by assignee
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (isHubPlaceholder(t)) return false;
      if (selectedAssignee !== 'all' && t.assignee !== selectedAssignee) return false;
      return true;
    });
  }, [tasks, selectedAssignee]);

  // Define 6 exact Linear groups
  const groups: GroupDefinition[] = useMemo(
    () => [
      {
        id: 'urgent-communal',
        title: 'Срочно & ЖКХ Москвы',
        matcher: (t) => {
          const lower = (t.title || '').toLowerCase();
          return Boolean(
            t.isOverdue ||
            t.bracketColor === 'critical' ||
            lower.includes('коммунальн') ||
            lower.includes('жкх') ||
            lower.includes('домиленд') ||
            lower.includes('мосэнерго') ||
            t.tags?.includes('жкх') ||
            t.id === 'task-hub-communal'
          );
        },
      },
      {
        id: 'bathroom',
        title: 'Ванная & Сантехника',
        matcher: (t) => {
          const lower = (t.title || '').toLowerCase();
          return Boolean(
            t.room === 'Ванная' ||
            lower.includes('ванн') ||
            lower.includes('душ') ||
            lower.includes('сантехник') ||
            t.tags?.includes('ванная')
          );
        },
      },
      {
        id: 'kitchen',
        title: 'Кухня & Быт',
        matcher: (t) => {
          const lower = (t.title || '').toLowerCase();
          return Boolean(
            t.room === 'Кухня' ||
            lower.includes('кухн') ||
            lower.includes('мойк') ||
            lower.includes('посуд') ||
            t.tags?.includes('кухня')
          );
        },
      },
      {
        id: 'room-balcony',
        title: 'Комната & Балкон',
        matcher: (t) => {
          const lower = (t.title || '').toLowerCase();
          return Boolean(
            t.room === 'Комната' ||
            t.room === 'Балкон' ||
            t.room === 'Коридор' ||
            lower.includes('комнат') ||
            lower.includes('балкон') ||
            t.tags?.includes('комната') ||
            t.tags?.includes('балкон')
          );
        },
      },
      {
        id: 'wishlist-purchases',
        title: 'Покупки под вопросом (Вишлист)',
        matcher: (t) => {
          const lower = (t.title || '').toLowerCase();
          return Boolean(
            t.category === 'Покупки' ||
            t.bracketColor === 'neutral' ||
            lower.includes('?') ||
            lower.includes('купить') ||
            t.tags?.includes('покупки') ||
            t.tags?.includes('вишлист')
          );
        },
      },
      {
        id: 'study-work',
        title: 'ВШЭ, РУДН & Я-Профессионал',
        matcher: (t) => {
          const lower = (t.title || '').toLowerCase();
          return Boolean(
            t.category === 'ВШЭ' ||
            t.category === 'РУДН' ||
            t.category === 'Я-Профи' ||
            t.category === 'Работа' ||
            lower.includes('вшэ') ||
            lower.includes('рудн') ||
            lower.includes('япрофи') ||
            lower.includes('openmap') ||
            t.tags?.includes('вшэ') ||
            t.tags?.includes('рудн') ||
            t.tags?.includes('япрофи')
          );
        },
      },
    ],
    []
  );

  // Partition tasks so each task appears once in the best matching group
  const groupedTasks = useMemo(() => {
    const assignedIds = new Set<string>();
    const result: { group: GroupDefinition; items: NexusTask[] }[] = [];

    // Prioritized placement
    for (const group of groups) {
      const items = filteredTasks.filter((t) => {
        if (assignedIds.has(t.id)) return false;
        if (group.matcher(t)) {
          assignedIds.add(t.id);
          return true;
        }
        return false;
      });
      result.push({ group, items });
    }

    // Remaining tasks in General
    const remaining = filteredTasks.filter((t) => !assignedIds.has(t.id));
    if (remaining.length > 0) {
      result.push({
        group: {
          id: 'general',
          title: 'Остальные задачи',
          matcher: () => true,
        },
        items: remaining,
      });
    }

    return result;
  }, [filteredTasks, groups]);

  let globalIndex = 0;

  return (
    <div className="flex-1 overflow-y-auto select-none [scrollbar-width:thin] bg-[#0f1014]">
      {groupedTasks.map(({ group, items }) => {
        if (items.length === 0) return null;
        const isCollapsed = Boolean(collapsedGroups[group.id]);

        return (
          <div key={group.id} className="border-b border-[#1c1d24]">
            {/* Linear Section Header */}
            <div
              onClick={() => toggleGroup(group.id)}
              className="h-[34px] px-4 bg-[#131419] border-y border-[#1c1d24] flex items-center justify-between cursor-pointer hover:bg-[#181920] transition-colors"
            >
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#ededef]">
                {isCollapsed ? (
                  <ChevronRight size={13} className="text-[#8a8f98]" />
                ) : (
                  <ChevronDown size={13} className="text-[#8a8f98]" />
                )}
                <span>{group.title}</span>
                <span className="text-[11px] font-mono text-[#5e636e] bg-[#1a1b22] px-1.5 py-0.5 rounded">
                  {items.length}
                </span>
              </div>
            </div>

            {/* Rows list */}
            {!isCollapsed && (
              <div>
                {items.map((task) => {
                  const currentIndex = globalIndex++;
                  const isSelected = selectedTaskId === task.id;

                  return (
                    <LinearIssueRow
                      key={task.id}
                      task={task}
                      index={currentIndex}
                      isSelected={isSelected}
                      onToggle={onToggleTask}
                      onClick={onSelectTask}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filteredTasks.length === 0 && (
        <div className="py-20 text-center text-[#5e636e] text-[13px]">
          Нет задач по выбранным критериям
        </div>
      )}
    </div>
  );
};
