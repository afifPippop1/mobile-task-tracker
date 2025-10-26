import {
  loadTasksFromLocalstorage,
  saveTasksInLocalstorage,
} from "@/utils/storage";
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
  dueTime?: Date;
  notificationId?: string;
}

interface ITaskContext {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
}

const TaskContext = React.createContext<ITaskContext>({
  tasks: [],
  addTask: async () => {},
  removeTask: async () => {},
  updateTask: async () => {},
});

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    (async function () {
      const tasks = await loadTasksFromLocalstorage();
      setTasks(tasks);
    })();
    return () => setTasks([]);
  }, []);

  React.useEffect(() => {
    (async function () {
      await saveTasksInLocalstorage(tasks);
    })();
  }, [tasks]);

  async function addTask(task: Task) {
    setTasks((prevTasks) => [...prevTasks, task]);
  }

  async function removeTask(id: string) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }

  async function updateTask(task: Task) {
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
