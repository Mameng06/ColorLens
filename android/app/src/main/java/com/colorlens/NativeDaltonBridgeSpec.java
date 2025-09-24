package com.colorlens;

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

@DoNotStrip
public abstract class NativeDaltonBridgeSpec extends ReactContextBaseJavaModule implements TurboModule {
    protected NativeDaltonBridgeSpec(ReactApplicationContext context) {
        super(context);
    }

    // TS: processImage(inputPath: string, deficiency: number, severity: number): Promise<string>
    @ReactMethod
    public abstract void processImage(String inputPath, double deficiency, double severity, Promise promise);
}

