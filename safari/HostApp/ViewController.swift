import Cocoa
import SafariServices

class ViewController: NSViewController {
    @IBOutlet weak var appNameLabel: NSTextField!
    @IBOutlet weak var extensionStatusLabel: NSTextField!
    @IBOutlet weak var openSafariPreferencesButton: NSButton!

    override func viewDidLoad() {
        super.viewDidLoad()
        updateExtensionStatus()
    }

    override func viewWillAppear() {
        super.viewWillAppear()
        updateExtensionStatus()
    }

    func updateExtensionStatus() {
        let extensionBundleIdentifier = Bundle.main.bundleIdentifier! + ".Extension"

        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { state, error in
            DispatchQueue.main.async {
                if let error = error {
                    self.extensionStatusLabel.stringValue = "Error: \(error.localizedDescription)"
                    return
                }

                guard let state = state else {
                    self.extensionStatusLabel.stringValue = "Unable to determine extension state"
                    return
                }

                if state.isEnabled {
                    self.extensionStatusLabel.stringValue = "Toolkit for YNAB extension is enabled in Safari."
                    self.extensionStatusLabel.textColor = .systemGreen
                } else {
                    self.extensionStatusLabel.stringValue = "Toolkit for YNAB extension is disabled. Enable it in Safari preferences."
                    self.extensionStatusLabel.textColor = .systemOrange
                }
            }
        }
    }

    @IBAction func openSafariPreferences(_ sender: Any) {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: Bundle.main.bundleIdentifier! + ".Extension") { error in
            if let error = error {
                NSLog("Error opening Safari preferences: \(error.localizedDescription)")
            }
        }
    }
}
