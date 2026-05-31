import os
import uuid
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import traceback

import sys
import webbrowser
from threading import Timer
import python_ipm2json

# Configure Flask for PyInstaller (handles the temporary extraction folder)
if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'static')
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
else:
    app = Flask(__name__)
CORS(app)

# Create an uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def validate_ipm_records(records):
    errors = []
    
    if not records:
        return {"passed": False, "errors": ["File contains no valid records."]}
        
    # Rule 3: Check header and trailer
    header = records[0]
    trailer = records[-1]
    
    has_header = header.get('mti') == '1644' and header.get('de24') == '697'
    has_trailer = trailer.get('mti') == '1644' and trailer.get('de24') == '695'
    
    if not has_header:
        errors.append("File structure is corrupted: Missing or invalid Header record (MTI 1644, DE24 697).")
    if not has_trailer:
        errors.append("File structure is corrupted: Missing or invalid Trailer record (MTI 1644, DE24 695).")
    if len(records) < 3:
        errors.append("File structure is corrupted: Missing data records.")
        
    # Rule 4: Unique File ID
    if has_header and has_trailer:
        h_file_id = header.get('pds0105')
        t_file_id = trailer.get('pds0105')
        if h_file_id != t_file_id:
            errors.append(f"Not unique File ID (PDS 0105) in header and trailer messages: Header '{h_file_id}' vs Trailer '{t_file_id}'.")
            
    # Rule 5 & 6 Variables
    total_amount = 0
    
    # Rule 2: Sequential Message Number
    last_msg_num = None
    sequential_error_added = False
    
    for i, tx in enumerate(records):
        # Rule 2 check
        curr_msg_str = tx.get('de71')
        if curr_msg_str and curr_msg_str.isdigit():
            curr_msg = int(curr_msg_str)
            if last_msg_num is not None and curr_msg != last_msg_num + 1:
                if not sequential_error_added:
                    errors.append(f"Field 71 Message Number is not filled sequentially (failed at record {i+1}).")
                    sequential_error_added = True
            last_msg_num = curr_msg
            
        # Rule 6 accum
        if 'de4' in tx and tx['de4'].isdigit():
            total_amount += int(tx['de4'])
            
        # Rule 7: PAN
        mti = tx.get('mti')
        if mti == '1240':
            if not tx.get('de2') or not tx['de2'].strip():
                errors.append(f"Primary Account Number (PAN) field is missing in MTI 1240 message (Record {i+1}).")

    # Rule 5: File Message Counts
    if has_trailer:
        msg_counts = trailer.get('pds0306')
        if msg_counts and msg_counts.isdigit():
            if int(msg_counts) != len(records):
                errors.append(f"Check value 'File Message Counts' (PDS 0306) in trailer ({int(msg_counts)}) is not equal to the number of records in the file ({len(records)}).")
        else:
            errors.append("File Message Counts (PDS 0306) missing in trailer.")
            
        # Rule 6: File Amount, Checksum
        file_amount = trailer.get('pds0301')
        if file_amount and file_amount.isdigit():
            if int(file_amount) != total_amount:
                errors.append(f"Check value 'File Amount, Checksum' (PDS 0301) in trailer ({int(file_amount)}) is not equal to the total sum of transaction amounts ({total_amount}).")
        else:
            errors.append("File Amount Checksum (PDS 0301) missing in trailer.")
            
    return {
        "passed": len(errors) == 0,
        "errors": errors
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        # Save the file temporarily
        temp_filename = f"{uuid.uuid4()}_{file.filename}"
        temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)
        
        try:
            file.save(temp_path)
            
            # Parse it using our native cardutil integration
            try:
                records = python_ipm2json.get_ipm_records(temp_path)
                validation_results = validate_ipm_records(records)
                
                return jsonify({
                    "success": True,
                    "filename": file.filename,
                    "records": records,
                    "total": len(records),
                    "validation": validation_results
                })
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to parse IPM file: {str(e)}"}), 400
                
        finally:
            # Cleanup temp file
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception as e:
                    print(f"Error removing temp file: {e}")

def open_browser():
    print("Opening browser...")
    webbrowser.open_new('http://127.0.0.1:5050/')

if __name__ == '__main__':
    print("Starting Web Viewer on http://localhost:5050")
    # Open the browser 1.5 seconds after server starts
    Timer(1.5, open_browser).start()
    
    # We use host='0.0.0.0' to ensure it binds properly on all interfaces
    # We turn debug=False because debug mode breaks PyInstaller
    app.run(host='0.0.0.0', port=5050, debug=False)
