import QRScanner from "@/QRScanner";
import { useRouter } from 'expo-router';

export default function camera() {
  const router = useRouter(); 

  return (
   <QRScanner />
  );
}
