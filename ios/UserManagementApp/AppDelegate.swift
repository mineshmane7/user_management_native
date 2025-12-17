import UIKit
import React
import React_RCTAppDelegate

@main
class AppDelegate: RCTAppDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  // Ensure moduleName and initialProps are set so JS AppRegistry receives a valid app key
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    if self.moduleName == nil || (self.moduleName?.isEmpty ?? true) {
      self.moduleName = (Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String) ?? (Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String) ?? "UserManagementApp"
    }

    // Ensure initialProps is non-nil
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Try-fix: ensure React Native root view gets nil initial properties to avoid
  // crashes caused by non-serializable objects being passed at startup.
  // Override to ensure safe initial properties are passed (use empty dict instead of nil)
  override func createRootView(with bridge: RCTBridge, moduleName: String, initProps: [AnyHashable : Any]) -> UIView {
    // Pass an empty dictionary to avoid non-serializable values causing Obj-C exceptions
    return super.createRootView(with: bridge, moduleName: moduleName, initProps: [:])
  }
}

