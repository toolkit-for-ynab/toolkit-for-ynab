import Cocoa
import SafariServices

class ViewController: NSViewController {
    @IBOutlet weak var appNameLabel: NSTextField!

    override func viewDidLoad() {
        super.viewDidLoad()
        appNameLabel.stringValue = "Toolkit for YNAB"

        // Check extension state
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: "com.toolkitforynab.Toolkit-for-YNAB.Extension") { (state, error) in
            DispatchQueue.main.async {
                if let error = error {
                    self.appNameLabel.stringValue = "Error checking extension state: \(error.localizedDescription)"
                    print("Extension state error: \(error)")
                    return
                }

                guard let state = state else {
                    self.appNameLabel.stringValue = "Could not get extension state"
                    return
                }

                if state.isEnabled {
                    self.appNameLabel.stringValue = "Toolkit for YNAB's extension is currently on."
                } else {
                    self.appNameLabel.stringValue = "Toolkit for YNAB's extension is currently off.\nClick the button below to open Safari Extensions preferences."
                }
            }
        }
    }

    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        print("Button clicked - opening Safari preferences...")

        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.toolkitforynab.Toolkit-for-YNAB.Extension") { error in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error opening Safari preferences: \(error)")
                    // Show an alert if there's an error
                    let alert = NSAlert()
                    alert.messageText = "Could not open Safari preferences"
                    alert.informativeText = "Error: \(error.localizedDescription)\n\nPlease open Safari manually and go to Safari > Settings > Extensions"
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "OK")
                    alert.runModal()
                    return
                }

                // Only quit if successfully opened
                print("Safari preferences opened successfully")
            }
        }
    }
}
