// Minimal JSI bridge skeleton - returns a dummy color prediction.
#include <jni.h>
#include <string>
#include <android/log.h>

extern "C" JNIEXPORT jstring JNICALL
Java_com_colorlens_ColorDetectorBridge_predictDummy(JNIEnv *env, jobject /* this */) {
    std::string result = "{\"name\":\"Red\",\"hex\":\"#FF0000\",\"rgb\":\"(255,0,0)\",\"hsv\":\"(0,100,100)\"}";
    return env->NewStringUTF(result.c_str());
}
