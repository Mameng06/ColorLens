import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  predictDummy(): Promise<string>;
  initModel(assetName: string): Promise<boolean>;
  predictPixel(r: number, g: number, b: number): Promise<string>;
  sampleImageAtNormalized(filePath: string, nx: number, ny: number): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ColorDetectorBridge');

