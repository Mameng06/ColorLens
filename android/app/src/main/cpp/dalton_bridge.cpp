// Clean JNI wrapper for daltonization using libDaltonLens
#include <jni.h>
#include <cstdlib>
#include <android/bitmap.h>
#include <android/log.h>
#include "daltonlens/libDaltonLens.h"

static const char* TAG = "dalton_bridge";

extern "C" JNIEXPORT jboolean JNICALL
Java_com_colorlens_DaltonBridge_processBitmapNative(JNIEnv* env, jobject /* this */, jobject bitmap, jint deficiency, jfloat severity) {
    if (bitmap == nullptr) {
        __android_log_print(ANDROID_LOG_ERROR, TAG, "bitmap is null");
        return JNI_FALSE;
    }

    AndroidBitmapInfo info;
    if (AndroidBitmap_getInfo(env, bitmap, &info) != ANDROID_BITMAP_RESULT_SUCCESS) {
        __android_log_print(ANDROID_LOG_ERROR, TAG, "AndroidBitmap_getInfo failed");
        return JNI_FALSE;
    }

    if (info.format != ANDROID_BITMAP_FORMAT_RGBA_8888) {
        __android_log_print(ANDROID_LOG_WARN, TAG, "Bitmap not RGBA_8888 (format=%d) — attempting to continue", info.format);
    }

    void* pixels = nullptr;
    if (AndroidBitmap_lockPixels(env, bitmap, &pixels) != ANDROID_BITMAP_RESULT_SUCCESS) {
        __android_log_print(ANDROID_LOG_ERROR, TAG, "AndroidBitmap_lockPixels failed");
        return JNI_FALSE;
    }

    const int width = info.width;
    const int height = info.height;
    const size_t bytesPerRow = static_cast<size_t>(width) * 4;

    unsigned char* buf = (unsigned char*)malloc((size_t)height * bytesPerRow);
    if (!buf) {
        __android_log_print(ANDROID_LOG_ERROR, TAG, "malloc failed");
        AndroidBitmap_unlockPixels(env, bitmap);
        return JNI_FALSE;
    }

    // Copy ARGB_8888 -> RGBA buffer
    uint32_t* src = (uint32_t*)pixels;
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            uint32_t c = src[y * width + x];
            unsigned char a = (c >> 24) & 0xFF;
            unsigned char r = (c >> 16) & 0xFF;
            unsigned char g = (c >> 8) & 0xFF;
            unsigned char b = (c) & 0xFF;
            size_t idx = (size_t)y * bytesPerRow + (size_t)x * 4;
            buf[idx + 0] = r;
            buf[idx + 1] = g;
            buf[idx + 2] = b;
            buf[idx + 3] = a;
        }
    }

    // Call the daltonization routine (in-place on buf)
    dl_simulate_cvd((DLDeficiency)deficiency, (float)severity, buf, width, height, bytesPerRow);

    // Copy back RGBA -> ARGB_8888
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            size_t idx = (size_t)y * bytesPerRow + (size_t)x * 4;
            unsigned char r = buf[idx + 0];
            unsigned char g = buf[idx + 1];
            unsigned char b = buf[idx + 2];
            unsigned char a = buf[idx + 3];
            uint32_t c = ((uint32_t)a << 24) | ((uint32_t)r << 16) | ((uint32_t)g << 8) | ((uint32_t)b);
            src[y * width + x] = c;
        }
    }

    free(buf);
    AndroidBitmap_unlockPixels(env, bitmap);
    __android_log_print(ANDROID_LOG_INFO, TAG, "processBitmapNative completed (w=%d h=%d)", width, height);
    return JNI_TRUE;
}
