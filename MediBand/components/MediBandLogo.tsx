import { Image } from "react-native";

const LOGO_ASPECT_RATIO = 290 / 391;

export default function MediBandLogo({ size = 60 }: { size?: number }) {
  return (
    <Image
      source={require("@/assets/images/MediBand_logo.png")}
      style={{ width: size, height: size * LOGO_ASPECT_RATIO }}
      resizeMode="contain"
    />
  );
}
