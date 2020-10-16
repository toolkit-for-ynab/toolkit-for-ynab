//
//  ViewController.swift
//  Toolkit for YNAB
//
//  Created by Michael Williams on 10/16/20.
//

import Cocoa
import SafariServices.SFSafariApplication
import SafariServices.SFSafariExtensionManager

let appName = "Toolkit for YNAB"
let extensionBundleIdentifier = "com.github.Toolkit-for-YNAB-Extension"

class ViewController: NSViewController {

    @IBOutlet var appNameLabel: NSTextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.appNameLabel.stringValue = appName
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                var errorMessage: String = "Error: unable to determine state of the extension"

                if let errorDetail = error as NSError?, errorDetail.code == 1 {
                    errorMessage = "Couldn’t find the Toolkit for YNAB extension. Are you running macOS 10.16+, or macOS 10.14+ with Safari 14+?"
                }

                DispatchQueue.main.async {
                    let alert = NSAlert()
                    alert.messageText = "Check Version"
                    alert.informativeText = errorMessage
                    alert.beginSheetModal(for: self.view.window!) { (response) in }

                    self.appNameLabel.stringValue = errorMessage
                }
                return
            }

            DispatchQueue.main.async {
                if (state.isEnabled) {
                    self.appNameLabel.stringValue = "\(appName)'s extension is currently on."
                } else {
                    self.appNameLabel.stringValue = "\(appName)'s extension is currently off. You can turn it on in Safari Extensions preferences."
                }
            }
        }
    }
    
    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else {
                var errorMessage: String = "Error: unable to show preferences for the extension."

                if let errorDetail = error as NSError?, errorDetail.code == 1 {
                    errorMessage = "Couldn’t find the Toolkit for YNAB extension. Are you running macOS 10.16+, or macOS 10.14+ with Safari 14+?"
                }

                DispatchQueue.main.async {
                    let alert = NSAlert()
                    alert.messageText = "Check Version"
                    alert.informativeText = errorMessage
                    alert.beginSheetModal(for: self.view.window!) { (response) in }

                    self.appNameLabel.stringValue = errorMessage
                }
                return
            }

            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
    }

}
