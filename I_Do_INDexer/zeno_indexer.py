import os
import sys
import json
import asyncio
import argparse
from pathlib import Path
from datetime import datetime

# Importuj logikę z głównego pliku (zakładamy że I_Do_INDEX.py jest w tym samym folderu)
# Ponieważ I_Do_INDEX ma skomplikowany system importów i Typer, 
# najbezpieczniej będzie wywołać go jako podproces lub zaimportować wybrane funkcje.
# Wybieramy wywołanie subprocess, aby zachować izolację venv.

WORKSPACE_PATH = Path("U:/WWW_Zen_BRo_wser_tool")
COMMS_PATH = WORKSPACE_PATH / "JIMBOKIT_COMMS"
PYTHON_EXE = Path(__file__).parent / ".venv" / "Scripts" / "python.exe"

if not PYTHON_EXE.exists():
    PYTHON_EXE = "python" # fallback

async def run_zeno_index(path_to_scan, output_name, format="sqlite"):
    """
    Uruchamia indeksowanie w standardzie ZENO.
    Zapisuje wynik do JIMBOKIT_COMMS z sufiksem _01.
    """
    os.makedirs(COMMS_PATH, exist_ok=True)
    
    suffix = ".db" if format == "sqlite" else ".jsonl"
    output_path = COMMS_PATH / f"{output_name}_01{suffix}"
    
    cmd = [
        str(PYTHON_EXE),
        "I_Do_INDEX.py",
        "scan",
        str(path_to_scan),
        "--output", str(output_path),
        "--format", format,
        "--progress" # włączamy progress dla widoczności w logach
    ]
    
    print(f"🚀 [ZENO INDEX] Rozpoczynam indeksowanie: {path_to_scan}")
    print(f"📂 [ZENO INDEX] Cel: {output_path}")
    
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    
    stdout, stderr = await process.communicate()
    
    if process.returncode == 0:
        print(f"✅ [ZENO INDEX] SUKCES. Plik _01 gotowy.")
        return str(output_path)
    else:
        print(f"❌ [ZENO INDEX] BŁĄD: {stderr.decode()}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ZENO I_Do_INDEX Wrapper")
    parser.add_argument("path", help="Folder do zeskanowania")
    parser.add_argument("--name", default="workspace_index", help="Nazwa pliku wynikowego")
    parser.add_argument("--format", default="sqlite", choices=["sqlite", "jsonl"])
    
    args = parser.parse_args()
    
    asyncio.run(run_zeno_index(args.path, args.name, args.format))
