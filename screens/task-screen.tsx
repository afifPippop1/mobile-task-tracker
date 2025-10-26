import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fab, FabIcon } from "@/components/ui/fab";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  AddIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  EditIcon,
  Icon,
  SearchIcon,
} from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Pressable } from "@/components/ui/pressable";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/stores/auth-provider";
import { Task, TaskStatus, useTask } from "@/stores/task-provider";
import { changeTaskStatus, getTaskStatusColor } from "@/utils/task-status";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, SectionList, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuid } from "uuid";

dayjs.extend(relativeTime);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function TaskScreen() {
  const { tasks } = useTask();
  const [showModal, setShowModal] = React.useState(false);
  const [query, setQuery] = React.useState("");

  function onShowModal() {
    setShowModal(true);
  }

  function onCloseModal() {
    setShowModal(false);
  }
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => task.title.toLowerCase().includes(query));
  }, [tasks, query]);

  const sections = React.useMemo(() => {
    return Object.values(TaskStatus).map((status) => ({
      title: status,
      data: filteredTasks.filter((task) => task.status === status),
    }));
  }, [filteredTasks]);

  return (
    <SafeAreaView className="flex-1">
      <Header onSearchChange={setQuery} searchQuery={query} />
      <View className="gap-8 flex-1 px-4">
        {tasks.length > 0 && (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TaskItem task={item} />}
            renderSectionHeader={({ section: { title } }) => (
              <Heading size="sm" className="mt-4 mb-2 bg-secondary-100 py-4">
                {title}
              </Heading>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
        {!tasks.length && (
          <View className="flex-1 items-center justify-center">
            <VStack>
              <Text>You have no tasks</Text>
              <Button variant="outline" onPress={onShowModal}>
                <Icon as={AddIcon} />
                <Text>Add task</Text>
              </Button>
            </VStack>
          </View>
        )}
        {tasks.length > 0 && (
          <Fab size="lg" placement="bottom right" onPress={onShowModal}>
            <FabIcon as={AddIcon} />
          </Fab>
        )}
        <TaskModal isOpen={showModal} onClose={onCloseModal} />
      </View>
    </SafeAreaView>
  );
}

function TaskItem({ task }: { task: Task }) {
  const { updateTask, removeTask } = useTask();
  const [showModal, setShowModal] = React.useState(false);

  async function onChangeStatus() {
    await updateTask({ ...task, status: changeTaskStatus(task.status) });
  }

  async function onMarkDone() {
    await updateTask({ ...task, status: TaskStatus.DONE });
  }

  function onPressCard() {
    setShowModal(true);
  }

  async function onDelete() {
    await removeTask(task.id);
  }

  return (
    <Swipeable
      renderLeftActions={() => (
        <Button
          variant="solid"
          action="positive"
          onPress={onMarkDone}
          className="h-full justify-center rounded-none"
        >
          <Icon as={CheckIcon} />
        </Button>
      )}
      renderRightActions={() => (
        <View className="justify-center">
          <Button
            variant="solid"
            action="negative"
            onPress={onDelete}
            className="h-full justify-center rounded-none"
          >
            <Icon as={CloseIcon} />
          </Button>
        </View>
      )}
    >
      <Pressable onPress={onPressCard}>
        <Card
          className="p-5 rounded-lg flex-row items-start"
          style={{ marginLeft: 8 }}
        >
          <View className="flex-1">
            <Heading size="md" className="mb-1">
              {task.title}
            </Heading>
            <HStack>
              {task.dueTime && <Text>Notify {dayjs().from(task.dueTime)}</Text>}
            </HStack>
          </View>
          <Pressable onPress={onChangeStatus}>
            <Badge
              size="lg"
              variant="solid"
              action="muted"
              style={{ backgroundColor: getTaskStatusColor(task.status) }}
            >
              <BadgeText>{task.status}</BadgeText>
              <BadgeIcon as={CheckIcon} className="ml-2" />
            </Badge>
          </Pressable>
        </Card>
        <TaskModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          task={task}
        />
      </Pressable>
    </Swipeable>
  );
}

function TaskModal(props: {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
}) {
  const { addTask, updateTask } = useTask();
  const form = useForm<Task>({
    defaultValues: props.task ?? {
      id: "",
      title: "",
      status: TaskStatus.TODO,
    },
  });

  const [dueTime, setDueTime] = React.useState(
    props.task?.dueTime || new Date()
  );
  const [showPicker, setShowPicker] = React.useState(false);

  React.useEffect(() => {
    setDueTime(props.task?.dueTime || new Date());
  }, [props.task?.dueTime]);

  async function onSubmit(task: Task) {
    let notificatoionId = "";
    if (dueTime) {
      const now = new Date();
      const triggerDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        dueTime.getHours(),
        dueTime.getMinutes(),
        0
      );

      // If the selected time has already passed today, schedule for tomorrow
      if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      if (Platform.OS === "ios" && !Device.isDevice) {
        Alert.alert(
          "Debug",
          `Notification scheduled for ${dayjs(triggerDate).format("HH:mm")}`
        );
      } else {
        notificatoionId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Task Reminder: ${task.title}`,
            body: task.title,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
        console.log("Notification scheduled for:", triggerDate);
      }
      // Log scheduled notifications for debugging
      // const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      // console.log("Scheduled notifications:", scheduled);
    }

    const taskWithDueTime = { ...task, dueTime, notificatoionId };
    if (props.task) {
      if (props.task.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          props.task.notificationId
        );
      }
      await updateTask(taskWithDueTime);
    } else {
      await addTask({ ...taskWithDueTime, id: uuid() });
    }
    handleClose();
  }

  function handleClose() {
    form.reset();
    setDueTime(new Date());
    setShowPicker(false);
    props.onClose();
  }

  function showTimePicker() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dueTime,
        onChange: (event, selectedDate) => {
          if (selectedDate) {
            setDueTime(selectedDate);
          }
        },
        mode: "time",
        is24Hour: true,
      });
    } else if (Platform.OS === "ios") {
      setShowPicker(true);
    }
  }

  return (
    <Modal isOpen={props.isOpen} onClose={handleClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Task:</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack className="gap-6">
            <FormControl>
              <Controller
                control={form.control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoFocus
                      placeholder="Task name"
                    />
                  </Input>
                )}
                name="title"
              />
            </FormControl>
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Status:</FormControlLabelText>
              </FormControlLabel>

              <Controller
                control={form.control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Select
                    selectedValue={value}
                    onValueChange={onChange}
                    onBlur={onBlur}
                  >
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput
                        placeholder="Select option"
                        className="w-[90%]"
                      />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {Object.entries(TaskStatus).map(([key, value]) => (
                          <SelectItem key={key} label={value} value={key} />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
                name="status"
              />
            </FormControl>
            <Pressable onPress={showTimePicker}>
              <Text>
                Remind me at: {dayjs(dueTime).format("DD-MM-YYYY HH:mm")}
              </Text>
            </Pressable>
            {Platform.OS === "ios" && showPicker && (
              <DateTimePicker
                value={dueTime}
                mode="datetime"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setDueTime(selectedDate);
                  }
                  setShowPicker(false);
                }}
              />
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            className="mr-3"
            onPress={handleClose}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button onPress={form.handleSubmit(onSubmit)}>
            <ButtonIcon as={props.task ? EditIcon : AddIcon} />
            <ButtonText>{props.task ? "Edit" : "Add"}</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function Header({
  onSearchChange,
  searchQuery,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = React.useState(false);

  async function reset() {
    await logout();
    router.push("/");
  }

  return (
    <HStack className="justify-between items-start px-4 py-3">
      {searchOpen ? (
        <HStack className="flex-1 items-center space-x-2">
          <Input className="flex-1">
            <InputField
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus
            />
          </Input>
          <Pressable onPress={() => setSearchOpen(false)} className="p-2">
            <Icon as={SearchIcon} />
          </Pressable>
        </HStack>
      ) : (
        <>
          <VStack>
            <Text className="font-bold">Hi, {user.name}.</Text>
            <Text>Here&apos;s your tasks:</Text>
          </VStack>
          <HStack>
            {/* <Pressable onPress={reset} className="p-2">
              <Icon as={SearchIcon} />
            </Pressable> */}
            <Pressable onPress={() => setSearchOpen(true)} className="p-2">
              <Icon as={SearchIcon} />
            </Pressable>
          </HStack>
        </>
      )}
    </HStack>
  );
}
