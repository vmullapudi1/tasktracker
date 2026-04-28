import { useMemo, useState } from 'react';
import { addDays, fmtDateKey, fmtTime, startOfWeek, uid } from '../../data/helpers';
import type { Block } from '../../data/types';
import type { Rep } from '../../store/replicache';
import { useBlocks, useProjects, useTodos } from '../../store/subscriptions';
import { Btn } from '../../ui/Btn';
import { HOUR_END, HOUR_HEIGHT, HOUR_START } from './constants';
import { DayColumn, type DragState } from './DayColumn';
import { NowIndicator } from './NowIndicator';
import { BlockPopover, type PopoverState } from './BlockPopover';
import { TodosCard } from '../Dashboard/TodosCard';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const left = `${MONTH_SHORT[monday.getMonth()]} ${monday.getDate()}`;
  const right = `${MONTH_SHORT[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;
  return `${left} – ${right}`;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarTab({ rep }: { rep: Rep | null }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const monday = addDays(startOfWeek(new Date()), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayKey = fmtDateKey(new Date());

  const projects = useProjects(rep);
  const allBlocks = useBlocks(rep);
  const todos = useTodos(rep);
  const blocksByDay = useMemo(() => {
    const m = new Map<string, typeof allBlocks>();
    for (const b of allBlocks) {
      const arr = m.get(b.date) ?? [];
      arr.push(b);
      m.set(b.date, arr);
    }
    return m;
  }, [allBlocks]);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const handleCreateBlock = ({
    dateKey,
    startMin,
    endMin,
    clientX,
    clientY,
  }: {
    dateKey: string;
    startMin: number;
    endMin: number;
    clientX: number;
    clientY: number;
  }) => {
    const defaultProject = projects.find((p) => p.active) ?? projects[0];
    if (!defaultProject) return;
    const newBlock: Block = {
      id: uid(),
      date: dateKey,
      start: startMin,
      end: endMin,
      title: '',
      projectId: defaultProject.id,
    };
    setPopover({ block: newBlock, isNew: true, anchor: { x: clientX, y: clientY } });
  };

  const savePopover = (patch: Pick<Block, 'title' | 'projectId' | 'start' | 'end'>) => {
    if (!popover || !rep) return;
    if (popover.isNew) {
      void rep.mutate.addBlock({ ...popover.block, ...patch });
    } else {
      void rep.mutate.updateBlock({ id: popover.block.id, patch });
    }
    setPopover(null);
  };

  const deletePopover = () => {
    if (!popover || !rep || popover.isNew) return;
    void rep.mutate.deleteBlock({ id: popover.block.id });
    setPopover(null);
  };

  const handleDropTodo = ({
    todoId,
    dateKey,
    startMin,
  }: {
    todoId: string;
    dateKey: string;
    startMin: number;
  }) => {
    if (!rep) return;
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    const dur = 60;
    const block: Block = {
      id: uid(),
      date: dateKey,
      start: startMin,
      end: Math.min(HOUR_END * 60, startMin + dur),
      title: todo.title,
      projectId: todo.projectId,
    };
    void rep.mutate.scheduleTodo({ todoId, block });
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 20 }}>
      {/* Main Calendar View */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          flex: 1,
          minWidth: 0,
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 22,
              fontWeight: 500,
              margin: 0,
              color: 'var(--ink)',
            }}
          >
            {fmtWeekRange(monday)}
          </h2>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              style={{
                appearance: 'none',
                border: '1px solid var(--accent)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 10,
                color: 'var(--accent)',
                fontFamily: 'var(--mono)',
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              jump to today
            </button>
          )}

        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn onClick={() => setWeekOffset((w) => w - 1)}>← prev</Btn>
          <Btn onClick={() => setWeekOffset((w) => w + 1)}>next →</Btn>
        </div>
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: 'var(--ink-3)',
          padding: '0 4px',
          display: 'flex',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <span>
          <Kbd>drag</Kbd> a slot to create a block
        </span>
        <span>
          <Kbd>drop</Kbd> a todo from the sidebar to schedule it
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(7, 1fr)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div />
        {days.map((d) => {
          const isToday = fmtDateKey(d) === todayKey;
          return (
            <div
              key={d.toISOString()}
              style={{
                padding: '6px 10px 10px',
                textAlign: 'left',
                borderLeft: '1px solid var(--rule)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--mono)',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {WEEKDAY_SHORT[d.getDay()]}
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 22,
                  fontWeight: 500,
                  color: isToday ? 'var(--accent)' : 'var(--ink)',
                  lineHeight: 1.1,
                }}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(7, 1fr)',
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid var(--rule)',
          borderRadius: 8,
          background: 'var(--paper)',
        }}
      >
        <div style={{ borderRight: '1px solid var(--rule)', position: 'relative' }}>
          {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
            <div
              key={i}
              style={{
                height: HOUR_HEIGHT,
                padding: '4px 6px 0 0',
                textAlign: 'right',
                fontSize: 10,
                fontFamily: 'var(--mono)',
                color: 'var(--ink-3)',
                borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
              }}
            >
              {fmtTime((HOUR_START + i) * 60)}
            </div>
          ))}
        </div>
        {days.map((d, di) => {
          const dateKey = fmtDateKey(d);
          return (
            <DayColumn
              key={d.toISOString()}
              date={d}
              dateKey={dateKey}
              dayIdx={di}
              blocks={blocksByDay.get(dateKey) ?? []}
              projects={projects}
              drag={drag}
              setDrag={setDrag}
              onBlockClick={(block, e) =>
                setPopover({ block, isNew: false, anchor: { x: e.clientX, y: e.clientY } })
              }
              onCreateBlock={handleCreateBlock}
              onDropTodo={handleDropTodo}
            />
          );
        })}
        <NowIndicator monday={monday} />
      </div>
    </div>

    {/* Todo Sidebar */}
    <div
      style={{
        width: 320,
        borderLeft: '1px solid var(--rule)',
        paddingLeft: 20,
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <TodosCard rep={rep} todos={todos} projects={projects} />
    </div>

    {popover && (
        <BlockPopover
          state={popover}
          projects={projects}
          onClose={() => setPopover(null)}
          onSave={savePopover}
          onDelete={popover.isNew ? undefined : deletePopover}
        />
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        padding: '2px 5px',
        background: 'var(--surface-2)',
        borderRadius: 3,
        marginRight: 4,
      }}
    >
      {children}
    </span>
  );
}
