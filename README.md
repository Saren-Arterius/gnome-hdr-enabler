# HDR Enabler GNOME Extension

This GNOME Shell extension automatically enables or disables HDR (High Dynamic Range) based on the focused application. It allows you to specify which applications should trigger HDR mode, optionally checking for specific command-line arguments.

## Features

- Automatically enable/disable HDR when focusing on specified applications
- Optional command-line argument checking for fine-grained control
- User-configurable list of HDR-enabled applications

## Installation

1. Clone this repository:

`$ git clone https://github.com/Saren-Arterius/gnome-hdr-enabler.git`

2. Move the cloned directory to your GNOME extensions folder:

mv gnome-hdr-enabler ~/.local/share/gnome-shell/extensions/hdr-enabler@wtako.net

3. Restart the GNOME Shell:
- On X11: Alt+F2, type 'r', and press Enter
- On Wayland: Log out and log back in
4. Enable the extension using GNOME Extensions app or gnome-extensions-app

## Usage

1. Open the GNOME Extensions app
2. Find "HDR Enabler" in the list and click on the settings icon
3. Add applications to the HDR list:
- Enter the WM class of the application
- Optionally, enter a specific command-line argument to check for
4. The extension will now automatically enable HDR when these applications are focused

## Default Configuration

By default, the extension includes "gamescope" with the "--hdr-enabled" argument in the HDR-enabled applications list. You can modify or remove this entry through the extension settings.

## Troubleshooting

If you encounter any issues:

1. Check the GNOME Shell log for error messages:

`$ journalctl /usr/bin/gnome-shell -f`

2. Ensure your system supports HDR and it's properly configured
3. Verify that the WM class you've entered matches the application you're targeting

(Alt+F2 => `lg` => `global.display.focus_window.get_wm_class()`)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Claude 3.5 is scary, lol.
