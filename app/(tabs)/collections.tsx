import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CollectionsScreen() {
    return(
        <SafeAreaView style={{flex:1}}>
            <ThemedView style={{flex:1}}>
            <ThemedText>Collections</ThemedText>
        </ThemedView>
        </SafeAreaView>
        
    )
}