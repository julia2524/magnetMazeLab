// import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

// import { Fonts, ThemeColor } from '@/constants/theme';
// import { useTheme } from '@/hooks/use-theme';

// export type ThemedTextProps = TextProps & {
//   type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
//   themeColor?: ThemeColor;
// };

// export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
//   const theme = useTheme();

//   return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
// }

// const styles = StyleSheet.create({
//   small: {
//     fontSize: 14,
//     lineHeight: 20,
//     fontWeight: 500,
//   },
//   smallBold: {
//     fontSize: 14,
//     lineHeight: 20,
//     fontWeight: 700,
//   },
//   default: {
//     fontSize: 16,
//     lineHeight: 24,
//     fontWeight: 500,
//   },
//   title: {
//     fontSize: 48,
//     fontWeight: 600,
//     lineHeight: 52,
//   },
//   subtitle: {
//     fontSize: 32,
//     lineHeight: 44,
//     fontWeight: 600,
//   },
//   link: {
//     lineHeight: 30,
//     fontSize: 14,
//   },
//   linkPrimary: {
//     lineHeight: 30,
//     fontSize: 14,
//     color: '#3c87f7',
//   },
//   code: {
//     fontFamily: Fonts.mono,
//     fontWeight: Platform.select({ android: 700 }) ?? 500,
//     fontSize: 12,
//   },
// });

import { Platform, Text, type TextProps } from "react-native";
import styled from "styled-components/native";

import { Fonts, ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "link"
    | "linkPrimary"
    | "code";
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  // themeColor가 지정되지 않았을 때 linkPrimary는 기본 고정 색상(#3c87f7) 사용
  const resolvedColor = themeColor
    ? theme[themeColor]
    : type === "linkPrimary"
      ? "#3c87f7"
      : theme.text;

  return (
    <StyledText
      $type={type}
      style={[{ color: resolvedColor }, style]}
      {...rest} // 수정: {...rest}
      {...rest}
    />
  );
}

// Styled Components 정의
const StyledText = styled(Text)<{
  $type: NonNullable<ThemedTextProps["type"]>;
}>`
  ${({ $type }) => {
    switch ($type) {
      case "small":
        return `
          font-size: 14px;
          line-height: 20px;
          font-weight: 500;
        `;
      case "smallBold":
        return `
          font-size: 14px;
          line-height: 20px;
          font-weight: 700;
        `;
      case "title":
        return `
          font-size: 48px;
          line-height: 52px;
          font-weight: 600;
        `;
      case "subtitle":
        return `
          font-size: 32px;
          line-height: 44px;
          font-weight: 600;
        `;
      case "link":
        return `
          font-size: 14px;
          line-height: 30px;
        `;
      case "linkPrimary":
        return `
          font-size: 14px;
          line-height: 30px;
          color: #3c87f7;
        `;
      case "code":
        return `
          font-size: 12px;
          font-family: ${Fonts.mono};
          font-weight: ${Platform.select({ android: 700 }) ?? 500};
        `;
      case "default":
      default:
        return `
          font-size: 16px;
          line-height: 24px;
          font-weight: 500;
        `;
    }
  }}
`;
