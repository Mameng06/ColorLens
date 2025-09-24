cmake_minimum_required(VERSION 3.10.2)
project(color_detector_native_placeholder)

# Build dalton_bridge which links the included daltonlens implementation
add_library(dalton_bridge SHARED dalton_bridge.cpp daltonlens/libDaltonLens.c)

# Find required Android system libraries
find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)

# Include headers for daltonlens
target_include_directories(dalton_bridge PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/daltonlens)

# Link libraries to dalton_bridge
target_link_libraries(dalton_bridge ${log-lib} ${jnigraphics-lib})