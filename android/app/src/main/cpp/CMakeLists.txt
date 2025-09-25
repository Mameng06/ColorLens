cmake_minimum_required(VERSION 3.18.1)
project(dalton_bridge)

# Build dalton_bridge with daltonlens
add_library(dalton_bridge SHARED
    dalton_bridge.cpp
    daltonlens/libDaltonLens.c
)

# Find Android system libraries
find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)

# Include headers
target_include_directories(dalton_bridge PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/daltonlens
)

# Link libraries
target_link_libraries(dalton_bridge
    ${log-lib}
    ${jnigraphics-lib}
)