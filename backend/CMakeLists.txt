cmake_minimum_required(VERSION 3.10)
project(AlgorithmVisualizer)

set(CMAKE_CXX_STANDARD 17)

# Add necessary compiler options for MSVC
if(MSVC)
    add_compile_options(/utf-8)
    add_compile_definitions(_WIN32_WINNT=0x0601)
endif()

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Add the executable
add_executable(algo_server 
    src/main.cpp
    src/server.cpp
)

# On Windows, link the WinSock2 library
if(WIN32)
    target_link_libraries(algo_server PRIVATE ws2_32)
endif()

# For Unix-like systems, we might need to link to pthread
if(UNIX)
    find_package(Threads REQUIRED)
    target_link_libraries(algo_server PRIVATE Threads::Threads)
endif()

message(STATUS "Configuration complete - run 'cmake --build . --config Release' to build")