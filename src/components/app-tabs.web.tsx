// import {
//   TabList,
//   TabListProps,
//   Tabs,
//   TabSlot,
//   TabTrigger,
//   TabTriggerSlotProps,
// } from "expo-router/ui";
// import { SymbolView } from "expo-symbols";
// import { Pressable, StyleSheet, useColorScheme, View } from "react-native";

// import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";

// import { ExternalLink } from "./external-link";
// import { ThemedText } from "./themed-text";
// import { ThemedView } from "./themed-view";

// export default function AppTabs() {
//   return (
//     <Tabs>
//       <TabSlot style={{ height: "100%" }} />
//       <TabList asChild>
//         <CustomTabList>
//           <TabTrigger name="home" href="/" asChild>
//             <TabButton>Home</TabButton>
//           </TabTrigger>
//           <TabTrigger name="explore" href="/explore" asChild>
//             <TabButton>Explore</TabButton>
//           </TabTrigger>
//         </CustomTabList>
//       </TabList>
//     </Tabs>
//   );
// }

// export function TabButton({
//   children,
//   isFocused,
//   ...props
// }: TabTriggerSlotProps) {
//   return (
//     <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
//       <ThemedView
//         type={isFocused ? "backgroundSelected" : "backgroundElement"}
//         style={styles.tabButtonView}
//       >
//         <ThemedText
//           type="small"
//           themeColor={isFocused ? "text" : "textSecondary"}
//         >
//           {children}
//         </ThemedText>
//       </ThemedView>
//     </Pressable>
//   );
// }

// export function CustomTabList(props: TabListProps) {
//   const scheme = useColorScheme();
//   const colors = Colors[scheme === "dark" ? "dark" : "light"];

//   return (
//     <View {...props} style={styles.tabListContainer}>
//       <ThemedView type="backgroundElement" style={styles.innerContainer}>
//         <ThemedText type="smallBold" style={styles.brandText}>
//           Expo Starter
//         </ThemedText>

//         {props.children}

//         <ExternalLink href="https://docs.expo.dev" asChild>
//           <Pressable style={styles.externalPressable}>
//             <ThemedText type="link">Docs</ThemedText>
//             <SymbolView
//               tintColor={colors.text}
//               name={{ ios: "arrow.up.right.square", web: "link" }}
//               size={12}
//             />
//           </Pressable>
//         </ExternalLink>
//       </ThemedView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   tabListContainer: {
//     position: "absolute",
//     width: "100%",
//     padding: Spacing.three,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//   },
//   innerContainer: {
//     paddingVertical: Spacing.two,
//     paddingHorizontal: Spacing.five,
//     borderRadius: Spacing.five,
//     flexDirection: "row",
//     alignItems: "center",
//     flexGrow: 1,
//     gap: Spacing.two,
//     maxWidth: MaxContentWidth,
//   },
//   brandText: {
//     marginRight: "auto",
//   },
//   pressed: {
//     opacity: 0.7,
//   },
//   tabButtonView: {
//     paddingVertical: Spacing.one,
//     paddingHorizontal: Spacing.three,
//     borderRadius: Spacing.three,
//   },
//   externalPressable: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: Spacing.one,
//     marginLeft: Spacing.three,
//   },
// });

import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { SymbolView } from "expo-symbols";
import React from "react";
import {
  Pressable,
  PressableStateCallbackType,
  useColorScheme,
} from "react-native";
import styled from "styled-components/native";

import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";

import { ExternalLink } from "./external-link";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  children: React.ReactNode;
  isFocused?: boolean;
};

// React.forwardRef를 사용하여 TabTrigger의 asChild가 전달하는 ref를 Pressable에 연결
export const TabButton = React.forwardRef<any, TabButtonProps>(
  ({ children, isFocused = false, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={({ pressed }: PressableStateCallbackType) => [
          pressed && { opacity: 0.7 },
        ]}
      >
        <TabButtonView isFocused={isFocused}>
          <ThemedText
            type="small"
            themeColor={isFocused ? "text" : "textSecondary"}
          >
            {children}
          </ThemedText>
        </TabButtonView>
      </Pressable>
    );
  },
);

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <TabListContainer {...props}>
      <InnerContainer type="backgroundElement">
        <BrandText type="smallBold">Expo Starter</BrandText>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <ExternalPressable>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: "arrow.up.right.square", web: "link" }}
              size={12}
            />
          </ExternalPressable>
        </ExternalLink>
      </InnerContainer>
    </TabListContainer>
  );
}

// Styled Components 정의
interface TabButtonViewProps {
  isFocused?: boolean;
}

const TabButtonView = styled(ThemedView).attrs<TabButtonViewProps>(
  ({ isFocused }) => ({
    type: isFocused ? "backgroundSelected" : "backgroundElement",
  }),
)<TabButtonViewProps>`
  padding-vertical: ${Spacing.one}px;
  padding-horizontal: ${Spacing.three}px;
  border-radius: ${Spacing.three}px;
`;

const TabListContainer = styled.View`
  position: absolute;
  width: 100%;
  padding: ${Spacing.three}px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const InnerContainer = styled(ThemedView)`
  padding-vertical: ${Spacing.two}px;
  padding-horizontal: ${Spacing.five}px;
  border-radius: ${Spacing.five}px;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  gap: ${Spacing.two}px;
  max-width: ${MaxContentWidth}px;
`;

const BrandText = styled(ThemedText)`
  margin-right: auto;
`;

const ExternalPressable = styled(Pressable)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${Spacing.one}px;
  margin-left: ${Spacing.three}px;
`;
