import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { ArrowRightIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/stores/auth-provider";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export function OnboardScreen() {
  const [name, setName] = React.useState("");
  const { user, setUser } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user.name) {
      router.push("/task");
    }
  }, [router, user]);

  function onContinue() {
    setUser({ name });
    router.push("/task");
  }

  if (user.name) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <VStack className="w-full gap-4 items-center flex-1 justify-center">
        <Text className="text-4xl">Hi,</Text>
        <Text>What should i call you?</Text>
        <FormControl className="w-full">
          <Input variant="rounded" size="md">
            <InputField
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </Input>
        </FormControl>
      </VStack>
      <HStack className="justify-end">
        <Button variant="outline" onPress={onContinue}>
          <Icon as={ArrowRightIcon} />
          <Text>Continue</Text>
        </Button>
      </HStack>
    </SafeAreaView>
  );
}
