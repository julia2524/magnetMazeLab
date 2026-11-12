// import { version } from 'expo/package.json';
// import { Image } from 'expo-image';
// import { useColorScheme, StyleSheet } from 'react-native';

// import { ThemedText } from './themed-text';
// import { ThemedView } from './themed-view';

// import { Spacing } from '@/constants/theme';

// export function WebBadge() {
//   const scheme = useColorScheme();

//   return (
//     <ThemedView style={styles.container}>
//       <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
//         v{version}
//       </ThemedText>
//       <Image
//         source={
//           scheme === 'dark'
//             ? require('@/assets/images/expo-badge-white.png')
//             : require('@/assets/images/expo-badge.png')
//         }
//         style={styles.badgeImage}
//       />
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: Spacing.five,
//     alignItems: 'center',
//     gap: Spacing.two,
//   },
//   versionText: {
//     textAlign: 'center',
//   },
//   badgeImage: {
//     width: 123,
//     aspectRatio: 123 / 24,
//   },
// });

import { Image } from "expo-image";
import { version } from "expo/package.json";
import { useColorScheme } from "react-native";
import styled from "styled-components/native";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

import { Spacing } from "@/constants/theme";

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <Container type="backgroundElement">
      <VersionText type="code" themeColor="textSecondary">
        v{version}
      </VersionText>
      <BadgeImage
        source={
          scheme === "dark"
            ? require("@/assets/images/expo-badge-white.png")
            : require("@/assets/images/expo-badge.png")
        }
      />
    </Container>
  );
}

// Styled Components 정의
const Container = styled(ThemedView)`
  padding: ${Spacing.five}px;
  align-items: center;
  gap: ${Spacing.two}px;
`;

const VersionText = styled(ThemedText)`
  text-align: center;
`;

const BadgeImage = styled(Image)`
  width: 123px;
  aspect-ratio: ${123 / 24};
`;
