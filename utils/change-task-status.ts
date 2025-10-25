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
