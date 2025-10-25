import { TaskStatus } from "@/stores/task-provider";

export function changeTaskStatus(status: string) {
  if (status === TaskStatus.TODO) {
    return TaskStatus.IN_PROGRESS;
  } else if (status === TaskStatus.IN_PROGRESS) {
    return TaskStatus.DONE;
  } else {
    return TaskStatus.TODO;
  }
}

export function getTaskStatusColor(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO:
      return "#9CA3AF";
    case TaskStatus.IN_PROGRESS:
      return "#3B82F6";
    case TaskStatus.DONE:
      return "#10B981";
  }
}
