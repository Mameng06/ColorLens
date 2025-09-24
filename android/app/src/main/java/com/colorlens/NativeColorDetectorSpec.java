package com.colorlens;

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

@DoNotStrip
public abstract class NativeColorDetectorSpec extends ReactContextBaseJavaModule implements TurboModule {
    protected NativeColorDetectorSpec(ReactApplicationContext context) {
        super(context);
    }

    // TS: predictDummy(): Promise<string>
    @ReactMethod
    public abstract void predictDummy(Promise promise);

    // TS: initModel(assetName: string): Promise<boolean>
    @ReactMethod
    public abstract void initModel(String assetName, Promise promise);

    // TS: predictPixel(r: number, g: number, b: number): Promise<string>
    @ReactMethod
    public abstract void predictPixel(double r, double g, double b, Promise promise);

    // TS: sampleImageAtNormalized(filePath: string, nx: number, ny: number): Promise<string>
    @ReactMethod
    public abstract void sampleImageAtNormalized(String filePath, double nx, double ny, Promise promise);
}

