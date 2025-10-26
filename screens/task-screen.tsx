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
  Icon,
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
import { Task, TaskStatus, useTask } from "@/stores/task-provider";
import { changeTaskStatus, getTaskStatusColor } from "@/utils/task-status";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, FlatList, Platform, View } from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuid } from "uuid";

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

  function onShowModal() {
    setShowModal(true);
  }

  function onCloseModal() {
    setShowModal(false);
  }

  return (
    <SafeAreaView className="gap-8 flex-1 p-6">
      {tasks.length > 0 && (
        <FlatList
          data={tasks}
          renderItem={({ item }) => <TaskItem key={item.id} task={item} />}
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
    </SafeAreaView>
  );
}

function TaskItem({ task }: { task: Task }) {
  const { updateTask } = useTask();

  function onPress() {
    updateTask({ ...task, status: changeTaskStatus(task.status) });
  }

  return (
    <Card className="p-5 rounded-lg flex-row items-start">
      <View className="flex-1">
        <Heading size="md" className="mb-1">
          {task.title}
        </Heading>
        <HStack>
          {task.dueTime && (
            <Text>{dayjs(task.dueTime).format("DD-MM-YYYY HH:mm")}</Text>
          )}
        </HStack>
      </View>
      <Pressable onPress={onPress}>
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
  );
}

function TaskModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addTask } = useTask();
  const form = useForm<Task>({
    defaultValues: {
      id: uuid(),
      title: "",
      status: TaskStatus.TODO,
    },
  });

  const [dueTime, setDueTime] = React.useState(new Date());
  const [showPicker, setShowPicker] = React.useState(false);

  async function onSubmit(task: Task) {
    const taskWithDueTime = { ...task, dueTime };
    console.log(taskWithDueTime);
    addTask(taskWithDueTime);
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

      console.log("Now:", now, "Trigger Date:", triggerDate);

      if (Platform.OS === "ios" && !Device.isDevice) {
        Alert.alert(
          "Debug",
          `Notification scheduled for ${dayjs(triggerDate).format("HH:mm")}`
        );
      } else {
        await Notifications.scheduleNotificationAsync({
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
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log("Scheduled notifications:", scheduled);
    }
    handleClose();
  }

  function handleClose() {
    form.reset();
    setDueTime(new Date());
    setShowPicker(false);
    onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Task:</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText></FormControlLabelText>
            </FormControlLabel>
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
              Selected time: {dayjs(dueTime).format("DD-MM-YYYY HH:mm")}
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
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            className="mr-3"
            onPress={onClose}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button onPress={form.handleSubmit(onSubmit)}>
            <ButtonIcon as={AddIcon} />
            <ButtonText>Add</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
