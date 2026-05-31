# IPM Web Viewer Pro

**IPM Web Viewer Pro** is a lightning-fast, modern web application for parsing, validating, and exploring MasterCard IPM clearing and settlement files (`.dat`, `.ipm`). It is built with a lightweight Python backend using the open-source `cardutil` library, paired with a premium, hardware-accelerated frontend that can instantly render thousands of records without freezing.

---

## Features

- **Drag & Drop Interface**: Instantly upload and parse heavy `.dat` and `.ipm` files directly from your browser.
- **Central Bank Integrity Checker**: Strictly validates files against Central Bank specifications upon upload, ensuring:
  - Sequence integrity of Message Numbers (`DE71`).
  - Correct Header (`MTI 1644, DE24 697`) and Trailer (`MTI 1644, DE24 695`) structures.
  - Unique File IDs (`PDS0105`) and checksum validation for message counts (`PDS0306`) and transaction amounts (`PDS0301`).
  - Presence of Primary Account Numbers (PANs) in `1240` messages.
- **Deep Decoders & Data Modals**: 
  - Click on any row to open a deep-dive modal exposing granular, nested ISO-8583 fields.
  - Decodes complex PDS sub-fields (e.g., Merchant Names, Point of Service Data, EMV Tags).
- **High Performance Grid**: Renders 3,000+ records flawlessly using built-in pagination, entirely avoiding the performance bottlenecks typical of Tkinter or legacy desktop apps.
- **Dark Mode Aesthetics**: Sleek glassmorphism design using dynamic UI elements and Feather icons for a premium user experience.

---

## Architecture

- **Backend**: Python 3.10+ and Flask.
- **Parser**: Uses the robust `cardutil` library for parsing EBCDIC-encoded IPM files.
- **Frontend**: Vanilla JavaScript and CSS.

---

## Getting Started

### Prerequisites

Ensure you have Python 3.8+ installed.

### Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bbadawee/IPM-File-Viewer.git
   cd IPM-File-Viewer
   ```
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Web Server:
   ```bash
   python server.py
   ```
4. Open your web browser and navigate to: [http://localhost:5050](http://localhost:5050)

---

## Building a Standalone Windows Executable (.exe)

If your team uses Windows and does not have Python installed, you can generate a portable `.exe` that bundles the entire web application. When double-clicked, the executable runs silently in the background and automatically pops open the default web browser to the app.

### Option A: Cloud Compilation (Recommended)

1. Fork or push this repository to your own GitHub account.
2. The included `.github/workflows/build-windows.yml` file will automatically trigger GitHub Actions.
3. In roughly 2 minutes, navigate to the **Actions** tab on your repository to download your compiled `IPM-Viewer.exe`.

### Option B: Local Compilation

If you are on a Windows machine, you can compile it locally:

1. Double-click the provided `build_windows.bat` script.
2. The script will automatically install `pyinstaller` and package the application.
3. You will find the final `IPM-Viewer.exe` inside the `dist/` directory.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
