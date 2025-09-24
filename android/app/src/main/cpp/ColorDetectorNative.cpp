#include <jni.h>
#include <string>
#include <vector>
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <android/log.h>
#include <sstream>
#include <algorithm>

#define LOG_TAG "ColorDetectorNative"
#define ALOG(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

static std::vector<std::string> g_labels;

extern "C" JNIEXPORT jstring JNICALL
Java_com_colorlens_ColorDetectorBridge_predictDummyNative(JNIEnv* env, jobject /* this */) {
    const char* res = "{\"name\":\"Red\",\"hex\":\"#FF0000\",\"rgb\":\"(255,0,0)\",\"hsv\":\"(0,100,100)\"}";
    return env->NewStringUTF(res);
}

// Helper: read asset into string
static std::string readAsset(AAssetManager* mgr, const char* name) {
    AAsset* asset = AAssetManager_open(mgr, name, AASSET_MODE_BUFFER);
    if (!asset) return "";
    off_t size = AAsset_getLength(asset);
    std::string out;
    out.resize(size);
    AAsset_read(asset, &out[0], size);
    AAsset_close(asset);
    return out;
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_colorlens_ColorDetectorBridge_initModelNative(JNIEnv* env, jobject /* this */, jobject assetManager, jstring assetName) {
    if (!assetManager) return JNI_FALSE;
    AAssetManager* mgr = AAssetManager_fromJava(env, assetManager);
    if (!mgr) return JNI_FALSE;

    const char* asset_c = env->GetStringUTFChars(assetName, nullptr);
    std::string modelData = readAsset(mgr, asset_c);
    env->ReleaseStringUTFChars(assetName, asset_c);

    ALOG("Loaded model asset size=%zu", modelData.size());

    // Load labels file (color_labels.json expected at assets root)
    std::string labelsJson = readAsset(mgr, "color_labels.json");
    if (!labelsJson.empty()) {
        // crude parse: split by newline or comma to get simple labels if it's a newline list
        g_labels.clear();
        std::istringstream ss(labelsJson);
        std::string line;
        while (std::getline(ss, line)) {
            // trim
            line.erase(std::remove_if(line.begin(), line.end(), ::isspace), line.end());
            if (line.empty()) continue;
            // remove quotes and commas
            if (line.front()=='"') line.erase(0,1);
            if (line.back()=='"' || line.back()==',') line.pop_back();
            if (!line.empty()) g_labels.push_back(line);
        }
        ALOG("Loaded %zu labels", g_labels.size());
    }

    // Note: here we'd normally create a TFLite interpreter using modelData buffer.
    // For this skeleton we just signal success if we loaded something.
    return JNI_TRUE;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_colorlens_ColorDetectorBridge_predictPixelNative(JNIEnv* env, jobject /* this */, jfloat r, jfloat g, jfloat b) {
    // Model input is [1,3] float normalized 0..1
    float input[3];
    input[0] = r;
    input[1] = g;
    input[2] = b;

    // Dummy inference: find nearest Material color by simple rounding to red/green/blue
    int ri = (int)std::round(input[0]*255);
    int gi = (int)std::round(input[1]*255);
    int bi = (int)std::round(input[2]*255);

    // crude name mapping: choose dominant channel
    std::string name = "Unknown";
    std::string hex = "#000000";
    if (ri > gi && ri > bi) { name = "red-500"; hex = "#F44336"; }
    else if (gi > ri && gi > bi) { name = "green-500"; hex = "#4CAF50"; }
    else if (bi > ri && bi > gi) { name = "blue-500"; hex = "#2196F3"; }
    else { name = "pink-300"; hex = "#F06292"; }

    char buf[512];
    float confidence = 0.92f; // placeholder
    snprintf(buf, sizeof(buf), "{\"name\":\"%s\",\"hex\":\"%s\",\"rgb\":\"(%d,%d,%d)\",\"hsv\":\"(0,100,100)\",\"confidence\":%.2f}",
             name.c_str(), hex.c_str(), ri, gi, bi, confidence);
    return env->NewStringUTF(buf);
}
