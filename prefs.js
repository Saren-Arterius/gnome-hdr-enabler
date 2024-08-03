'use strict';

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class HDREnablerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings('org.gnome.shell.extensions.hdr-enabler');

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup();
        page.add(group);

        // Create a ListBox to hold the HDR app list
        const listBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE,
            margin_top: 5,
            margin_bottom: 5,
            margin_start: 5,
            margin_end: 5,
        });
        group.add(listBox);

        // Function to refresh the list
        const refreshList = () => {
            // Remove all children
            while (listBox.get_first_child()) {
                listBox.remove(listBox.get_first_child());
            }

            const hdrApps = JSON.parse(settings.get_string('hdr-apps'));
            hdrApps.forEach(app => {
                const row = new Adw.ActionRow({ title: app.wmClass });
                const argLabel = new Gtk.Label({ label: app.argument || 'No argument' });
                row.add_suffix(argLabel);
                const deleteButton = new Gtk.Button({
                    icon_name: 'user-trash-symbolic',
                    valign: Gtk.Align.CENTER,
                });
                deleteButton.connect('clicked', () => {
                    const newList = hdrApps.filter(item => item.wmClass !== app.wmClass);
                    settings.set_string('hdr-apps', JSON.stringify(newList));
                    refreshList();
                });
                row.add_suffix(deleteButton);
                listBox.append(row);
            });
        };

        // Add new app entry
        const wmClassEntry = new Gtk.Entry({
            placeholder_text: 'Enter WM Class',
            margin_top: 5,
            margin_bottom: 5,
            margin_start: 5,
            margin_end: 5,
        });
        const argumentEntry = new Gtk.Entry({
            placeholder_text: 'Enter argument (optional)',
            margin_top: 5,
            margin_bottom: 5,
            margin_start: 5,
            margin_end: 5,
        });
        const addButton = new Gtk.Button({
            label: 'Add',
            margin_top: 5,
            margin_bottom: 5,
            margin_start: 5,
            margin_end: 5,
        });
        addButton.connect('clicked', () => {
            const newWmClass = wmClassEntry.get_text().trim();
            const newArgument = argumentEntry.get_text().trim();
            if (newWmClass) {
                const hdrApps = JSON.parse(settings.get_string('hdr-apps'));
                if (!hdrApps.some(app => app.wmClass === newWmClass)) {
                    hdrApps.push({ wmClass: newWmClass, argument: newArgument });
                    settings.set_string('hdr-apps', JSON.stringify(hdrApps));
                    wmClassEntry.set_text('');
                    argumentEntry.set_text('');
                    refreshList();
                }
            }
        });

        const addBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            margin_top: 5,
            margin_bottom: 5,
            margin_start: 5,
            margin_end: 5,
        });
        addBox.append(wmClassEntry);
        addBox.append(argumentEntry);
        addBox.append(addButton);

        group.add(addBox);

        // Initial list population
        refreshList();

        window.add(page);
    }
}
