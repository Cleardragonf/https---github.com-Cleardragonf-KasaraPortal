Dim args
Set args = WScript.Arguments

WScript.Echo "Arguments received: " & args.Count

If args.Count = 0 Then
	WScript.Echo "No arguments provided. Exiting script."
	WScript.Quit
End If

Dim arg1, arg2
arg1 = args(0) ' year
If args.Count > 1 Then
	arg2 = args(1) ' ##-MMM 01-Jan
Else
	arg2 = "01-Jan" ' Default value if second argument is not provided
End If

WScript.Echo "Hello, world!"
WScript.Sleep 4000  ' Wait for 4 seconds
WScript.Echo arg1 & " " & arg2
Wscript.Sleep 4000
WScript.Echo "This is a test."
Wscript.Sleep 4000
WScript.Echo "Debug - Current Line is: 57."
Wscript.Sleep 4000
WScript.Echo "Debug - Current Line is: 58."
Wscript.Sleep 4000
WScript.Echo "Debug - Current Line is: 59."
Wscript.Sleep 4000
WScript.Echo "Debug - Current Line is: 60."
Wscript.Sleep 4000
WScript.Echo "This is a test."
