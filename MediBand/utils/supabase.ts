// utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

console.log("ENV URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("ENV KEY:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

if (Platform.OS !== "web") {
  require("react-native-url-polyfill/auto");
}

const storage =
  Platform.OS !== "web"
    ? require("@react-native-async-storage/async-storage").default
    : undefined;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: storage ? { storage } : undefined,
  },
);