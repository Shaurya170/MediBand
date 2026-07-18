import colors from "@/styles/colors";
import { View, StyleSheet } from "react-native";

const GREEN_LIGHT = "#7AEBCF";
const GREEN_MID = colors.accent;
const GREEN_DARK = colors.button;
const GREEN_SHADOW = "#1A5C45";

type MediBandLogoProps = {
  size?: number;
};

function RibbonBar({
  style,
  light = GREEN_LIGHT,
  dark = GREEN_DARK,
}: {
  style: object;
  light?: string;
  dark?: string;
}) {
  return (
    <View style={[styles.bar, style]}>
      <View style={[styles.barLight, { backgroundColor: light }]} />
      <View style={[styles.barDark, { backgroundColor: dark }]} />
    </View>
  );
}

export default function MediBandLogo({ size = 120 }: MediBandLogoProps) {
  const scale = size / 120;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View style={[styles.canvas, { transform: [{ scale }] }]}>
        {/* Center valley (behind) */}
        <View style={styles.centerValley} />

        {/* Diagonal strokes meeting at center bottom */}
        <RibbonBar style={styles.leftDiagonal} light={GREEN_MID} dark={GREEN_SHADOW} />
        <RibbonBar style={styles.rightDiagonal} light={GREEN_MID} dark={GREEN_SHADOW} />

        {/* Inner legs */}
        <RibbonBar style={styles.innerLeftLeg} />
        <RibbonBar style={styles.innerRightLeg} />

        {/* Outer pillars */}
        <RibbonBar style={styles.leftPillar} />
        <RibbonBar style={styles.rightPillar} />

        {/* Peak fold overlays */}
        <View style={styles.leftPeakCap} />
        <View style={styles.rightPeakCap} />
        <View style={styles.leftFoldShadow} />
        <View style={styles.rightFoldShadow} />

        {/* Medical cross */}
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>
    </View>
  );
}

const BAR = 17;
const R = BAR / 2;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  canvas: {
    width: 120,
    height: 120,
    position: "relative",
  },

  bar: {
    position: "absolute",
    width: BAR,
    overflow: "hidden",
    borderRadius: R,
  },

  barLight: {
    height: "52%",
  },

  barDark: {
    height: "48%",
  },

  centerValley: {
    position: "absolute",
    left: 51.5,
    bottom: 0,
    width: BAR,
    height: 48,
    backgroundColor: GREEN_SHADOW,
    borderBottomLeftRadius: R,
    borderBottomRightRadius: R,
  },

  innerLeftLeg: {
    left: 34,
    bottom: 0,
    height: 56,
    transform: [{ rotate: "12deg" }],
    transformOrigin: "bottom center",
  },

  innerRightLeg: {
    right: 34,
    bottom: 0,
    height: 56,
    transform: [{ rotate: "-12deg" }],
    transformOrigin: "bottom center",
  },

  leftDiagonal: {
    left: 20,
    bottom: 22,
    height: 62,
    transform: [{ rotate: "36deg" }],
    transformOrigin: "bottom left",
  },

  rightDiagonal: {
    right: 20,
    bottom: 22,
    height: 62,
    transform: [{ rotate: "-36deg" }],
    transformOrigin: "bottom right",
  },

  leftPillar: {
    left: 6,
    bottom: 0,
    height: 82,
  },

  rightPillar: {
    right: 6,
    bottom: 0,
    height: 82,
  },

  leftPeakCap: {
    position: "absolute",
    left: 6,
    top: 14,
    width: BAR,
    height: 14,
    backgroundColor: GREEN_LIGHT,
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
  },

  rightPeakCap: {
    position: "absolute",
    right: 6,
    top: 14,
    width: BAR,
    height: 14,
    backgroundColor: GREEN_LIGHT,
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
  },

  leftFoldShadow: {
    position: "absolute",
    left: 19,
    top: 20,
    width: 22,
    height: 11,
    backgroundColor: GREEN_SHADOW,
    borderRadius: 4,
    transform: [{ rotate: "-18deg" }],
  },

  rightFoldShadow: {
    position: "absolute",
    right: 19,
    top: 20,
    width: 22,
    height: 11,
    backgroundColor: GREEN_SHADOW,
    borderRadius: 4,
    transform: [{ rotate: "18deg" }],
  },

  crossVertical: {
    position: "absolute",
    left: 56,
    top: 44,
    width: 8,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },

  crossHorizontal: {
    position: "absolute",
    left: 48,
    top: 52,
    width: 24,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
});
