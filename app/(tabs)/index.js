import { useRouter } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter(); 

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-4">
      <View className="items-center space-y-8">
        <Text className="text-3xl font-bold text-gray-800">Color Lens</Text>

        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-full shadow-md"
          onPress={() => router.push('/about')}
        >
          <Text className="text-white text-lg font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
