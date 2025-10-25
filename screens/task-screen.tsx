import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fab, FabIcon } from "@/components/ui/fab";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import {
  AddIcon,
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
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { FlatList, View } from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuid } from "uuid";

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
  return (
    <Card className="p-5 rounded-lg">
      <Heading size="md" className="mb-1">
        {task.title}
      </Heading>
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

  function onSubmit(task: Task) {
    addTask(task);
    handleClose();
  }

  function handleClose() {
    form.reset();
    onClose();
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
