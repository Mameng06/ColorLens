#include <jni.h>
#include <android/log.h>

extern "C" JNIEXPORT jint JNICALL
Java_com_colorlens_NativePlaceholder_echoInt(JNIEnv* env, jclass /*clazz*/, jint x) {
    __android_log_print(ANDROID_LOG_INFO, "nativeplaceholder", "echoInt %d", x);
    return x;
}
