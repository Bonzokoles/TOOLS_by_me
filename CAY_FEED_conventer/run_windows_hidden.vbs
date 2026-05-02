' CAY_XLM_FEED_Converter - VBS Launcher (ZENO Standard)
' Uruchamia zen_bridge.py bez widocznego okna CMD, zachowując 100% użyteczności.

Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Skrypt py uruchamiany prosto przez pythonw.exe (ukryty proces)
strCmd = "pythonw.exe """ & strPath & "\zen_bridge.py"""

' Uruchom ukrycie (0)
objShell.Run strCmd, 0, False

' Wyświetl potwierdzenie
objShell.Popup "✅ Silnik ZENO Converter & Streaming API uruchomione w tle!" & vbCrLf & "Otwieram aplikację graficzną...", 3, "ZENO Converter", 64
