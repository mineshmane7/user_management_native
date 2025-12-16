if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/Sourabh.Sharma/.gradle/caches/8.8/transforms/282f609d22365a992738b6fad7ce8a54/transformed/hermes-android-0.74.5-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/Sourabh.Sharma/.gradle/caches/8.8/transforms/282f609d22365a992738b6fad7ce8a54/transformed/hermes-android-0.74.5-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

