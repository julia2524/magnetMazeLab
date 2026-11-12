// import type { ReactNode } from 'react';
// import { View, StyleSheet } from 'react-native';

// import { ThemedText } from './themed-text';
// import { ThemedView } from './themed-view';

// import { Spacing } from '@/constants/theme';

// type HintRowProps = {
//   title?: string;
//   hint?: ReactNode;
// };

// export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
//   return (
//     <View style={styles.stepRow}>
//       <ThemedText type="small">{title}</ThemedText>
//       <ThemedView type="backgroundSelected" style={styles.codeSnippet}>
//         <ThemedText themeColor="textSecondary">{hint}</ThemedText>
//       </ThemedView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   stepRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   codeSnippet: {
//     borderRadius: Spacing.two,
//     paddingVertical: Spacing.half,
//     paddingHorizontal: Spacing.two,
//   },
// });

import type { ReactNode } from "react";
import styled from "styled-components/native";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

import { Spacing } from "@/constants/theme";

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({
  title = "Try editing",
  hint = "app/index.tsx",
}: HintRowProps) {
  return (
    <StepRowContainer>
      <ThemedText type="small">{title}</ThemedText>
      <CodeSnippetView type="backgroundSelected">
        <ThemedText themeColor="textSecondary">{hint}</ThemedText>
      </CodeSnippetView>
    </StepRowContainer>
  );
}

// Styled Components 정의
const StepRowContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const CodeSnippetView = styled(ThemedView)`
  border-radius: ${Spacing.two}px;
  padding-vertical: ${Spacing.half}px;
  padding-horizontal: ${Spacing.two}px;
`;
