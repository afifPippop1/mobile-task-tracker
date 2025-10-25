import React from "react";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

interface ITaskContext {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  updateTask: (task: Task) => void;
}

const TaskContext = React.createContext<ITaskContext>({
  tasks: [],
  addTask: () => {},
  removeTask: () => {},
  updateTask: () => {},
});

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>([]);

  function addTask(task: Task) {
    setTasks((prevTasks) => [...prevTasks, task]);
  }

  function removeTask(id: string) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }

  function updateTask(task: Task) {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === task.id ? task : t))
    );
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, removeTask, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const ctx = React.useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return ctx;
}
