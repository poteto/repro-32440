import { createContext, useContext } from "react";
import { externalFunction } from "./Circular";
import { View, Text } from "react-native";

type MyContext = { datum: string };

export const myContext = createContext<MyContext | undefined>(undefined);

export function useMyHook() {
  const context = useContext(myContext);
  return context;
}

export function SomeComponent() {
  const _datum = externalFunction();
  return (
    <View>
      {/* @ts-ignore */}
      <Text>{_datum}</Text>
    </View>
  );
}
