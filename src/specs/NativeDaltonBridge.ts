import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  processImage(inputPath: string, deficiency: number, severity: number): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DaltonBridge');
