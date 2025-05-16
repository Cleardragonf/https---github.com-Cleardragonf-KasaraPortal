Const ForReading = 1

Dim ReadFile
Dim objTransRep
Dim objShell
Dim intTRDGCnt, intSRCHCnt
Dim intFolderYear, intFolderMonth
Dim strMonthFolder, strYearFolder, strFolderType
Dim strTrans
Dim strSchema
Dim objTransFolder
'Dim objMTRCon
Dim strZipTempFolder
'Dim objNetwork
Dim filesys
Set fso = CreateObject( "Scripting.FileSystemObject" )
Set objFSO = CreateObject("Scripting.FileSystemObject")
'Set objMTRCon = CreateObject("ADODB.Connection")
'Set objNetwork = CreateObject("WScript.Network")

Call Set32Bit

WScript.Echo "Script started."

' Select Case objNetwork.ComputerName
		
'		Case "BF100X25"
'             objMTRCon.Open _
'             "Provider=SQLOLEDB;Data Source=STNSQLAG1.NE.GOV;" & _
'             "Trusted_Connection=No;Initial Catalog=EDI_NECustom;" & _
'             "User ID=EDI_TM_APPID_P;Password=Edif3c$Prod;"
'             strSQLDatabase = "EDI_NECustom"
'              
'    Case "BF110X25"
'      objMTRCon.Open _
'      "Provider=SQLOLEDB;Data Source=STNSQLCATAG1.NE.GOV;" & _
'        "Trusted_Connection=No;Initial Catalog=EDI_TP_NECustom;" & _
'             "User ID=EDI_TM_APPID_T;Password=Edif3c$2016;"
'              strSQLDatabase = "EDI_TP_NECustom"
'
'		Case "BF110X16"
'      objMTRCon.Open _
'      "Provider=SQLOLEDB;Data Source=STNSQLDEV01.NE.GOV;" & _
'        "Trusted_Connection=No;Initial Catalog=EDI_ST_NECustom;" & _
''            "User ID=EDI_TM_APPID_T;Password=Edif3c$2016;"
'             strSQLDatabase = "EDI_ST_NECustom"	
'				
'		Case "BF110X11"	
'      objMTRCon.Open _
'      "Provider=SQLOLEDB;Data Source=STNSQLDEV01.NE.GOV;" & _
'        "Trusted_Connection=No;Initial Catalog=EDI_DEV_NECustom;" & _
'             "User ID=EDI_TM_APPID_T;Password=Edif3c$2016;"
'             strSQLDatabase = "EDI_DEV_NECustom"
' End Select
	
   'TransFolderPath = "\\dhhsfs1.hhss.local\epm$\_TranslatorTeam\Swapna\MedNE"
  TransFolderPath = "D:\ecedigs\PF_PostOffice\Medicaid\MedNE"
  'TransFolderPath = "H:\ecedigs\PF_PostOffice\Medicaid\MedNE"
  ReportFolderPath = "D:\ArchData\Trans_Count_Reports\MedNE"

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


Set objTransFolder = objFSO.GetFolder(TransFolderPath)
WScript.Echo "Processing folder: " & TransFolderPath

'***************************** Date Manipulation for Files **********************************************
intFolderYear = arg1
'intFolderMonth = 11
'intFolderMonth  = (Month(Date))
intFolderMonth  = arg2
'intFolderMonth  = Right ("0" & Month(DateAdd("m", -1, Date)), 2)
strYearFolder = intFolderYear
strFolderType = "MedNE"

Select Case 	intFolderMonth						
			Case 01
					strMonthFolder = "01-Jan"
						Case 02
								strMonthFolder = "02-Feb"
						Case 03
								strMonthFolder = "03-Mar"
						Case 04
								strMonthFolder = "04-Apr"
						Case 05
								strMonthFolder = "05-May"
						Case 06
								strMonthFolder = "06-Jun"
						Case 07
								strMonthFolder = "07-Jul"
						Case 08
								strMonthFolder = "08-Aug"
						Case 09
								strMonthFolder = "09-Sep"
						Case 10
								strMonthFolder = "10-Oct"
						Case 11
								strMonthFolder = "11-Nov"
						Case 12
								strMonthFolder = "12-Dec"	
	End Select	
'***************************** END Date Manipulation for Files **********************************************

' Select Case objNetwork.ComputerName
'		Case "BF110X11"
'			strSchema = "dbo"
'		Case "BF110X16"
'			strSchema = "dbo"
'		Case "BF110X25"
'			strSchema = "dbo"
'		Case "BF100X25"
'			strSchema = "dbo"
'		Case Other
' 		       WScript.Quit
'	End Select

 If not fso.FolderExists(ReportFolderPath & "\" & strYearFolder) then 

   ' If it gets here then the folder for the current date does not yet exist and 
   ' therefore is created. 
   Set objFolder = fso.CreateFolder(ReportFolderPath & "\" & strYearFolder) 
 End If

 If not fso.FolderExists(ReportFolderPath & "\" & strYearFolder & "\" & strMonthFolder) then 
   ' If it gets here then the folder for the current date does not yet exist and 
   ' therefore is created. 
   Set objFolder = fso.CreateFolder(ReportFolderPath & "\" & strYearFolder & "\" & strMonthFolder) 
 End If

 For Each objTransFolder In objFSO.GetFolder(TransFolderPath).SubFolders
   'strTrans = objFolder.Path
    strTrans = objTransFolder.Name
    'Wscript.Echo objTransFolder.Name 'Vidya
	objStartFolder = TransFolderPath & "\" & strTrans & "\Archive\" & strYearFolder & "\" & strMonthFolder
    strDateStrip = Replace(Date,"/","_")
	strFileOutput = ReportFolderPath & "\" & strYearFolder & "\" & strMonthFolder & "\" & strTrans & "_COUNT_RPT.txt"	
	'Wscript.Echo strFileOutput
	'MsgBox objStartFolder

	Set objShell = Wscript.CreateObject("WScript.Shell")
	Set objZipFolder = objFSO.GetFolder(objStartFolder)

intTRDGCnt = 0
intSRCHCnt = 0


'Unzip Folders to process
    For Each objFile In objZipFolder.Files

      If ObjZipFolder.files.Count <> 0 Then
	      strZipTempFolder = objStartFolder & "\UNZIP_" & objFile.Name
					
					If objFSO.FolderExists(strZipTempFolder) = False Then
						objFSO.CreateFolder(strZipTempFolder)
					End If
					'Wscript.Echo objStartFolder & "\" & objFile.Name 'Vidya
					'Call subRunCMD("wzunzip " & objStartFolder & "\" & objFile.Name & " " & strZipTempFolder, True)
					Call subRunCMD("7z x " & objStartFolder & "\" & objFile.Name & " -o" & strZipTempFolder, True)
      End If
	  Next


'Wscript.Echo ObjZipFolder.files.Count
'MsgBox ObjZipFolder.files.Count
If ObjZipFolder.files.Count <> 0 Then
	 Set objTransRep = objFSO.CreateTextFile(strFileOutput, True)
	 objTransRep.WriteLine strDateStrip
    objTransRep.WriteLine "FILE NAME                                                        TRANS SET      TRANS    "
    objTransRep.WriteLine "------------------------------------------------------------     ----------     ----------"
    Set objFolder = objFSO.GetFolder(strZipTempFolder)					
    Set colFiles = objFolder.Files

    For Each objFile in colFiles	
      Select Case 	strTrans						
						Case "270"
								strSrchTransSet = "PRSNORG     TRDG "
								strSrchTrans = "PRSNORG     SRCH1 "
						Case "271"
								strSrchTransSet = "NEBRASKA MEDICAID"
								strSrchTrans = "NM1IL"
						Case "277CA"
								strSrchTransSet = "NM141"
								strSrchTrans = "NM1QC"
						Case "278RS"
								strSrchTransSet = "ST\*278"
								strSrchTrans = "NM1\*QC\*"
						Case "820"
								strSrchTransSet = "N1PE"
								strSrchTrans = "NM1QE"
						Case "834"
								strSrchTransSet = "N1IN"
								strSrchTrans = "INSY"
						Case "835"
								strSrchTransSet = "N1PE"
								strSrchTrans = "NM1QC"
						Case "837"
								strSrchTransSet = "PRSNORG     TRDG "
								strSrchTrans = "INSTCLM"
		End Select	
'		Wscript.Echo 		strSrchTransSet
  'If  Mid(objFile.Name,1,4) <> "MMIS"	Then
	
	 If  (Mid(objFile.Name,1,4) = "MMIS") OR (Mid(objFile.Name,1,3) = "NFO") Then
	  ReadFile = strZipTempFolder & "\" & objFile.Name
	  'Set ReadFile = filesys.GetFile(strZipTempFolder & "\" & objFile.Name)
  	  'Wscript.echo    "File Name: " & objFile.Name 'Vidya
	  Set textFile = fso.OpenTextFile( ReadFile, ForReading )
	 	  'Set textFile = ReadFile.OpenAsTextStream(2, -2)
	  contents = textFile.ReadAll
	  textFile.Close
	
	  Set rgxp = New Regexp
	  rgxp.Pattern = strSrchTransSet
	  'rgxp.Pattern = "ST\*271"
	  rgxp.IgnoreCase = False
	  rgxp.Global = True
	  Set matches = rgxp.Execute( contents )
	
	  Set rgxp2 = New Regexp
	  rgxp2.Pattern = strSrchTrans
	  'rgxp2.Pattern = "\*22\*0"
	  rgxp2.IgnoreCase = False
	  rgxp2.Global = True
	  Set matches2 = rgxp2.Execute( contents )
	
      txt = RightJustified(objFile.Name, 60) & RightJustified(matches.Count, 15) & RightJustified(matches2.Count, 15)
      intTRDGCnt = intTRDGCnt + matches.Count
      intSRCHCnt = intSRCHCnt + matches2.Count
      objTransRep.WriteLine txt
			End If
Next
'objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Counts" & _
' 				"(  Fldr_Type " & _
' 				    ",Trans_Type " & _
'                    ",Year " & _
'                    ",Fldr_Dte " & _
'                    ",Trans_Set_Cnt " & _
'                    ",Indiv_Trans_Cnt " & _
'                  ") " & _
'             "VALUES ( '" & strFolderType & "' " & _
'                    ", '" & strTrans & "' " & _
'                    ", '" & strYearFolder & "' " & _
'                    ", '" & strMonthFolder & "' " & _
'                    ", '" & intTRDGCnt & "' " & _
'                    ", '" & intSRCHCnt & "') " 

objTransRep.WriteLine "------------------------------------------------------------     ----------     ----------"
objTransRep.WriteLine "TOTALS                                                      " & RightJustified(intTRDGCnt, 15) & RightJustified(intSRCHCnt, 15) 
End If

'Wscript.Echo strZipTempFolder
DeleteFolder strZipTempFolder
' Set filesys = CreateObject("Scripting.FileSystemObject")
'  filesys.CreateTextFile strZipTempFolder, True 
 
'If filesys.FileExists(strZipTempFolder) Then
'  filesys.DeleteFile strZipTempFolder
'End If


Next
'	objMTRCon.Close
WScript.Echo "Reports Created"

WScript.Echo "Script completed."

'If MsgBox("Report Written to:     " & strFileOutput & "    Would you like to open the text file? ", vbYesNo) = vbYes then
'	objShell.Run("notepad " & strFileOutput)
'End If

Function RightJustified(ColumnValue, ColumnWidth)
   RightJustified = Space(ColumnWidth - Len(ColumnValue)) & ColumnValue
End Function

'------------------------------
'*** Runs command line sent ***
'------------------------------
Sub subRunCMD(strCmdLine, Wait)
'---------------------------------
  
	objShell.Run strCmdLine, WindowMin, Wait
End Sub

Sub Set32Bit

    ' C:\Windows\System32\WScript.exe = WScript.exe
    Dim ScriptHost : ScriptHost = Mid(WScript.FullName, InStrRev(WScript.FullName, "\") + 1, Len(WScript.FullName))
    
    Dim oWs : Set oWs = CreateObject("WScript.Shell")
    Dim oProcEnv : Set oProcEnv = oWs.Environment("Process")
    
    ' Am I running 64-bit version of WScript.exe/Cscript.exe? So, call script again in x86 script host and then exit.
    If InStr(LCase(WScript.FullName), LCase(oProcEnv("windir") & "\System32\")) And oProcEnv("PROCESSOR_ARCHITECTURE") = "AMD64" Then
        ' rebuild arguments
        If Not WScript.Arguments.Count = 0 Then
            Dim sArg, Arg
            sArg = ""
            For Each Arg In Wscript.Arguments
                  sArg = sArg & " " & """" & Arg & """"
            Next
        End If
    
        Dim sCmd : sCmd = """" &  oProcEnv("windir") & "\SysWOW64\" & ScriptHost & """" & " """ & WScript.ScriptFullName & """" & sArg
        'WScript.Echo "Call " & sCmd
        oWs.Run sCmd
        WScript.Quit
    End If

End Sub

Function DeleteFolder(strFolderPath)
Dim objFSO, objFolder
Set objFSO = CreateObject ("Scripting.FileSystemObject")
If objFSO.FolderExists(strFolderPath) Then
	objFSO.DeleteFolder strFolderPath, True
End If
Set objFSO = Nothing
End Function