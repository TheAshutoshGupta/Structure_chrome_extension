import React, { useState, useEffect } from 'react';
import { Plus, X, LayoutGrid, Loader2 } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const STORAGE_KEY = 'kanban-columns';

const defaultColumns: Column[] = [
  { id: '1', title: 'To Do', tasks: [] },
  { id: '2', title: 'In Progress', tasks: [] },
  { id: '3', title: 'Done', tasks: [] },
];

function App() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultColumns;
  });

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('1');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate network delay for smoother UX
    await new Promise(resolve => setTimeout(resolve, 500));

    setColumns(columns.map(col => {
      if (col.id === selectedColumn) {
        return {
          ...col,
          tasks: [...col.tasks, {
            id: Date.now().toString(),
            title: newTaskTitle,
            description: newTaskDescription
          }]
        };
      }
      return col;
    }));

    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsSubmitting(false);
    setIsAddingTask(false);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, fromColumn: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('fromColumn', fromColumn);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setIsDraggingOver(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setIsDraggingOver(columnId);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(null);
  };

  const handleDrop = (e: React.DragEvent, toColumn: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromColumn = e.dataTransfer.getData('fromColumn');

    if (fromColumn === toColumn) return;

    const task = columns.find(col => col.id === fromColumn)?.tasks.find(t => t.id === taskId);
    if (!task) return;

    setColumns(columns.map(col => {
      if (col.id === fromColumn) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== taskId)
        };
      }
      if (col.id === toColumn) {
        return {
          ...col,
          tasks: [...col.tasks, task]
        };
      }
      return col;
    }));
    setIsDraggingOver(null);
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== taskId)
        };
      }
      return col;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-[#1A1A1A]/50 p-6 rounded-2xl border border-[#2A2A2A] backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <LayoutGrid className="text-blue-500" size={28} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Structure
            </h1>
          </div>
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
            <span className="hidden md:inline font-medium">Add Task</span>
          </button>
        </div>

        {isAddingTask && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div 
              className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md border border-[#2A2A2A] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Add New Task
                </h2>
                <button 
                  onClick={() => setIsAddingTask(false)}
                  className="hover:bg-[#2A2A2A] p-2 rounded-lg transition-colors"
                >
                  <X className="text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="Enter task title..."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none placeholder-gray-500"
                    placeholder="Enter task description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Column
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {columns.map(column => (
                      <option key={column.id} value={column.id}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddTask}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Adding Task...</span>
                    </>
                  ) : (
                    'Add Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {columns.map(column => (
            <div
              key={column.id}
              className={`bg-[#1A1A1A]/50 rounded-2xl p-5 border ${
                isDraggingOver === column.id
                  ? 'border-blue-500/50 bg-[#1A1A1A]/80'
                  : 'border-[#2A2A2A]'
              } min-h-[200px] backdrop-blur-sm transition-colors duration-200`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center gap-3 mb-4 px-2">
                <h2 className="font-semibold text-gray-300">{column.title}</h2>
                <div className="text-sm px-2 py-1 bg-[#2A2A2A] rounded-full text-gray-400">
                  {column.tasks.length}
                </div>
              </div>
              
              <div className="space-y-3">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-[#2A2A2A]/50 p-4 rounded-xl cursor-move group relative border border-[#3A3A3A] hover:border-blue-500/50 transition-all duration-200 ${
                      draggingTaskId === task.id ? 'opacity-50 scale-95' : ''
                    } hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm`}
                  >
                    <div className="font-medium text-white mb-2">{task.title}</div>
                    <div className="text-sm text-gray-400">{task.description}</div>
                    <button
                      onClick={() => handleDeleteTask(column.id, task.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#3A3A3A] p-1.5 rounded-lg"
                    >
                      <X size={16} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;