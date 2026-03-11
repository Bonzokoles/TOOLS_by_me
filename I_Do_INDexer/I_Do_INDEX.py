#!/usr/bin/env python3
"""
I_Do_INDEX v2.0 - Folder Indexer
Poprawiona wersja z MOA (Mixture of Agents)
Autor: Jimbo (OpenRouter/MoonshotAI/Kimi-k2.5)
Data: 2026-01-31

Fixes: Memory leaks, signal handling, path traversal safety, WAL cleanup
"""

import asyncio
import hashlib
import json
import os
import signal
import sqlite3
import stat as stat_module
import sys
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Set, Tuple

if sys.version_info < (3, 11):
    raise RuntimeError("Wymagany Python 3.11+ dla asyncio.TaskGroup")

try:
    import aiofiles
    import aiosqlite
    from pathspec import PathSpec
    from pathspec.patterns import GitWildMatchPattern
    from pydantic import BaseModel, ConfigDict, Field, ValidationError
except ImportError as e:
    print(f"Brakuj\u0105ca zale\u017cno\u015b\u0107: {e}")
    print("pip install pydantic aiosqlite aiofiles pathspec")
    sys.exit(1)

try:
    import magic

    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False

try:
    from PIL import Image

    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    from pymediainfo import MediaInfo

    HAS_MEDIAINFO = True
except ImportError:
    HAS_MEDIAINFO = False

try:
    import orjson

    HAS_ORJSON = True
except ImportError:
    HAS_ORJSON = False

try:
    from tqdm.asyncio import tqdm

    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False


# =============================================================================
# MODELE (Immutable, bezpieczne dla wielow\u0105tkowo\u015bci)
# =============================================================================


class HashAlgorithm(str, Enum):
    NONE = "none"
    MD5 = "md5"
    SHA256 = "sha256"


class OutputFormat(str, Enum):
    SQLITE = "sqlite"
    JSON = "json"
    JSONL = "jsonl"


class EntryType(str, Enum):
    FILE = "file"
    SYMLINK = "symlink"
    SOCKET = "socket"
    FIFO = "fifo"
    UNKNOWN = "unknown"


class FileIndexEntry(BaseModel):
    model_config = ConfigDict(frozen=True, extra="ignore")

    absolute_path: str
    relative_path: str
    filename: str
    size_bytes: int = 0
    modified_timestamp: float = 0.0
    created_timestamp: float = 0.0
    extension: str = ""
    mime_type: str = "application/octet-stream"
    entry_type: EntryType = EntryType.FILE
    md5_hash: Optional[str] = None
    sha256_hash: Optional[str] = None
    language: Optional[str] = None
    lines_of_code: Optional[int] = None
    is_binary: bool = False
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    duration_seconds: Optional[float] = None
    bit_rate: Optional[int] = None
    scan_id: str
    scanned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error_message: Optional[str] = None


# =============================================================================
# EKSTRAKTORY (Poprawione b\u0142\u0119dy logiczne)
# =============================================================================


class ExtractionResult(BaseModel):
    model_config = ConfigDict(frozen=True)
    data: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None


class BaseExtractor(ABC):
    @property
    @abstractmethod
    def cost(self) -> Literal["low", "medium", "high"]:
        pass

    @abstractmethod
    async def extract(self, file_path: str, entry: os.DirEntry) -> ExtractionResult:
        pass


class FileStatExtractor(BaseExtractor):
    @property
    def cost(self) -> Literal["low"]:
        return "low"

    async def extract(self, file_path: str, entry: os.DirEntry) -> ExtractionResult:
        try:
            stat_result = entry.stat(follow_symlinks=False)

            entry_type = EntryType.UNKNOWN
            mode = stat_result.st_mode

            if stat_module.S_ISLNK(mode):
                entry_type = EntryType.SYMLINK
            elif stat_module.S_ISREG(mode):
                entry_type = EntryType.FILE
            elif stat_module.S_ISSOCK(mode):
                entry_type = EntryType.SOCKET
            elif stat_module.S_ISFIFO(mode):
                entry_type = EntryType.FIFO

            return ExtractionResult(
                data={
                    "size_bytes": stat_result.st_size,
                    "modified_timestamp": stat_result.st_mtime,
                    "created_timestamp": stat_result.st_ctime,
                    "entry_type": entry_type,
                }
            )
        except (OSError, IOError) as e:
            return ExtractionResult(error=f"Stat error: {e}")


class MimeExtractor(BaseExtractor):
    def __init__(self):
        self._magic = None
        if HAS_MAGIC:
            try:
                self._magic = magic.Magic(mime=True, uncompress=False)
            except Exception:
                pass

    @property
    def cost(self) -> Literal["low"]:
        return "low"

    async def extract(self, file_path: str, entry: os.DirEntry) -> ExtractionResult:
        ext = Path(file_path).suffix.lower()

        mime = None
        if self._magic:
            try:
                mime = await asyncio.to_thread(self._magic.from_file, file_path)
                if mime and not mime.startswith("cannot"):
                    return ExtractionResult(data={"extension": ext, "mime_type": mime})
            except Exception:
                pass

        mime = self._guess_mime_from_ext(ext)
        return ExtractionResult(data={"extension": ext, "mime_type": mime})

    def _guess_mime_from_ext(self, ext: str) -> str:
        mapping = {
            ".py": "text/x-python",
            ".pyw": "text/x-python",
            ".js": "application/javascript",
            ".mjs": "application/javascript",
            ".ts": "application/typescript",
            ".tsx": "application/typescript",
            ".jsx": "application/javascript",
            ".json": "application/json",
            ".jsonl": "application/jsonlines",
            ".md": "text/markdown",
            ".txt": "text/plain",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mp3": "audio/mpeg",
            ".ogg": "audio/ogg",
            ".zip": "application/zip",
            ".gz": "application/gzip",
            ".tar": "application/x-tar",
            ".rar": "application/vnd.rar",
        }
        return mapping.get(ext, "application/octet-stream")


class HashExtractor(BaseExtractor):
    def __init__(
        self,
        algorithm: HashAlgorithm,
        chunk_size: int = 65536,
        max_file_size: Optional[int] = None,
    ):
        self.algorithm = algorithm
        self.chunk_size = chunk_size
        self.max_file_size = max_file_size

    @property
    def cost(self) -> Literal["high"]:
        return "high"

    async def extract(self, file_path: str, entry: os.DirEntry) -> ExtractionResult:
        if self.algorithm == HashAlgorithm.NONE:
            return ExtractionResult()

        try:
            stat_result = await asyncio.to_thread(os.stat, file_path)

            if self.max_file_size and stat_result.st_size > self.max_file_size:
                return ExtractionResult(
                    data={
                        "error_message": f"File > {self.max_file_size} bytes, hash skipped"
                    }
                )

            if not stat_module.S_ISREG(stat_result.st_mode):
                return ExtractionResult()

            hash_obj = (
                hashlib.md5(usedforsecurity=False)
                if self.algorithm == HashAlgorithm.MD5
                else hashlib.sha256()
            )

            def _hash_file():
                with open(file_path, "rb") as f:
                    while chunk := f.read(self.chunk_size):
                        hash_obj.update(chunk)
                return hash_obj.hexdigest()

            result = await asyncio.to_thread(_hash_file)
            key = "md5_hash" if self.algorithm == HashAlgorithm.MD5 else "sha256_hash"
            return ExtractionResult(data={key: result})

        except (OSError, IOError) as e:
            return ExtractionResult(error=f"Hash error: {e}")


class CodeExtractor(BaseExtractor):
    @property
    def cost(self) -> Literal["medium"]:
        return "medium"

    async def extract(self, file_path: str, entry: os.DirEntry) -> ExtractionResult:
        ext = Path(file_path).suffix.lower()
        language = self._detect_language(ext)

        if not language:
            return ExtractionResult(data={"is_binary": False})

        try:
            is_binary, lines = await asyncio.to_thread(self._analyze_file, file_path)
            return ExtractionResult(
                data={
                    "language": None if is_binary else language,
                    "lines_of_code": lines if not is_binary else None,
                    "is_binary": is_binary,
                }
            )
        except Exception as e:
            return ExtractionResult(error=str(e))

    def _detect_language(self, ext: str) -> Optional[str]:
        mapping = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".jsx": "javascript",
            ".tsx": "typescript",
            ".rs": "rust",
            ".go": "go",
            ".java": "java",
            ".c": "c",
            ".cpp": "cpp",
            ".h": "c",
            ".hpp": "cpp",
            ".rb": "ruby",
            ".php": "php",
            ".sh": "shell",
            ".bash": "shell",
            ".zsh": "shell",
            ".ps1": "powershell",
            ".sql": "sql",
            ".html": "html",
            ".css": "css",
            ".scss": "scss",
            ".sass": "sass",
            ".yaml": "yaml",
            ".yml": "yaml",
            ".toml": "toml",
            ".json": "json",
            ".xml": "xml",
            ".md": "markdown",
            ".swift": "swift",
            ".kt": "kotlin",
            ".kts": "kotlin",
        }
        return mapping.get(ext)

    def _analyze_file(self, file_path: str) -> Tuple[bool, int]:
        try:
            with open(file_path, "rb") as f:
                chunk = f.read(4096)
                is_binary = b"\0" in chunk

                if is_binary:
                    return True, 0

                f.seek(0)
                content = f.read()
                lines = content.count(b"\n")
                if content and not content.endswith(b"\n"):
                    lines += 1
                return False, lines
        except:
            return True, 0


class MediaExtractor(BaseExtractor):
    @property
    def cost(self) -> Literal["high"]:
        return "high"

    async def extract(self, file_path: str, entry: os.DirEntry) -> ExtractionResult:
        ext = Path(file_path).suffix.lower()
        result = {}

        if HAS_PIL and ext in {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
            ".tiff",
            ".tif",
        }:
            try:

                def _get_image_meta():
                    with Image.open(file_path) as img:
                        return img.size

                width, height = await asyncio.to_thread(_get_image_meta)
                result.update({"image_width": width, "image_height": height})
            except Exception:
                pass

        if HAS_MEDIAINFO and ext in {
            ".mp4",
            ".avi",
            ".mkv",
            ".mov",
            ".webm",
            ".flv",
            ".wmv",
            ".mp3",
            ".wav",
            ".flac",
            ".aac",
            ".ogg",
            ".wma",
            ".m4a",
        }:
            try:
                media_info = await asyncio.to_thread(MediaInfo.parse, file_path)
                for track in media_info.tracks:
                    if track.track_type == "General":
                        if track.duration:
                            result["duration_seconds"] = float(track.duration) / 1000
                    elif track.track_type in ("Video", "Audio"):
                        if track.bit_rate:
                            result["bit_rate"] = int(track.bit_rate)
                        if track.duration:
                            result["duration_seconds"] = float(track.duration) / 1000
            except Exception:
                pass

        return ExtractionResult(data=result)


# =============================================================================
# SCANNER (Poprawione bezpiecze\u0144stwo \u015bcie\u017cek)
# =============================================================================


@dataclass
class ScanConfig:
    root_path: str
    max_depth: int = -1
    exclude_patterns: List[str] = field(default_factory=list)
    follow_symlinks: bool = False
    include_hidden: bool = False
    skip_permission_errors: bool = True


class AsyncScanner:
    def __init__(self, config: ScanConfig):
        self.config = config
        self.root_path = Path(config.root_path).resolve()
        if not self.root_path.exists():
            raise ValueError(f"Path does not exist: {self.root_path}")

        self.spec = PathSpec.from_lines(GitWildMatchPattern, config.exclude_patterns)
        self.seen_inodes: Set[Tuple[int, int]] = set()

        self._scanned = 0
        self._errors = 0

    @property
    def scanned_count(self) -> int:
        return self._scanned

    @property
    def error_count(self) -> int:
        return self._errors

    async def scan(self, queue: asyncio.Queue) -> None:
        stack: List[Tuple[Path, int]] = [(self.root_path, 0)]

        while stack:
            current_path, depth = stack.pop()

            if self.config.max_depth >= 0 and depth > self.config.max_depth:
                continue

            try:
                entries = await asyncio.to_thread(list, os.scandir(current_path))
            except PermissionError:
                if not self.config.skip_permission_errors:
                    raise
                self._errors += 1
                continue
            except Exception as e:
                self._errors += 1
                continue

            for entry in reversed(entries):
                try:
                    if not self.config.include_hidden and entry.name.startswith("."):
                        continue

                    try:
                        abs_path = Path(entry.path).resolve()
                        rel_path = abs_path.relative_to(self.root_path)
                        rel_path_str = str(rel_path).replace("\\", "/")
                    except ValueError:
                        if not self.config.follow_symlinks:
                            continue
                        rel_path_str = entry.name

                    if self.spec.match_file(rel_path_str):
                        continue

                    if entry.is_symlink():
                        if not self.config.follow_symlinks:
                            continue
                        try:
                            stat = os.stat(entry.path)
                            inode_key = (stat.st_dev, stat.st_ino)
                            if inode_key in self.seen_inodes:
                                continue
                            self.seen_inodes.add(inode_key)
                        except (OSError, IOError):
                            continue

                    if entry.is_dir(follow_symlinks=False):
                        stack.append((Path(entry.path), depth + 1))
                    elif entry.is_file(follow_symlinks=False):
                        await queue.put((entry, rel_path_str))
                        self._scanned += 1

                except Exception:
                    self._errors += 1

        await queue.put(None)


# =============================================================================
# WRITERS (Poprawione: streaming, WAL cleanup, transakcje)
# =============================================================================


class BaseWriter(ABC):
    @abstractmethod
    async def write(self, entry: FileIndexEntry) -> None:
        pass

    @abstractmethod
    async def close(self) -> None:
        pass


class SQLiteWriter(BaseWriter):
    def __init__(self, db_path: str, batch_size: int = 1000):
        self.db_path = db_path
        self.batch_size = batch_size
        self.buffer: List[FileIndexEntry] = []
        self.conn: Optional[aiosqlite.Connection] = None
        self._lock = asyncio.Lock()
        self._total_written = 0

    async def _init_db(self) -> None:
        self.conn = await aiosqlite.connect(self.db_path, timeout=30.0)

        await self.conn.execute("PRAGMA journal_mode=WAL")
        await self.conn.execute("PRAGMA synchronous=NORMAL")
        await self.conn.execute("PRAGMA cache_size=-1048576")
        await self.conn.execute("PRAGMA temp_store=MEMORY")
        await self.conn.execute("PRAGMA mmap_size=268435456")

        await self.conn.execute("""
            CREATE TABLE IF NOT EXISTS file_index (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_id TEXT NOT NULL,
                absolute_path TEXT NOT NULL,
                relative_path TEXT NOT NULL,
                filename TEXT NOT NULL,
                size_bytes INTEGER DEFAULT 0,
                modified_timestamp REAL,
                created_timestamp REAL,
                extension TEXT,
                mime_type TEXT,
                entry_type TEXT,
                md5_hash TEXT,
                sha256_hash TEXT,
                language TEXT,
                lines_of_code INTEGER,
                is_binary INTEGER DEFAULT 0,
                image_width INTEGER,
                image_height INTEGER,
                duration_seconds REAL,
                bit_rate INTEGER,
                scanned_at TEXT,
                error_message TEXT,
                UNIQUE(scan_id, absolute_path) ON CONFLICT REPLACE
            )
        """)

        await self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_scan_id ON file_index(scan_id)"
        )
        await self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_path ON file_index(absolute_path)"
        )
        await self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_hash ON file_index(sha256_hash)"
        )
        await self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_mtime ON file_index(modified_timestamp)"
        )

        await self.conn.commit()

    async def write(self, entry: FileIndexEntry) -> None:
        if self.conn is None:
            await self._init_db()

        async with self._lock:
            self.buffer.append(entry)
            if len(self.buffer) >= self.batch_size:
                await self._flush()

    async def _flush(self) -> None:
        if not self.buffer or not self.conn:
            return

        rows = []
        for e in self.buffer:
            rows.append(
                (
                    e.scan_id,
                    e.absolute_path,
                    e.relative_path,
                    e.filename,
                    e.size_bytes,
                    e.modified_timestamp,
                    e.created_timestamp,
                    e.extension,
                    e.mime_type,
                    e.entry_type.value,
                    e.md5_hash,
                    e.sha256_hash,
                    e.language,
                    e.lines_of_code,
                    int(e.is_binary),
                    e.image_width,
                    e.image_height,
                    e.duration_seconds,
                    e.bit_rate,
                    e.scanned_at.isoformat(),
                    e.error_message,
                )
            )

        try:
            await self.conn.executemany(
                """
                INSERT INTO file_index VALUES (
                    NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            """,
                rows,
            )
            await self.conn.commit()
            self._total_written += len(rows)
        except Exception as e:
            print(f"B\u0142\u0105d zapisu do SQLite: {e}", file=sys.stderr)
            raise

        self.buffer = []

    async def close(self) -> None:
        await self._flush()
        if self.conn:
            await self.conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")
            await self.conn.close()
            print(f"Zapisano {self._total_written} rekord\u00f3w do SQLite")


class JSONWriter(BaseWriter):
    def __init__(self, file_path: str):
        self.file_path = file_path
        self._first = True
        self._file = None
        self._count = 0

    async def write(self, entry: FileIndexEntry) -> None:
        if self._file is None:
            self._file = await aiofiles.open(self.file_path, "w", encoding="utf-8")
            await self._file.write("[\n")

        prefix = "  " if self._first else ",\n  "
        self._first = False

        if HAS_ORJSON:
            data = orjson.dumps(entry.model_dump()).decode("utf-8")
        else:
            data = json.dumps(entry.model_dump(), default=str, ensure_ascii=False)

        await self._file.write(prefix + data)
        self._count += 1

    async def close(self) -> None:
        if self._file:
            ending = "\n]" if not self._first else "]"
            await self._file.write(ending)
            await self._file.close()
            print(f"Zapisano {self._count} rekord\u00f3w do JSON")


class JSONLWriter(BaseWriter):
    def __init__(
        self, file_path: str, flush_every: int = 500, flush_timeout: float = 5.0
    ):
        self.file_path = file_path
        self.flush_every = flush_every
        self.flush_timeout = flush_timeout
        self.buffer: List[str] = []
        self._file = None
        self._count = 0
        self._last_flush = asyncio.get_event_loop().time()
        self._lock = asyncio.Lock()

    async def write(self, entry: FileIndexEntry) -> None:
        async with self._lock:
            if HAS_ORJSON:
                line = orjson.dumps(entry.model_dump()).decode("utf-8")
            else:
                line = json.dumps(entry.model_dump(), default=str, ensure_ascii=False)

            self.buffer.append(line)
            self._count += 1

            now = asyncio.get_event_loop().time()
            if (
                len(self.buffer) >= self.flush_every
                or (now - self._last_flush) > self.flush_timeout
            ):
                await self._flush()

    async def _flush(self) -> None:
        if not self.buffer:
            return

        if self._file is None:
            self._file = await aiofiles.open(self.file_path, "w", encoding="utf-8")

        await self._file.write("\n".join(self.buffer) + "\n")
        self.buffer = []
        self._last_flush = asyncio.get_event_loop().time()

    async def close(self) -> None:
        async with self._lock:
            await self._flush()
            if self._file:
                await self._file.close()
            print(f"Zapisano {self._count} rekord\u00f3w do JSONL")


# =============================================================================
# ORCHESTRATOR
# =============================================================================


class MetadataOrchestrator:
    def __init__(
        self,
        extractors: List[BaseExtractor],
        writer: BaseWriter,
        max_concurrent: int = 50,
        scan_id: Optional[str] = None,
        progress_bar: bool = True,
    ):
        self.extractors = extractors
        self.writer = writer
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.scan_id = scan_id or str(uuid.uuid4())
        self.processed = 0
        self.failed = 0
        self.progress_bar = progress_bar and HAS_TQDM
        self._shutdown_event = asyncio.Event()

    async def process_queue(self, queue: asyncio.Queue, root_path: Path) -> None:
        tasks = set()
        pbar = None

        if self.progress_bar:
            pbar = tqdm(desc="Processing", unit="files")

        try:
            while True:
                if self._shutdown_event.is_set():
                    break

                try:
                    item = await asyncio.wait_for(queue.get(), timeout=0.5)
                except asyncio.TimeoutError:
                    continue

                if item is None:
                    break

                entry, rel_path = item

                while len(tasks) >= self.semaphore._value * 2:
                    done, tasks = await asyncio.wait(
                        tasks, return_when=asyncio.FIRST_COMPLETED
                    )
                    for task in done:
                        exc = task.exception()
                        if exc:
                            print(f"Task error: {exc}", file=sys.stderr)

                task = asyncio.create_task(
                    self._process_single_file(entry, rel_path, root_path)
                )
                tasks.add(task)

                if pbar:
                    pbar.update(0)

            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

        finally:
            if pbar:
                pbar.close()
            await self.writer.close()

    async def _process_single_file(
        self, entry: os.DirEntry, rel_path: str, root_path: Path
    ) -> None:
        async with self.semaphore:
            if self._shutdown_event.is_set():
                return

            errors = []
            data = {
                "absolute_path": str(Path(entry.path).resolve()),
                "relative_path": rel_path,
                "filename": entry.name,
                "scan_id": self.scan_id,
            }

            for extractor in self.extractors:
                try:
                    result = await extractor.extract(entry.path, entry)
                    if result.error:
                        errors.append(f"{extractor.__class__.__name__}: {result.error}")
                    data.update(result.data)
                except Exception as e:
                    errors.append(f"{extractor.__class__.__name__}: {str(e)}")

            if errors:
                data["error_message"] = "; ".join(errors)

            try:
                entry_obj = FileIndexEntry(**data)
                await self.writer.write(entry_obj)
                self.processed += 1
            except ValidationError as e:
                self.failed += 1
                print(f"Validation error for {entry.path}: {e}", file=sys.stderr)
            except Exception as e:
                self.failed += 1
                print(f"Write error for {entry.path}: {e}", file=sys.stderr)

    def shutdown(self):
        self._shutdown_event.set()


# =============================================================================
# CLI
# =============================================================================


def setup_signal_handlers(orchestrator: MetadataOrchestrator):
    def handler(signum, frame):
        print("\nOtrzymano sygna\u0142 zako\u0144czenia, zamykanie...", file=sys.stderr)
        orchestrator.shutdown()

    signal.signal(signal.SIGINT, handler)
    signal.signal(signal.SIGTERM, handler)


async def run_scan(config: ScanConfig, args: Dict[str, Any]) -> None:
    queue = asyncio.Queue(maxsize=5000)
    scanner = AsyncScanner(config)

    output_path = args["output"]
    fmt = args["format"]

    if fmt == OutputFormat.SQLITE:
        writer = SQLiteWriter(output_path)
    elif fmt == OutputFormat.JSON:
        writer = JSONWriter(output_path)
    else:
        writer = JSONLWriter(output_path)

    extractors: List[BaseExtractor] = [
        FileStatExtractor(),
        MimeExtractor(),
    ]

    if args.get("hash_algo") and args["hash_algo"] != HashAlgorithm.NONE:
        max_size = args.get("max_hash_size", 100 * 1024 * 1024)
        extractors.append(HashExtractor(args["hash_algo"], max_file_size=max_size))

    if args.get("code_stats"):
        extractors.append(CodeExtractor())

    if args.get("media_meta"):
        extractors.append(MediaExtractor())

    orchestrator = MetadataOrchestrator(
        extractors=extractors,
        writer=writer,
        max_concurrent=args.get("workers", 50),
        progress_bar=args.get("progress", True),
    )

    setup_signal_handlers(orchestrator)

    start_time = datetime.now(timezone.utc)

    scanner_task = asyncio.create_task(scanner.scan(queue))
    processor_task = asyncio.create_task(
        orchestrator.process_queue(queue, Path(config.root_path))
    )

    try:
        await scanner_task
        await processor_task
    except Exception as e:
        print(f"B\u0142\u0105d krytyczny: {e}", file=sys.stderr)
        raise

    duration = (datetime.now(timezone.utc) - start_time).total_seconds()

    print(f"\n{'=' * 50}")
    print(f"Czas wykonania: {duration:.2f}s")
    print(f"Przeskanowano: {scanner.scanned_count}")
    print(f"Przetworzono: {orchestrator.processed}")
    print(f"B\u0142\u0119dy skanera: {scanner.error_count}")
    print(f"B\u0142\u0119dy procesora: {orchestrator.failed}")
    print(f"Wydajno\u015b\u0107: {orchestrator.processed / max(duration, 0.001):.0f} plik\u00f3w/sek")
    print(f"Wynik: {output_path}")
    print(f"{'=' * 50}")


def main():
    try:
        import typer
        from typing_extensions import Annotated

        app = typer.Typer(
            help="I_Do_INDEX v2.0 - Zaawansowany system indeksowania",
            add_completion=False,
        )

        @app.command()
        def scan(
            path: Annotated[str, typer.Argument(help="\u015acie\u017cka do zeskanowania")],
            output: Annotated[str, typer.Option("--output", "-o")] = "index.db",
            format: Annotated[
                OutputFormat, typer.Option("--format", "-f")
            ] = OutputFormat.SQLITE,
            max_depth: Annotated[int, typer.Option("--max-depth", "-d")] = -1,
            exclude: Annotated[
                Optional[List[str]], typer.Option("--exclude", "-e")
            ] = None,
            no_default_excludes: Annotated[
                bool, typer.Option("--no-default-excludes")
            ] = False,
            hash_algo: Annotated[
                HashAlgorithm, typer.Option("--hash")
            ] = HashAlgorithm.NONE,
            max_hash_size: Annotated[int, typer.Option("--max-hash-size")] = 100
            * 1024
            * 1024,
            code_stats: Annotated[bool, typer.Option("--code-stats")] = False,
            media_meta: Annotated[bool, typer.Option("--media-meta")] = False,
            workers: Annotated[int, typer.Option("--workers", "-w")] = 50,
            follow_symlinks: Annotated[bool, typer.Option("--follow-symlinks")] = False,
            include_hidden: Annotated[bool, typer.Option("--include-hidden")] = False,
            progress: Annotated[bool, typer.Option("--progress/--no-progress")] = True,
        ):
            default_excludes = [
                "node_modules/",
                ".git/",
                "__pycache__/",
                ".venv/",
                "*.pyc",
                ".DS_Store",
            ]
            patterns = []
            if not no_default_excludes:
                patterns.extend(default_excludes)
            if exclude:
                patterns.extend(exclude)

            config = ScanConfig(
                root_path=path,
                max_depth=max_depth,
                exclude_patterns=patterns,
                follow_symlinks=follow_symlinks,
                include_hidden=include_hidden,
            )

            args = {
                "output": output,
                "format": format,
                "hash_algo": hash_algo,
                "max_hash_size": max_hash_size,
                "code_stats": code_stats,
                "media_meta": media_meta,
                "workers": workers,
                "progress": progress,
            }

            asyncio.run(run_scan(config, args))

        app()

    except ImportError:
        print("Instalacja: pip install typer")
        sys.exit(1)


if __name__ == "__main__":
    main()
