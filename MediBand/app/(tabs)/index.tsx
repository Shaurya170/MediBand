import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../../styles/colors";

export default function Home() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
     <View style={styles.container}>
        <Text style={styles.text}>
            Your 
        </Text>
        <Text style={styles.text}>
            We are landscaping company that brings you lawn and order!
        </Text>
        
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container : {
    backgroundColor: Colors.background,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text:{
    fontSize: 30,
  }
})