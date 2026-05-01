# 📚 Zeno AI - Documentation Index

**Complete guide to all documentation** - find what you need quickly.

---

## 🚀 Getting Started

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| [QUICK_INSTALL.md](./QUICK_INSTALL.md) | Choose your installation method | 3 min |
| [CHEATSHEET.md](./CHEATSHEET.md) | One-page command reference | 5 min |
| [README.md](./README.md) | CLI-first ZenoTerminal overview | 10 min |

**👉 Start here:** [QUICK_INSTALL.md](./QUICK_INSTALL.md)

---

## 🤖 AI Features

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| [AI_QUICK_START.md](./AI_QUICK_START.md) | Quick start guide for AI | 3 min |
| [AI_FEATURES.md](./AI_FEATURES.md) | Complete AI documentation | 15 min |
| [API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md) | All available API keys | 2 min |

---

## 💻 Terminal Integration

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| [CLI_INTEGRATION.md](./CLI_INTEGRATION.md) | Use AI in ANY terminal | 10 min |
| [TERMINAL_SUPPORT.md](./TERMINAL_SUPPORT.md) | Support matrix for all terminals | 5 min |
| [WINDOWS_TERMINAL_SETUP.md](./WINDOWS_TERMINAL_SETUP.md) | Windows Terminal quick setup | 5 min |
| [WARP_INTEGRATION.md](./WARP_INTEGRATION.md) | Warp Terminal integration | 8 min |
| [IDE_INTEGRATION.md](./IDE_INTEGRATION.md) | Use from VS Code, JetBrains, Vim, etc. | 10 min |

---

## 🔧 Technical

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Technical implementation details | 20 min |
| [PI_ORCHESTRATOR.md](./PI_ORCHESTRATOR.md) | Multi-agent orchestration | 15 min |

---

## 📖 By Use Case

### "I want to use AI in my existing terminal"
1. [QUICK_INSTALL.md](./QUICK_INSTALL.md) - Option 1: CLI Tool
2. [TERMINAL_SUPPORT.md](./TERMINAL_SUPPORT.md) - Find your terminal
3. [CLI_INTEGRATION.md](./CLI_INTEGRATION.md) - Full CLI guide
4. [CHEATSHEET.md](./CHEATSHEET.md) - Command reference

### "I want the full ZenoTerminal app"
1. [QUICK_INSTALL.md](./QUICK_INSTALL.md) - Option 2: Full App
2. [README.md](./README.md) - Complete guide
3. [AI_FEATURES.md](./AI_FEATURES.md) - AI documentation

### "I use Windows Terminal"
1. [WINDOWS_TERMINAL_SETUP.md](./WINDOWS_TERMINAL_SETUP.md) - Quick setup
2. [CHEATSHEET.md](./CHEATSHEET.md) - Commands

### "I use Warp Terminal"
1. [WARP_INTEGRATION.md](./WARP_INTEGRATION.md) - Warp guide
2. [CLI_INTEGRATION.md](./CLI_INTEGRATION.md) - Advanced

### "I want to use AI from VS Code"
1. [IDE_INTEGRATION.md](./IDE_INTEGRATION.md) - IDE guide
2. [CLI_INTEGRATION.md](./CLI_INTEGRATION.md) - CLI basics

### "I need API keys"
1. [API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md) - All keys
2. [AI_QUICK_START.md](./AI_QUICK_START.md) - How to get keys

---

## 🎯 Quick Links

### Installation Scripts
- **Windows:** `install-cli.ps1`
- **Linux/macOS:** `install-cli.sh`
- **Launcher:** `menu.cmd` / `zeno-ai.bat` (Windows)

### Main Files
- **CLI Tool:** `zeno-ai.mjs` (Node.js)
- **CLI Wrapper:** `zeno-ai.bat` (Windows)
- **Legacy GUI:** `archive/electron-ui/main.js`
- **Config:** `config/.zeno-ai-config.json`

---

## 📋 File Tree

```
Y:\ZenoTerminal\
├── 📖 Documentation
│   ├── README.md                      ← Main guide
│   ├── QUICK_INSTALL.md               ← Start here
│   ├── CHEATSHEET.md                  ← Command reference
│   ├── DOCS_INDEX.md                  ← This file
│   │
│   ├── 🤖 AI Features
│   │   ├── AI_QUICK_START.md
│   │   ├── AI_FEATURES.md
│   │   ├── API_KEYS_REFERENCE.md
│   │   └── IMPLEMENTATION_SUMMARY.md
│   │
│   ├── 💻 Terminal Integration
│   │   ├── CLI_INTEGRATION.md
│   │   ├── TERMINAL_SUPPORT.md
│   │   ├── WINDOWS_TERMINAL_SETUP.md
│   │   ├── WARP_INTEGRATION.md
│   │   └── IDE_INTEGRATION.md
│   │
│   └── 🔧 Advanced
│       ├── PI_ORCHESTRATOR.md
│       └── ORCHESTRATOR_LINKS.md
│
├── 🚀 Installation
│   ├── install-cli.ps1                ← Windows installer
│   ├── install-cli.sh                 ← Linux/macOS installer
│   └── launchers\start.bat          ← Launch full app
│
├── 💻 CLI Tool
│   ├── zeno-ai.mjs                    ← Main CLI (Node.js)
│   ├── zeno-ai.bat                    ← Windows wrapper
│   └── .zeno-ai-config.json           ← Config (generated)
│
├── 🗄️ Legacy GUI (archived)
│   ├── archive/electron-ui/main.js    ← Electron main (archived)
│   ├── archive/electron-ui/renderer.js ← Frontend (archived)
│   ├── archive/electron-ui/preload.js  ← Bridge (archived)
│   └── archive/electron-ui/index.html  ← UI (archived)
│
└── 📦 Other
    ├── package.json
    ├── scripts/load-env-keys.js        ← API key loader
    └── node_modules/
```

---

## 🔍 Search by Topic

### Commands
- **All commands:** [CHEATSHEET.md](./CHEATSHEET.md)
- **CLI usage:** [CLI_INTEGRATION.md](./CLI_INTEGRATION.md)
- **Config:** [CLI_INTEGRATION.md](./CLI_INTEGRATION.md#configuration)

### Installation
- **Quick install:** [QUICK_INSTALL.md](./QUICK_INSTALL.md)
- **Windows:** [WINDOWS_TERMINAL_SETUP.md](./WINDOWS_TERMINAL_SETUP.md)
- **Linux/macOS:** [CLI_INTEGRATION.md](./CLI_INTEGRATION.md)

### API Keys
- **Get keys:** [API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md)
- **Configure:** [AI_QUICK_START.md](./AI_QUICK_START.md)

### Troubleshooting
- **General:** [README.md](./README.md#troubleshooting)
- **CLI issues:** [CLI_INTEGRATION.md](./CLI_INTEGRATION.md#troubleshooting)
- **Windows Terminal:** [WINDOWS_TERMINAL_SETUP.md](./WINDOWS_TERMINAL_SETUP.md#troubleshooting)

### Advanced
- **Orchestrator:** [PI_ORCHESTRATOR.md](./PI_ORCHESTRATOR.md)
- **Implementation:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **IDE integration:** [IDE_INTEGRATION.md](./IDE_INTEGRATION.md)

---

## 📊 Documentation Stats

| Category | Files | Total Words | Read Time |
|----------|-------|-------------|-----------|
| Getting Started | 3 | ~5,000 | 20 min |
| AI Features | 4 | ~8,000 | 35 min |
| Terminal Integration | 5 | ~12,000 | 50 min |
| Technical | 2 | ~6,000 | 25 min |
| **TOTAL** | **14** | **~31,000** | **~2 hours** |

---

## 🎓 Learning Path

### Beginner (30 min)
1. [QUICK_INSTALL.md](./QUICK_INSTALL.md) - 3 min
2. [CHEATSHEET.md](./CHEATSHEET.md) - 5 min
3. [WINDOWS_TERMINAL_SETUP.md](./WINDOWS_TERMINAL_SETUP.md) - 5 min (Windows only)
4. [AI_QUICK_START.md](./AI_QUICK_START.md) - 3 min
5. **Practice:** Use 5 commands - 15 min

### Intermediate (1 hour)
1. [CLI_INTEGRATION.md](./CLI_INTEGRATION.md) - 10 min
2. [AI_FEATURES.md](./AI_FEATURES.md) - 15 min
3. [TERMINAL_SUPPORT.md](./TERMINAL_SUPPORT.md) - 5 min
4. [IDE_INTEGRATION.md](./IDE_INTEGRATION.md) - 10 min (if using IDE)
5. **Practice:** Set up shortcuts, test all commands - 20 min

### Advanced (2 hours)
1. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 20 min
2. [PI_ORCHESTRATOR.md](./PI_ORCHESTRATOR.md) - 15 min
3. [README.md](./README.md) - 10 min
4. [WARP_INTEGRATION.md](./WARP_INTEGRATION.md) - 8 min (if using Warp)
5. **Experiment:** Custom integrations, advanced workflows - 1 hour

---

## 💡 Popular Pages

**Most visited:**
1. [CHEATSHEET.md](./CHEATSHEET.md) - Quick reference
2. [WINDOWS_TERMINAL_SETUP.md](./WINDOWS_TERMINAL_SETUP.md) - Windows users
3. [API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md) - Get started
4. [CLI_INTEGRATION.md](./CLI_INTEGRATION.md) - Full guide
5. [QUICK_INSTALL.md](./QUICK_INSTALL.md) - Installation

---

## 🔗 External Resources

- **GitHub:** Coming soon
- **Website:** Coming soon
- **Video Tutorial:** Coming soon

---

## 📝 Contributing

Found an issue? Want to improve docs?
- Open issue in main ZENO repo
- Submit PR with improvements

---

**Navigate like a pro! 🚀**
