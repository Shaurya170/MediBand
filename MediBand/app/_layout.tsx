import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === null || segments[0] === undefined;

    if (!session && !inAuthGroup) {
      router.replace("/");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)/about");
    }
  }, [session, isLoading, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
