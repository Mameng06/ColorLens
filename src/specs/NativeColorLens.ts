/*
 * This is a template for a native module spec file.
 */
// TurboModule spec for ColorLens
import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  getColorFromImage(uri: string): Promise<string>;
}

// getEnforcing helps surface issues early if the module isn't linked
export default TurboModuleRegistry.getEnforcing<Spec>('ColorLens');