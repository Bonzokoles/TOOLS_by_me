import os
import sys
import json
import csv
import xml.etree.ElementTree as ET
import urllib.request
import argparse
import time
import threading
import webbrowser
import cgi
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Standardy ZENO
WORKSPACE_PATH = Path("U:/WWW_Zen_BRo_wser_tool")
COMMS_PATH = WORKSPACE_PATH / "JIMBOKIT_COMMS"
PORT = 4658

# ==========================================
# 1. SILNIK HEADLESS ETL (DLA AGENTÓW I DUŻYCH PLIKÓW)
# ==========================================

def split_xml_file_streaming(input_path, output_prefix, split_tag_localname, chunk_size=1000):
    """
    Dzieli bardzo duży plik XML na części poprzez streaming.
    Zwraca listę wygenerowanych ścieżek do plików.
    """
    print(f"🔄 [SPLIT] Rozpoczynam dzielenie pliku: {input_path}")
    generated_files = []
    
    try:
        context = ET.iterparse(input_path, events=("start", "end"))
        _, root = next(context)

        nsmap = {k: v for k, v in root.attrib.items() if k.startswith('xmlns')}
        file_index = 1
        chunk_elements = []

        def write_chunk(elements, index):
            new_root = ET.Element(root.tag, root.attrib)
            for k, v in nsmap.items():
                new_root.set(k, v)
            for el in elements:
                new_root.append(el)
            tree = ET.ElementTree(new_root)
            filename = COMMS_PATH / f"{output_prefix}_part_{index}_02.xml"
            tree.write(str(filename), encoding='utf-8', xml_declaration=True)
            generated_files.append(str(filename))
            print(f"✅ Zapisano {filename}")

        for event, elem in context:
            tag_name = elem.tag.split('}')[-1]
            if event == "end" and tag_name == split_tag_localname:
                chunk_elements.append(elem)
                root.clear()
                if len(chunk_elements) >= chunk_size:
                    write_chunk(chunk_elements, file_index)
                    file_index += 1
                    chunk_elements = []

        if chunk_elements:
            write_chunk(chunk_elements, file_index)
            
        return generated_files
    except Exception as e:
        print(f"❌ [SPLIT BŁĄD] {e}")
        raise e

def parse_xml_to_dict(xml_string):
    """Konwertuje XML na słownik Pythona."""
    root = ET.fromstring(xml_string)
    
    def elem_to_dict(elem):
        d = {}
        for child in elem:
            child_data = elem_to_dict(child)
            if child.tag in d:
                if isinstance(d[child.tag], list):
                    d[child.tag].append(child_data)
                else:
                    d[child.tag] = [d[child.tag], child_data]
            else:
                d[child.tag] = child_data
        if not d:
            return elem.text.strip() if elem.text else ''
        return d
    
    items = []
    for child in root:
        items.append({child.tag: elem_to_dict(child)})
    
    return items if len(items) > 1 else elem_to_dict(root)

def parse_csv_to_dict(csv_string):
    """Konwertuje CSV na listę słowników."""
    lines = csv_string.strip().split('\n')
    reader = csv.DictReader(lines)
    return [row for row in reader]

def run_headless_conversion(input_source, input_format, output_name):
    """Automatyczna konwersja bez otwierania UI."""
    print(f"🔄 [HEADLESS] Pobieranie danych z: {input_source}")
    try:
        if input_source.startswith('http'):
            req = urllib.request.Request(input_source, headers={'User-Agent': 'Mozilla/5.0 ZENO/1.0'})
            with urllib.request.urlopen(req) as response:
                data = response.read().decode('utf-8')
        else:
            with open(input_source, 'r', encoding='utf-8') as f:
                data = f.read()
                
        print(f"⚙️ [HEADLESS] Parsowanie formatu: {input_format.upper()}")
        if input_format == 'xml':
            parsed_data = parse_xml_to_dict(data)
        elif input_format == 'csv':
            parsed_data = parse_csv_to_dict(data)
        elif input_format == 'json':
            parsed_data = json.loads(data)
        else:
            raise ValueError(f"Nieobsługiwany format w trybie headless: {input_format}")
            
        os.makedirs(COMMS_PATH, exist_ok=True)
        out_file = COMMS_PATH / f"{output_name}_02.json"
        
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(parsed_data, f, indent=2, ensure_ascii=False)
            
        print(f"✅ [HEADLESS] SUKCES! Zapisano do: {out_file}")
        return True
    except Exception as e:
        print(f"❌ [HEADLESS] BŁĄD KONWERSJI: {e}")
        return False


# ==========================================
# 2. SILNIK UI / BRIDGE (DLA CIEBIE)
# ==========================================

class ZenBridgeHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/save_zeno':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            filename = data.get('filename', 'converted_data')
            content = data.get('content', '')
            suffix = data.get('suffix', '_02.json')
            
            base_name = Path(filename).stem
            final_filename = f"{base_name}{suffix}"
            save_path = COMMS_PATH / final_filename
            
            os.makedirs(COMMS_PATH, exist_ok=True)
            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "path": str(save_path)}).encode())
            
        elif self.path == '/api/split_xml':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            input_path = data.get('input_path')
            split_tag = data.get('split_tag')
            chunk_size = int(data.get('chunk_size', 1000))
            
            if not os.path.exists(input_path):
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "Plik nie istnieje."}).encode())
                return
                
            try:
                base_name = Path(input_path).stem
                generated_files = split_xml_file_streaming(input_path, base_name, split_tag, chunk_size)
                
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success", 
                    "files": generated_files,
                    "message": f"Podzielono na {len(generated_files)} plików i zapisano w JIMBOKIT_COMMS/"
                }).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())
                
        else:
            self.send_error(404)

def run_ui_server():
    server = HTTPServer(('127.0.0.1', PORT), ZenBridgeHandler)
    print(f"🚀 ZenBridge UI aktywne na http://localhost:{PORT}")
    
    # Otwórz przeglądarkę
    index_path = Path(__file__).parent / "index.html"
    webbrowser.open(f"file:///{index_path.absolute()}")
    
    print("📡 Narzędzie graficzne CAY_FEED_conventer jest gotowe.")
    print("Naciśnij Ctrl+C aby zamknąć.")
    server.serve_forever()


# ==========================================
# 3. ROUTER KOMEND (CLI)
# ==========================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ZENO - CAY Feed Converter (Dual Mode)")
    parser.add_argument("--headless", action="store_true", help="Uruchom w trybie cichym (dla Agentów)")
    parser.add_argument("--input", type=str, help="Ścieżka do pliku lub URL (wymagane w --headless)")
    parser.add_argument("--format", type=str, choices=['xml', 'csv', 'json'], help="Format źródłowy (wymagane w --headless)")
    parser.add_argument("--out", type=str, default="auto_feed", help="Nazwa pliku wyjściowego bez rozszerzenia (np. 'sklep_pumo')")

    args = parser.parse_args()

    # Przełącznik trybów
    if args.headless:
        if not args.input or not args.format:
            print("❌ W trybie --headless musisz podać --input oraz --format.")
            sys.exit(1)
        
        # Wykonaj automatyczną konwersję i zamknij
        success = run_headless_conversion(args.input, args.format, args.out)
        sys.exit(0 if success else 1)
        
    else:
        # Standardowy tryb UI (Dla Ciebie)
        try:
            run_ui_server()
        except KeyboardInterrupt:
            print("\nZamykanie...")
            sys.exit(0)
