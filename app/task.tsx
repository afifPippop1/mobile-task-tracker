import { TaskScreen } from "@/screens/task-screen";
import { TaskProvider } from "@/stores/task-provider";

export default function TaskRoute() {
  return (
    <TaskProvider>
      <TaskScreen />
    </TaskProvider>
  );
}
