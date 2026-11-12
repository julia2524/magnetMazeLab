// import { SymbolView } from 'expo-symbols';
// import { PropsWithChildren, useState } from 'react';
// import { Pressable, StyleSheet } from 'react-native';
// import Animated, { FadeIn } from 'react-native-reanimated';

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Spacing } from '@/constants/theme';
// import { useTheme } from '@/hooks/use-theme';

// export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const theme = useTheme();

//   return (
//     <ThemedView>
//       <Pressable
//         style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
//         onPress={() => setIsOpen((value) => !value)}>
//         <ThemedView type="backgroundElement" style={styles.button}>
//           <SymbolView
//             name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
//             size={14}
//             weight="bold"
//             tintColor={theme.text}
//             style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
//           />
//         </ThemedView>

//         <ThemedText type="small">{title}</ThemedText>
//       </Pressable>
//       {isOpen && (
//         <Animated.View entering={FadeIn.duration(200)}>
//           <ThemedView type="backgroundElement" style={styles.content}>
//             {children}
//           </ThemedView>
//         </Animated.View>
//       )}
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   heading: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.two,
//   },
//   pressedHeading: {
//     opacity: 0.7,
//   },
//   button: {
//     width: Spacing.four,
//     height: Spacing.four,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     marginTop: Spacing.three,
//     borderRadius: Spacing.three,
//     marginLeft: Spacing.four,
//     padding: Spacing.four,
//   },
// });

import { SymbolView } from "expo-symbols";
import { PropsWithChildren, useState } from "react";
import { Pressable, PressableStateCallbackType } from "react-native"; // 1. PressableStateCallbackType 임포트
import Animated, { FadeIn } from "react-native-reanimated";
import styled from "styled-components/native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <ThemedView>
      <StyledPressable
        onPress={() => setIsOpen((value) => !value)}
        // 2. pressed 파라미터에 PressableStateCallbackType 타입 지정
        style={({ pressed }: PressableStateCallbackType) =>
          pressed && { opacity: 0.7 }
        }
      >
        <ButtonContainer type="backgroundElement">
          <SymbolView
            name={{
              ios: "chevron.right",
              android: "chevron_right",
              web: "chevron_right",
            }}
            size={14}
            weight="bold"
            tintColor={theme.text}
            style={{ transform: [{ rotate: isOpen ? "-90deg" : "90deg" }] }}
          />
        </ButtonContainer>

        <ThemedText type="small">{title}</ThemedText>
      </StyledPressable>

      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ContentContainer type="backgroundElement">
            {children}
          </ContentContainer>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const StyledPressable = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.two}px;
`;

const ButtonContainer = styled(ThemedView)`
  width: ${Spacing.four}px;
  height: ${Spacing.four}px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled(ThemedView)`
  margin-top: ${Spacing.three}px;
  border-radius: ${Spacing.three}px;
  margin-left: ${Spacing.four}px;
  padding: ${Spacing.four}px;
`;
