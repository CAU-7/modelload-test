package com.test

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

// VisionCamera와 Worklets 관련 임포트
import com.mrousavy.camera.CameraPackage
import com.mrousavy.camera.frameprocessor.VisionCameraFrameProcessorPlugin
import com.facebook.react.bridge.JSIModulePackage
import com.swmansion.reanimated.ReanimatedJSIModulePackage // Reanimated용
import com.worklets.WorkletsPackage
import com.worklets.Worklets // Worklets 플러그인

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // 여기에 추가 패키지들을 수동으로 추가합니다.
                    add(CameraPackage()) // VisionCamera 패키지
                    add(WorkletsPackage()) // Worklets 패키지
                }

            override fun getJSIModulePackage(): JSIModulePackage? {
                // Reanimated JSIModule을 추가합니다.
                return ReanimatedJSIModulePackage()
            }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, /* native exopackage */ false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
