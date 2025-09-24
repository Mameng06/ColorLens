package com.colorlens;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.colorlens.NativeDaltonBridgeSpec;

import java.io.File;
import java.io.FileOutputStream;

public class DaltonBridge extends NativeDaltonBridgeSpec {
    public static final String NAME = "DaltonBridge";
    private static final String TAG = "DaltonBridge";

    public DaltonBridge(ReactApplicationContext ctx){
        super(ctx);
    }

    @Override
    public String getName(){
        return NAME;
    }

    static {
        try {
            System.loadLibrary("dalton_bridge");
        } catch (UnsatisfiedLinkError e){
            Log.e(TAG, "Cannot load dalton_bridge: " + e.getMessage());
        }
    }

    // JNI entrypoint (implemented in C++)
    private static native boolean processBitmapNative(Bitmap bitmap, int deficiency, float severity);

    // Codegen signature: (String, double, double, Promise)
    @Override
    public void processImage(String inputPath, double deficiency, double severity, Promise promise) {
        try {
            Bitmap bmp = BitmapFactory.decodeFile(inputPath);
            if (bmp == null) {
                promise.reject("ERR_DECODE", "Unable to decode image");
                return;
            }
            Bitmap mutable = bmp.copy(Bitmap.Config.ARGB_8888, true);

            boolean ok = processBitmapNative(mutable, (int)deficiency, (float)severity);
            if (!ok) {
                promise.reject("ERR_PROC", "native processing failed");
                return;
            }

            File cacheDir = getReactApplicationContext().getCacheDir();
            File out = new File(cacheDir, "dalton_out.png");
            FileOutputStream fos = new FileOutputStream(out);
            mutable.compress(Bitmap.CompressFormat.PNG, 100, fos);
            fos.flush();
            fos.close();
            promise.resolve(out.getAbsolutePath());
        } catch (Exception e) {
            promise.reject("ERR_PROC", e);
        }
    }
}
