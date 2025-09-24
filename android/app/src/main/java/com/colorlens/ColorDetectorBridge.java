package com.colorlens;

import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.colorlens.NativeColorDetectorSpec;

import org.tensorflow.lite.Interpreter;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

public class ColorDetectorBridge extends NativeColorDetectorSpec {
    private static final String TAG = "ColorDetectorBridge";
    private Interpreter tflite = null;
    private List<String> labels = new ArrayList<>();

    public ColorDetectorBridge(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    public static final String NAME = "ColorDetectorBridge";

    @Override
    public String getName() { return NAME; }

    @Override
    public void predictDummy(Promise promise) {
        try {
            String res = "{\"name\":\"Red\",\"hex\":\"#FF0000\",\"rgb\":\"(255,0,0)\",\"hsv\":\"(0,100,100)\"}";
            promise.resolve(res);
        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }

    @Override
    public void initModel(String assetName, Promise promise) {
        try {
            AssetManager assets = getReactApplicationContext().getAssets();
            // Try to memory-map the model; if the asset was compressed in the APK this will fail
            // so fall back to reading the bytes and supplying a ByteBuffer.
            try {
                tflite = new Interpreter(loadModelFile(assets, assetName));
                Log.i(TAG, "Model loaded via mmap: " + assetName);
            } catch (IOException ioe) {
                // Fallback: read full asset into ByteBuffer
                byte[] modelBytes = loadAssetBytes(assets, assetName);
                Log.i(TAG, "Model loaded via stream fallback: " + assetName + " bytes=" + modelBytes.length);
                ByteBuffer bb = ByteBuffer.allocateDirect(modelBytes.length);
                bb.order(ByteOrder.nativeOrder());
                bb.put(modelBytes);
                bb.rewind();
                tflite = new Interpreter(bb);
            }
            // load labels if present
            try {
                String labelsJson = new String(loadAssetBytes(assets, "color_labels.json"), "UTF-8");
                labels.clear();
                // Parse as JSON object for robust extraction
                JSONObject obj = new JSONObject(labelsJson);
                JSONArray names = obj.names();
                int maxIdx = -1;
                if (names != null) {
                    for (int i = 0; i < names.length(); i++) {
                        try {
                            String k = names.getString(i);
                            int idx = Integer.parseInt(k);
                            if (idx > maxIdx) maxIdx = idx;
                        } catch (Exception ex) {
                            // ignore non-integer keys
                        }
                    }
                }
                if (maxIdx >= 0) {
                    for (int i = 0; i <= maxIdx; i++) {
                        String key = String.valueOf(i);
                        String v = obj.optString(key, null);
                        if (v == null) v = "color-" + i;
                        labels.add(v);
                    }
                }
                Log.i(TAG, "Parsed labels count=" + labels.size());
            } catch (Exception e) {
                Log.i(TAG, "No labels loaded: " + e.getMessage());
            }

            Log.i(TAG, "Model initialized: " + assetName + " labels=" + labels.size());
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERR_INIT", e);
        }
    }

    @Override
    public void predictPixel(double r, double g, double b, Promise promise) {
        try {
            if (tflite == null) {
                promise.reject("ERR_NO_MODEL", "Model not initialized");
                return;
            }
            // Input tensor [1,3]
            float[][] input = new float[1][3];
            input[0][0] = (float) r;
            input[0][1] = (float) g;
            input[0][2] = (float) b;
            float[][] output = new float[1][254];
            tflite.run(input, output);
            // find argmax
            int best = 0; float bestVal = output[0][0];
            for (int i=1;i<output[0].length;i++) { if (output[0][i] > bestVal) { bestVal = output[0][i]; best = i; } }
            String name = best < labels.size() ? labels.get(best) : ("color-"+best);
            String hex = mapMaterialHex(name);
            int ri = Math.round((float)r*255); int gi = Math.round((float)g*255); int bi = Math.round((float)b*255);
            String json = String.format("{\"name\":\"%s\",\"hex\":\"%s\",\"rgb\":\"(%d,%d,%d)\",\"hsv\":\"(0,0,0)\",\"confidence\":%.3f}", name, hex, ri, gi, bi, bestVal);
            promise.resolve(json);
        } catch (Exception e) {
            promise.reject("ERR_PREDICT", e);
        }
    }

    private static ByteBuffer loadModelFile(AssetManager assets, String modelPath) throws IOException {
        AssetFileDescriptor fileDescriptor = assets.openFd(modelPath);
        FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = fileDescriptor.getStartOffset();
        long declaredLength = fileDescriptor.getDeclaredLength();
        ByteBuffer bb = fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
        bb.order(ByteOrder.nativeOrder());
        return bb;
    }

    private static byte[] loadAssetBytes(AssetManager assets, String path) throws IOException {
        // Use open() which works even for compressed assets inside the APK
        InputStream is = assets.open(path);
        try {
            int available = is.available();
            // If available() returns 0, fall back to reading via a buffer
            if (available > 0) {
                byte[] buf = new byte[available];
                int read = 0; int off = 0;
                while (off < buf.length && (read = is.read(buf, off, buf.length - off)) > 0) off += read;
                return buf;
            } else {
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                byte[] tmp = new byte[4096];
                int r;
                while ((r = is.read(tmp)) != -1) baos.write(tmp, 0, r);
                return baos.toByteArray();
            }
        } finally {
            try { is.close(); } catch (Exception ex) {}
        }
    }

    private static String mapMaterialHex(String name) {
        // Minimal mapping for a few named colors; expand as needed.
        if (name.startsWith("red-")) return "#F44336";
        if (name.startsWith("pink-")) return "#E91E63";
        if (name.startsWith("blue-")) return "#2196F3";
        if (name.startsWith("green-")) return "#4CAF50";
        if (name.startsWith("yellow-")) return "#FFEB3B";
        if (name.startsWith("orange-")) return "#FF9800";
        if (name.startsWith("purple-")) return "#9C27B0";
        if (name.startsWith("brown-")) return "#795548";
        if (name.startsWith("grey-")) return "#9E9E9E";
        return "#000000";
    }

    @Override
    public void sampleImageAtNormalized(String filePath, double nx, double ny, Promise promise) {
        try {
            if (tflite == null) {
                promise.reject("ERR_NO_MODEL", "Model not initialized");
                return;
            }
            // decode bitmap
            Bitmap bmp = BitmapFactory.decodeFile(filePath);
            if (bmp == null) {
                promise.reject("ERR_BITMAP", "Unable to decode image: " + filePath);
                return;
            }
            int iw = bmp.getWidth();
            int ih = bmp.getHeight();
            int px = Math.min(iw-1, Math.max(0, Math.round((float)nx * iw)));
            int py = Math.min(ih-1, Math.max(0, Math.round((float)ny * ih)));
            int color = bmp.getPixel(px, py);
            int ri = (color >> 16) & 0xFF;
            int gi = (color >> 8) & 0xFF;
            int bi = color & 0xFF;
            float rf = ri / 255.0f;
            float gf = gi / 255.0f;
            float bf = bi / 255.0f;

            // run interpreter
            float[][] input = new float[1][3];
            input[0][0] = rf; input[0][1] = gf; input[0][2] = bf;
            float[][] output = new float[1][254];
            tflite.run(input, output);
            int best = 0; float bestVal = output[0][0];
            for (int i=1;i<output[0].length;i++) { if (output[0][i] > bestVal) { bestVal = output[0][i]; best = i; } }
            String name = best < labels.size() ? labels.get(best) : ("color-"+best);
            String hex = mapMaterialHex(name);
            String json = String.format("{\"name\":\"%s\",\"hex\":\"%s\",\"rgb\":\"(%d,%d,%d)\",\"hsv\":\"(0,0,0)\",\"confidence\":%.3f}", name, hex, ri, gi, bi, bestVal);
            promise.resolve(json);
        } catch (Exception e) {
            promise.reject("ERR_SAMPLE", e);
        }
    }

}
