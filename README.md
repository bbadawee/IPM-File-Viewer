# IPMView - MasterCard Clearing & Settlement File Viewer

**IPMView** is a native Windows desktop GUI utility written in Python for parsing, exploring, and auditing MasterCard clearing layout and ISO-8583 settlement files (`.ipm`, `.dat`). It provides a tree-table browser with advanced field decoders, live analytics dashboards, Excel spreadsheets export, and formatted PDF executive summary reports.

---

## Key Features

- **Tree-Table Explorer (Grid View)**:
  - Displays fields in three structured columns: **Field**, **Value**, and **Meaning**.
  - Groups ISO-8583 fields in numerical order (DE2, DE3, DE4...) and private MasterCard data subelements (`pdsXXXX`) at the bottom.
- **Deep Compound Field Decoders**:
  - Automatically decomposes compound fields (`DE3` Processing Code, `DE12` Local Time, `DE22` POS Mode, `DE31` ARN, `DE43` Merchant Name) into child nodes.
  - Recursively parses binary EMV Integrated Circuit Card (ICC) data inside **`DE55`**, decoding hex tag values into human-readable ASCII labels (e.g. Tag 50 to `Mastercard` and Tag 9F12 to `Visa Debit`).
  - Concatenates sub-field values for parent fields (e.g. `000000` for `DE3`) to match classic Windows tree visualizers.
- **Collapsible Filter Panel**:
  - Filter transactions dynamically by Card Brand (Visa, MasterCard, Other) or Message Type (MTI).
  - Search entries in real time by card number (PAN), merchant name, merchant city, Retrieval Reference Number (RRN), Acquirer Reference Number (ARN), or Approval Code.
  - Quick **Expand All** and **Collapse All** buttons for bulk row actions.
- **Live Overview Dashboard Ribbon**:
  - Displays real-time file analytics (Total Transaction counts, volume totals grouped and formatted by currency, e.g. `IQD` or `USD`, and scheme mix counts).
- **Excel Spreadsheet Export**:
  - Exports all filtered transaction records flattened into a 20-column spreadsheet with styled headers (bold white text on dark blue background) and automatic column sizing.
- **PDF Executive Summary Report**:
  - Generates a formatted PDF containing metadata titles, volume KPIs, scheme mix distributions, a **Top 5 Merchant Leaderboard** (ranked by volume), and a transaction sequence audit log appendix.
- **Usability Enhancements**:
  - Alternate row striping for root transactions.
  - Double-click any row to expand/collapse it instantly.
  - Binds keyboard shortcuts:
    - `Ctrl + O`: Open file browser dialog.
    - `Ctrl + M`: Toggle Card PAN masking (hiding/revealing middle card digits).
    - `Ctrl + F`: Jump focus to search filter box.
    - `Escape`: Clear search filter and reset dropdowns.

---

## Getting Started

### Prerequisites

You need Python 3.8+ installed on your Windows PC.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/bbadawee/IPM-File-Viewer.git
cd IPM-File-Viewer
pip install -r requirements.txt
```

### Running the App

To run the Python application in development mode:

```bash
python ipm_viewer_app.py
```

*Note: The application requires `ipm2json.exe` to reside in the same directory to execute background conversion on IPM clearing files.*

---

## Building a Standalone Executable (.exe)

You can compile the application into a single, standalone, portable executable (`IPMView.exe`) using PyInstaller:

```bash
pyinstaller --onefile --noconsole --name IPMView --add-binary "ipm2json.exe;." ipm_viewer_app.py
```

### How Portability Works:
This build command packages the Python interpreter, dependencies (`openpyxl`, `fpdf2`), mapping configurations, and the **`ipm2json.exe`** binary directly inside a single file. 
When a user launches `IPMView.exe`, the bootloader extracts the embedded assets to a temporary folder (`sys._MEIPASS`) at runtime. This means **you can share just the single `IPMView.exe` file** with your team—they can double-click and run it instantly on any Windows machine without needing Python, modules, or extra binaries.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
