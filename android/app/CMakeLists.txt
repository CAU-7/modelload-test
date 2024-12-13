cmake_minimum_required(VERSION 3.22.1)
project(VisionCamera)

# C++ 표준 설정
set(CMAKE_CXX_STANDARD 17)

# react-native-worklets-core 경로 설정
find_package(react-native-worklets-core REQUIRED CONFIG)

# # 추가 헤더 파일 디렉토리
# include_directories(
#     ${CMAKE_SOURCE_DIR}/src/main/cpp/includes
#     ${CMAKE_SOURCE_DIR}/../../node_modules/react-native-fast-tflite/android/src/main/cpp/includes
# )

# 라이브러리 연결
target_link_libraries(
    ${PACKAGE_NAME}
    log
    react-native-worklets-core::rnworklets
)
