'use strict';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class HDREnablerExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this.settings = null;
        this.windowFocusedSignalId = null;
        this.timeout = null;
    }
    initializeSettings() {
        let isFirstRun = this.settings.get_boolean('is-first-run');
        if (isFirstRun) {
            // This is the first run, so we'll add the default entry
            let defaultApps = [
                {
                    wmClass: "gamescope",
                    argument: "--hdr-enabled"
                }
            ];
            this.settings.set_string('hdr-apps', JSON.stringify(defaultApps));
            
            // Set the first-run flag to false so this doesn't run again
            this.settings.set_boolean('is-first-run', false);
            
            console.log('HDR Enabler: Initialized default settings');
        }
    }

    enable() {
        console.log('HDR Enabler: Extension enabled');
        this.settings = this.getSettings('org.gnome.shell.extensions.hdr-enabler');
        this.initializeSettings();  // This will only do something on the first run
        this.windowFocusedSignalId = global.display.connect('notify::focus-window', this.onWindowFocused.bind(this));
    }

    disable() {
        console.log('HDR Enabler: Extension disabled');
        if (this.windowFocusedSignalId) {
            global.display.disconnect(this.windowFocusedSignalId);
            this.windowFocusedSignalId = null;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.setHDR(false);
        this.settings = null;
    }

    onWindowFocused() {
        let focusedWindow = global.display.focus_window;
        if (focusedWindow) {
            let windowName = focusedWindow.get_wm_class();
            let pid = focusedWindow.get_pid();

            console.log(`HDR Enabler: Window focused - ${windowName} (PID: ${pid})`);

            if (this.shouldEnableHDR(windowName, pid)) {
                console.log(`HDR Enabler: Enabling HDR for ${windowName}`);
                this.setHDR(true);
            } else {
                console.log(`HDR Enabler: Disabling HDR for ${windowName}`);
                this.setHDR(false);
            }
        } else {
            console.log('HDR Enabler: No window focused');
        }
    }

    shouldEnableHDR(windowName, pid) {
        let hdrApps = JSON.parse(this.settings.get_string('hdr-apps'));
        let app = hdrApps.find(a => a.wmClass === windowName);

        if (app) {
            if (app.argument) {
                return this.checkProcessArgument(pid, app.argument);
            }
            return true; // If no argument specified, always enable HDR for this WM class
        }
        return false;
    }

    checkProcessArgument(pid, argument) {
        try {
            let [success, contents] = GLib.file_get_contents(`/proc/${pid}/cmdline`);
            if (!success) {
                console.error(`HDR Enabler: Failed to read /proc/${pid}/cmdline`);
                return false;
            }
    
            // Convert the ByteArray to a string, replacing null bytes with a special separator
            let cmdline = Object.values(contents)
                .map(n => n === 0 ? '!#!#!' : String.fromCharCode(n))
                .join('')
                .split('!#!#!')
                .filter(arg => arg.length > 0);  // Remove empty elements
    
            console.log(`HDR Enabler: Process arguments - ${cmdline.join(' ')}`);
            
            // Check if any argument contains the specified argument
            return cmdline.some(arg => arg.includes(argument));
        } catch (e) {
            console.error(`HDR Enabler: Error checking process arguments - ${e}`);
            return false;
        }
    }

    setHDR(enable) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        let newVal = enable ? 'on' : 'off';
        console.log(`HDR Enabler: HDR will set to ${newVal}`);

        this.timeout = setTimeout(() => {
            try {
                if (global.compositor.backend.get_monitor_manager().experimental_hdr !== undefined) {
                    let current = global.compositor.backend.get_monitor_manager().experimental_hdr;
                    if (current === newVal) {
                        console.log(`HDR Enabler: No change ${newVal}`);
                    } else {
                        console.log(`HDR Enabler: HDR set to ${newVal}`);
                        global.compositor.backend.get_monitor_manager().experimental_hdr = newVal;
                    }
                } else {
                    console.log('HDR Enabler: experimental_hdr property not found');
                }
            } catch (e) {
                console.error(`HDR Enabler: Error setting HDR - ${e}`);
            }
        }, 1000);
    }
}
