import sys
import json
import logging
from cardutil.mciipm import IpmReader, MciIpmDataError

def parse_de43(de43_str):
    if not isinstance(de43_str, str):
        return {}
    
    # Clean up non-printable chars that might have been decoded
    de43_str = "".join([c if ord(c) >= 32 else " " for c in de43_str])
    
    if len(de43_str) < 38:
        return {"s2": de43_str}
        
    s1 = de43_str[0:22].strip()
    s2 = de43_str[22:47].strip()
    s3 = de43_str[47:60].strip()
    s4 = de43_str[60:63].strip()
    s5 = de43_str[63:73].strip()
    s6 = de43_str[73:76].strip()
    
    return {"s1": s1, "s2": s2, "s3": s3, "s4": s4, "s5": s5, "s6": s6}

def parse_de12(de12_str):
    if not isinstance(de12_str, str):
        return {}
    if len(de12_str) >= 19:
        # "2026-05-20 23:18:46"
        yy = de12_str[2:4]
        mm = de12_str[5:7]
        dd = de12_str[8:10]
        hh = de12_str[11:13]
        mn = de12_str[14:16]
        ss = de12_str[17:19]
        return {"s1": yy+mm+dd, "s2": hh+mn+ss}
    elif len(de12_str) == 12:
        # "YYMMDDHHMMSS"
        return {"s1": de12_str[0:6], "s2": de12_str[6:12]}
    return {"s1": de12_str}

def parse_de3(de3_str):
    if not isinstance(de3_str, str) or len(de3_str) != 6:
        return {}
    return {"s1": de3_str[0:2], "s2": de3_str[2:4], "s3": de3_str[4:6]}

def get_ipm_records(filepath):
    results = []
    try:
        with open(filepath, 'rb') as f:
            reader = IpmReader(f, encoding='cp500', blocked=True)
            for record in reader:
                parsed_tx = {}
                
                # Basic fields
                for k, v in record.items():
                    if k.startswith("DE") and k[2:].isdigit():
                        parsed_tx[k.lower()] = str(v)
                    elif k == "MTI":
                        parsed_tx["mti"] = str(v)
                    elif k.startswith("PDS"):
                        parsed_tx[k.lower()] = str(v)
                        
                # Compound fields
                if "DE3" in record:
                    parsed_tx["de3"] = parse_de3(str(record["DE3"]))
                    
                if "DE12" in record:
                    parsed_tx["de12"] = parse_de12(str(record["DE12"]))
                    
                if "DE22" in record:
                    de22_str = str(record["DE22"])
                    parsed_tx["de22"] = {f"s{i+1}": ch for i, ch in enumerate(de22_str)}
                    
                if "DE31" in record:
                    parsed_tx["de31"] = {"s4": str(record["DE31"])}
                    
                if "DE43" in record:
                    parsed_tx["de43"] = parse_de43(str(record["DE43"]))
                    
                # EMV Tags from DE55
                de55 = {}
                for k, v in record.items():
                    if k.startswith("TAG"):
                        de55[k.lower()] = str(v)
                if de55:
                    parsed_tx["de55"] = de55
                    
                results.append(parsed_tx)
                
    except Exception as e:
        raise Exception(f"Error parsing IPM file: {e}")
        
    if not results:
        raise Exception("No valid IPM records found in the file. Ensure it is a valid MasterCard IPM clearing file.")
        
    return results

def convert_ipm(filepath):
    try:
        results = get_ipm_records(filepath)
        print(json.dumps(results))
    except Exception as e:
        sys.stderr.write(str(e) + "\n")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python_ipm2json.py [-u] <filepath>\n")
        sys.exit(1)
        
    # Handle optional -u flag passed by ipm_viewer_app.py
    filepath = sys.argv[-1]
    convert_ipm(filepath)
