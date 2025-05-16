Const ForReading = 1

Dim ReadFile
Dim objTransRep
Dim objShell
Dim intTRDGCnt, intSRCHCnt, intTransSetTotal, intTransIndivTotal
Dim intDayTranSet01,intDayTranSet02,intDayTranSet03,intDayTranSet04,intDayTranSet05,intDayTranSet06,intDayTranSet07,intDayTranSet08,intDayTranSet09,intDayTranSet10,intDayTranSet11,intDayTranSet12,intDayTranSet13,intDayTranSet14,intDayTranSet15,intDayTranSet16,intDayTranSet17,intDayTranSet18,intDayTranSet19,intDayTranSet20,intDayTranSet21,intDayTranSet22,intDayTranSet23,intDayTranSet24,intDayTranSet25,intDayTranSet26,intDayTranSet27,intDayTranSet28,intDayTranSet29,intDayTranSet30,intDayTranSet31
Dim intDayTransIndiv01,intDayTransIndiv02,intDayTransIndiv03,intDayTransIndiv04,intDayTransIndiv05,intDayTransIndiv06,intDayTransIndiv07,intDayTransIndiv08,intDayTransIndiv09,intDayTransIndiv10,intDayTransIndiv11,intDayTransIndiv12,intDayTransIndiv13,intDayTransIndiv14,intDayTransIndiv15,intDayTransIndiv16,intDayTransIndiv17,intDayTransIndiv18,intDayTransIndiv19,intDayTransIndiv20,intDayTransIndiv21,intDayTransIndiv22,intDayTransIndiv23,intDayTransIndiv24,intDayTransIndiv25,intDayTransIndiv26,intDayTransIndiv27,intDayTransIndiv28,intDayTransIndiv29,intDayTransIndiv30,intDayTransIndiv31
Dim intFolderYear, intFolderMonth
Dim strMonthFolder, strYearFolder, strFolderType, strFirstTime, strFileName, strDelim
Dim strTrans
Dim strSchema
Dim objTransFolder
Dim objMTRCon
Dim strZipTempFolder
Dim objNetwork
Dim filesys
Dim Envirnmnt
Set fso = CreateObject( "Scripting.FileSystemObject" )
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objMTRCon = CreateObject("ADODB.Connection")
Set objShell = CreateObject("WScript.Shell")

Call Set32Bit

WScript.Echo "Script started."

Envirnmnt=objShell.ExpandEnvironmentStrings("%Environment%")
WScript.Echo "Environment variable: " & Envirnmnt
			
If Envirnmnt = "PROD"	Then	
	 objMTRCon.Open "DSN=EDI_NECustom;UID=EDI_TM_APPID_P;PWD=Edif3c$Prod;"                  
Else
   objMTRCon.Open "DSN=EDI_NECustom;UID=EDI_TM_APPID_T;PWD=Edif3c$2016;"
End If 

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


TransFolderPath = "D:\ecedigs\PF_PostOffice\Medicaid"
ReportFolderPath = "D:\ArchData\Trans_Count_Reports\DAILY_INFO_REPORTS"

Set objTransFolder = objFSO.GetFolder(TransFolderPath)
WScript.Echo "Processing folder: " & TransFolderPath
'***************************** Date Manipulation for Files **********************************************
'intFolderYear = (Year(Date))
intFolderYear = arg1
'intFolderMonth  = (Month(Date)) ' if using current data make sure to comment out DeleteFolder strZipTempFolder on line 202
intFolderMonth  = arg2 ' if using historical make sure to use DeleteFolder strZipTempFolder on line 202
strYearFolder = intFolderYear
strFolderType = "EDI"
strFirstTime = "Y"
strTPFileInd = "N"
strFirstTP01 = "Y"
strFirstTP02 = "Y"
strFirstTP03 = "Y"
strFirstTP04 = "Y"
strFirstTP05 = "Y"
strFirstTP06 = "Y"
strFirstTP07 = "Y"
strFirstTP08 = "Y"
strFirstTP09 = "Y"
strFirstTP10 = "Y"
strFirstTP11 = "Y"
strFirstTP12 = "Y"
strFirstTP13 = "Y"
strFirstTP14 = "Y"
strFirstTP15 = "Y"
strFirstTP16 = "Y"
strFirstTP17 = "Y"
strFirstTP18 = "Y"
strFirstTP19 = "Y"
strFirstTP20 = "Y"
strFirstTP21 = "Y"
strFirstTP22 = "Y"
strFirstTP23 = "Y"
strFirstTP24 = "Y"
strFirstTP25 = "Y"
strFirstTP26 = "Y"
strFirstTP27 = "Y"
strFirstTP28 = "Y"
strFirstTP29 = "Y"
strFirstTP30 = "Y"
strFirstTP31 = "Y"


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

strSchema = "dbo"

If not fso.FolderExists(ReportFolderPath & "\" & strYearFolder) then 
   ' If it gets here then the folder for the current date does not yet exist and 
   ' therefore is created. 
   WScript.Echo "Creating Folder " & ReportFolderPath & "\" & strYearFolder
   Set objFolder = fso.CreateFolder(ReportFolderPath & "\" & strYearFolder) 
End If

If not fso.FolderExists(ReportFolderPath & "\" & strYearFolder & "\" & strMonthFolder) then 
   ' If it gets here then the folder for the current date does not yet exist and 
   ' therefore is created. 
   wscript.echo "Creating Folder " & ReportFolderPath & "\" & strYearFolder & "\" & strMonthFolder
   Set objFolder = fso.CreateFolder(ReportFolderPath & "\" & strYearFolder & "\" & strMonthFolder) 
End If

For Each objTransFolder In objFSO.GetFolder(TransFolderPath).SubFolders
  'strTrans = objFolder.Path
  'Wscript.Echo objTransFolder.Name 'Vidya
  
 'If Mid (objTransFolder.Name, 1, 12)  <> "EDI000000472" Then
  	
  If Mid (objTransFolder.Name, 1, 3) = "EDI" Then
     strTrans = objTransFolder.Name
     WScript.Echo objTransFolder.Subfolders.Count
     wscript.echo TransFolderPath & "\" & strTrans & "\Archives\" & strYearFolder & "\" & strMonthFolder
     'msgbox TransFolderPath & "\" & strTrans & "\Archive\" & strYearFolder & "\" & strMonthFolder
        If intFolderYear = (Year(Date)) and intFolderMonth = (Month(Date)) Then
	       objStartFolder = TransFolderPath & "\" & strTrans & "\Archives\"
	      Else
	       objStartFolder = TransFolderPath & "\" & strTrans & "\Archives\" & strYearFolder & "\" & strMonthFolder
        End If
     strDateStrip = Replace(Date,"/","_")
	   strFileOutput = ReportFolderPath & "\" & strYearFolder & "\" & strMonthFolder & "\" & "270_DAILY_COUNT_RPT.txt"	
	   Wscript.Echo strFileOutput
     WScript.Echo objStartFolder
	
     If objFSO.FolderExists(objStartFolder) Then
	    Set objZipFolder = objFSO.GetFolder(objStartFolder)
     End If
     intTRDGCnt = 0
     intSRCHCnt = 0
     'Unzip Folders to process
    If intFolderYear = (Year(Date)) And intFolderMonth = (Month(Date)) Then
	   strZipTempFolder = objStartFolder
	  Else 
	   For Each objFile In objZipFolder.Files
           If objZipFolder.files.Count <> 0 Then
	       strZipTempFolder = objStartFolder & "\UNZIP_" & objFile.Name
					If objFSO.FolderExists(strZipTempFolder) = False Then
						objFSO.CreateFolder(strZipTempFolder)
					End If	
					Wscript.Echo objStartFolder & "\" & objFile.Name 
					'Call subRunCMD("wzunzip " & objStartFolder & "\" & objFile.Name & " " & strZipTempFolder, True)
					Call subRunCMD("7z x " & objStartFolder & "\" & objFile.Name & " -o" & strZipTempFolder, True)
           End If
	   Next
    End If
    Wscript.Echo ObjZipFolder.files.Count
    If ObjZipFolder.files.Count <> 0 Then
	   'Set objTransRep = objFSO.CreateTextFile(strFileOutput, True)
	   'objTransRep.WriteLine strDateStrip
     'objTransRep.WriteLine "MONTH    DAY          TRANS_SET_COUNT         INDIV TRAN_CNT  "
     'objTransRep.WriteLine "---------------------------------------------------------------"
      Set objFolder = objFSO.GetFolder(strZipTempFolder)					
      Set colFiles = objFolder.Files

     For Each objFile in colFiles		
	    'strSrchTransSet = "ST\*837"
		  'strSrchTrans = "CLM\*"

      'If Instr(UCase(objFile.Name), ".DAT") <> 0 And Instr(UCase(objFile.Name), ".ZIP") = 0 And objFile.Size > 0 Then
       If  Instr(UCase(objFile.Name), ".ZIP") = 0 And Instr(UCase(objFile.Name), "NCPDP") = 0 And objFile.Size > 0 Then 
            ReadFile = strZipTempFolder & "\" & objFile.Name
            ' **** Logic to get date value of file that is part of file name
              strSearchString = objFile.Name
              Wscript.echo    "File Name: " & strSearchString
              intStart = InStr(UCase(strSearchString), ".D20")
              intStart = intStart + 6
              strText = Mid(strSearchString, intStart, 250)
              For i = 1 to Len(strText)
               If Mid(strText, i, 1) = "." Then
              Exit For
              Else
               strData = strData & Mid(strText, i, 1)
              End If
             Next
            ' **** End Logic to get date value of file that is part of file name
            'wscript.echo "Strdata: " & strData

                          
	         Set textFile = fso.OpenTextFile( ReadFile, ForReading )
	         contents = textFile.ReadAll
	         textFile.Close
	        
	        strDelim = Mid(contents, 4, 1)
	        strSrchTransSet = "ST\" & strDelim & "270"
		 	    strSrchTrans = "\" & strDelim & "22\" & strDelim & "0"

  	       'If Mid(UCase(ObjFile.Name),14,4) = "270" And objFile.Size > 0 Then
  	         If Instr(UCase(objFile.Name), ".270.") <> 0 And objFile.Size > 0 Then

             strFirstTime = "N"                                  	         	 	
	        
	         Set rgxp = New Regexp
	         rgxp.Pattern = strSrchTransSet
	         'rgxp.Pattern = "ST\*837"
	         rgxp.IgnoreCase = False
	         rgxp.Global = True
	         Set matches = rgxp.Execute( contents )
	
   	         Set rgxp2 = New Regexp
	         rgxp2.Pattern = strSrchTrans
	         'rgxp2.Pattern = "\*22\*0"
	         rgxp2.IgnoreCase = False
	         rgxp2.Global = True
	         Set matches2 = rgxp2.Execute( contents )	        

            
              'txt = RightJustified(Mid (objFile.Name, 1, 80), 80) & RightJustified(matches.Count, 15) & RightJustified(matches2.Count, 15)

             intTRDGCnt = intTRDGCnt + matches.Count
             intSRCHCnt = intSRCHCnt + matches2.Count
             strTPFileInd = "Y"
             'objTransRep.WriteLine txt
             Else

                Set rgxp3 = New Regexp
	            rgxp3.Pattern = "005010X279A1"
	            rgxp3.IgnoreCase = False
	            rgxp3.Global = True
	            Set matches3 = rgxp3.Execute( contents )
	         
	             If matches3.Count > 0 Then
	             	'WScript.echo Mid(UCase(ObjFile.Name),14,4) & "     File Name    " & ObjFile.Name
	                Set rgxp = New Regexp
	                rgxp.Pattern = strSrchTransSet
	                rgxp.IgnoreCase = False
	                rgxp.Global = True
	                Set matches = rgxp.Execute( contents )
	
   	                Set rgxp2 = New Regexp
	                rgxp2.Pattern = strSrchTrans
	                rgxp2.IgnoreCase = False
	                rgxp2.Global = True
	                Set matches2 = rgxp2.Execute( contents )
	        
                    'txt = RightJustified(Mid (objFile.Name, 1, 80), 80) & RightJustified(matches.Count, 15) & RightJustified(matches2.Count, 15)
                    intTRDGCnt = intTRDGCnt + matches.Count
                    intSRCHCnt = intSRCHCnt + matches2.Count
                    strTPFileInd = "Y"
                    'objTransRep.WriteLine txt  
                 End If   
		          End If
                  'WScript.echo Mid(strData, 3, 2)
                        If strTPFileInd = "Y" Then
		                Select Case 	Mid(strData, 1, 4)						
						Case intFolderMonth & "01"
						        If strFirstTP01 = "Y" Then
						        	intTPFileCount01 = intTPFileCount01 + 1
                                    strFirstTP01 = "N"
						        End If	
								intDayTranSet01 = intDayTranSet01 + intTRDGCnt
								intDayTransIndiv01 = intDayTransIndiv01 + intSRCHCnt
								wscript.echo "DAY 1:  " & intTPFileCount01 & " File: " & readfile
                wscript.echo "DAY 1: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "02"
								If strFirstTP02 = "Y" Then
						           intTPFileCount02 = intTPFileCount02 + 1
                                   strFirstTP02 = "N"
                                End If    
								intDayTranSet02 = intDayTranSet02 + intTRDGCnt
								intDayTransIndiv02 = intDayTransIndiv02 + intSRCHCnt
								wscript.echo "DAY 2:  " & intTPFileCount02 & " File: " & readfile
								wscript.echo "DAY 2: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "03"
								If strFirstTP03 = "Y" Then
						           intTPFileCount03 = intTPFileCount03 + 1
                                   strFirstTP03 = "N"
						        End If	
								intDayTranSet03 = intDayTranSet03 + intTRDGCnt
								intDayTransIndiv03 = intDayTransIndiv03 + intSRCHCnt
                wscript.echo "DAY 3:  " & intTPFileCount03 & " File: " & readfile
                wscript.echo "DAY 3: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "04"
								If strFirstTP04 = "Y" Then
						           intTPFileCount04 = intTPFileCount04 + 1
                                   strFirstTP04 = "N"
						        End If	
								intDayTranSet04 = intDayTranSet04 + intTRDGCnt
								intDayTransIndiv04 = intDayTransIndiv04 + intSRCHCnt
                wscript.echo "DAY 4:  " & intTPFileCount04 & " File: " & readfile
                wscript.echo "DAY 4: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "05"
								If strFirstTP05 = "Y" Then
						           intTPFileCount05 = intTPFileCount05 + 1
                                   strFirstTP05 = "N"
						        End If	
								intDayTranSet05 = intDayTranSet05 + intTRDGCnt
								intDayTransIndiv05 = intDayTransIndiv05 + intSRCHCnt
                wscript.echo "DAY 5:  " & intTPFileCount05 & " File: " & readfile
                wscript.echo "DAY 5: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "06"
								If strFirstTP06 = "Y" Then
						           intTPFileCount06 = intTPFileCount06 + 1
                                   strFirstTP06 = "N"
						        End If	
								intDayTranSet06 = intDayTranSet06 + intTRDGCnt
								intDayTransIndiv06 = intDayTransIndiv06 + intSRCHCnt
                wscript.echo "DAY 6:  " & intTPFileCount06 & " File: " & readfile
                wscript.echo "DAY 6: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "07"
								If strFirstTP07 = "Y" Then
						           intTPFileCount07 = intTPFileCount07 + 1
                                   strFirstTP07 = "N"
						        End If	
								intDayTranSet07 = intDayTranSet07 + intTRDGCnt
								intDayTransIndiv07 = intDayTransIndiv07 + intSRCHCnt
                wscript.echo "DAY 7:  " & intTPFileCount07 & " File: " & readfile
                wscript.echo "DAY 7: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "08"
						        If strFirstTP08 = "Y" Then
						           intTPFileCount08 = intTPFileCount08 + 1
                                   strFirstTP08 = "N"
						        End If	
								intDayTranSet08 = intDayTranSet08 + intTRDGCnt
								intDayTransIndiv08 = intDayTransIndiv08 + intSRCHCnt
                wscript.echo "DAY 8:  " & intTPFileCount08 & " File: " & readfile
                wscript.echo "DAY 8: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "09"
						        If strFirstTP09 = "Y" Then
						           intTPFileCount09 = intTPFileCount09 + 1
                                   strFirstTP09 = "N"
                                End If   
								intDayTranSet09 = intDayTranSet09 + intTRDGCnt
								intDayTransIndiv09 = intDayTransIndiv09 + intSRCHCnt
                wscript.echo "DAY 9:  " & intTPFileCount09 & " File: " & readfile
                wscript.echo "DAY 9: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "10"
		                        If strFirstTP10 = "Y" Then
						           intTPFileCount10 = intTPFileCount10 + 1
                                   strFirstTP10 = "N"
                                End If
								intDayTranSet10 = intDayTranSet10 + intTRDGCnt
								intDayTransIndiv10 = intDayTransIndiv10 + intSRCHCnt
                wscript.echo "DAY 10:  " & intTPFileCount10 & " File: " & readfile
                wscript.echo "DAY 10: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "11"
								If strFirstTP11 = "Y" Then
						           intTPFileCount11 = intTPFileCount11 + 1
                                   strFirstTP11 = "N"
                                End If
								intDayTranSet11 = intDayTranSet11 + intTRDGCnt
								intDayTransIndiv11 = intDayTransIndiv11 + intSRCHCnt
                wscript.echo "DAY 11:  " & intTPFileCount11 & " File: " & readfile
                wscript.echo "DAY 11: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "12"
						        If strFirstTP12 = "Y" Then
						           intTPFileCount12 = intTPFileCount12 + 1
                                   strFirstTP12 = "N"
                                End If
								intDayTranSet12 = intDayTranSet12 + intTRDGCnt
								intDayTransIndiv12 = intDayTransIndiv12 + intSRCHCnt
                wscript.echo "DAY 12:  " & intTPFileCount12 & " File: " & readfile
                wscript.echo "DAY 12: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "13"
						        If strFirstTP13 = "Y" Then
						           intTPFileCount13 = intTPFileCount13 + 1
                                   strFirstTP13 = "N"
                                End If
								intDayTranSet13 = intDayTranSet13 + intTRDGCnt
								intDayTransIndiv13 = intDayTransIndiv13 + intSRCHCnt
                wscript.echo "DAY 13:  " & intTPFileCount13 & " File: " & readfile
                wscript.echo "DAY 13: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "14"
						        If strFirstTP14 = "Y" Then
						           intTPFileCount14 = intTPFileCount14 + 1
                                   strFirstTP14 = "N"
                                End If
								intDayTranSet14 = intDayTranSet14 + intTRDGCnt
								intDayTransIndiv14 = intDayTransIndiv14 + intSRCHCnt
                wscript.echo "DAY 14:  " & intTPFileCount14 & " File: " & readfile
                wscript.echo "DAY 14: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "15"
			                    If strFirstTP15 = "Y" Then
						           intTPFileCount15 = intTPFileCount15 + 1
                                   strFirstTP15 = "N"
                                End If
								intDayTranSet15 = intDayTranSet15 + intTRDGCnt
								intDayTransIndiv15 = intDayTransIndiv15 + intSRCHCnt
                wscript.echo "DAY 15:  " & intTPFileCount15 & " File: " & readfile
                wscript.echo "DAY 15: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "16"
						        If strFirstTP16 = "Y" Then
						           intTPFileCount16 = intTPFileCount16 + 1
                                   strFirstTP16 = "N"
                                End If
								intDayTranSet16 = intDayTranSet16 + intTRDGCnt
								intDayTransIndiv16 = intDayTransIndiv16 + intSRCHCnt	
                wscript.echo "DAY 16:  " & intTPFileCount16 & " File: " & readfile
                wscript.echo "DAY 16: " & intTRDGCnt & "File: " & readfile	
						Case intFolderMonth & "17"
						        If strFirstTP17 = "Y" Then
						           intTPFileCount17 = intTPFileCount17 + 1
                                   strFirstTP17 = "N"
                                End If
								intDayTranSet17 = intDayTranSet17 + intTRDGCnt
								intDayTransIndiv17 = intDayTransIndiv17 + intSRCHCnt
                wscript.echo "DAY 17:  " & intTPFileCount17 & " File: " & readfile
                wscript.echo "DAY 17: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "18"
						        If strFirstTP18 = "Y" Then
						           intTPFileCount18 = intTPFileCount18 + 1
                                   strFirstTP18 = "N"
                                End If
								intDayTranSet18 = intDayTranSet18 + intTRDGCnt
								intDayTransIndiv18 = intDayTransIndiv18 + intSRCHCnt
                wscript.echo "DAY 18:  " & intTPFileCount18 & " File: " & readfile
                wscript.echo "DAY 18: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "19"
								If strFirstTP19 = "Y" Then
						           intTPFileCount19 = intTPFileCount19 + 1
                                   strFirstTP19 = "N"
                                End If
								intDayTranSet19 = intDayTranSet19 + intTRDGCnt
								intDayTransIndiv19 = intDayTransIndiv19 + intSRCHCnt
                wscript.echo "DAY 19:  " & intTPFileCount19 & " File: " & readfile
                wscript.echo "DAY 19: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "20"
						        If strFirstTP20 = "Y" Then
						           intTPFileCount20 = intTPFileCount20 + 1
                                   strFirstTP20 = "N"
                                End If
								intDayTranSet20 = intDayTranSet20 + intTRDGCnt
								intDayTransIndiv20 = intDayTransIndiv20 + intSRCHCnt
                wscript.echo "DAY 20:  " & intTPFileCount20 & " File: " & readfile
                wscript.echo "DAY 20: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "21"
						        If strFirstTP21 = "Y" Then
						           intTPFileCount21 = intTPFileCount21 + 1
                                   strFirstTP21 = "N"
                                End If
								intDayTranSet21 = intDayTranSet21 + intTRDGCnt
								intDayTransIndiv21 = intDayTransIndiv21 + intSRCHCnt
                wscript.echo "DAY 21:  " & intTPFileCount21 & " File: " & readfile
                wscript.echo "DAY 21: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "22"
						        If strFirstTP22 = "Y" Then
						           intTPFileCount22 = intTPFileCount22 + 1
                                   strFirstTP22 = "N"
                                End If
								intDayTranSet22 = intDayTranSet22 + intTRDGCnt
								intDayTransIndiv22 = intDayTransIndiv22 + intSRCHCnt
                wscript.echo "DAY 22:  " & intTPFileCount22 & " File: " & readfile
                wscript.echo "DAY 22: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "23"
						        If strFirstTP23 = "Y" Then
						           intTPFileCount23 = intTPFileCount23 + 1
                                   strFirstTP23 = "N"
                                End If
								intDayTranSet23 = intDayTranSet23 + intTRDGCnt
								intDayTransIndiv23 = intDayTransIndiv23 + intSRCHCnt
                wscript.echo "DAY 23:  " & intTPFileCount23 & " File: " & readfile
                wscript.echo "DAY 23: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "24"
						        If strFirstTP24 = "Y" Then
						           intTPFileCount24 = intTPFileCount24 + 1
                                   strFirstTP24 = "N"
                                End If
								intDayTranSet24 = intDayTranSet24 + intTRDGCnt
								intDayTransIndiv24 = intDayTransIndiv24 + intSRCHCnt
                wscript.echo "DAY 24:  " & intTPFileCount24 & " File: " & readfile
                wscript.echo "DAY 24: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "25"
						        If strFirstTP25 = "Y" Then
						           intTPFileCount25 = intTPFileCount25 + 1
                                   strFirstTP25 = "N"
                                End If
								intDayTranSet25 = intDayTranSet25 + intTRDGCnt
								intDayTransIndiv25 = intDayTransIndiv25 + intSRCHCnt
                wscript.echo "DAY 25:  " & intTPFileCount25 & " File: " & readfile
                wscript.echo "DAY 25: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "26"
						        If strFirstTP26 = "Y" Then
						           intTPFileCount26 = intTPFileCount26 + 1
                                   strFirstTP26 = "N"
                                End If
								intDayTranSet26 = intDayTranSet26 + intTRDGCnt
								intDayTransIndiv26 = intDayTransIndiv26 + intSRCHCnt
                wscript.echo "DAY 26:  " & intTPFileCount26 & " File: " & readfile
                wscript.echo "DAY 26: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "27"
						        If strFirstTP27 = "Y" Then
						           intTPFileCount27 = intTPFileCount27 + 1
                                   strFirstTP27 = "N"
                                End If
								intDayTranSet27 = intDayTranSet27 + intTRDGCnt
								intDayTransIndiv27 = intDayTransIndiv27 + intSRCHCnt
                wscript.echo "DAY 27:  " & intTPFileCount27 & " File: " & readfile
                wscript.echo "DAY 27: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "28"
						        If strFirstTP28 = "Y" Then
						           intTPFileCount28 = intTPFileCount28 + 1
                                   strFirstTP28 = "N"
                                End If
								intDayTranSet28 = intDayTranSet28 + intTRDGCnt
								intDayTransIndiv28 = intDayTransIndiv28 + intSRCHCnt
                wscript.echo "DAY 28:  " & intTPFileCount28 & " File: " & readfile
                wscript.echo "DAY 28: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "29"
						        If strFirstTP29 = "Y" Then
						           intTPFileCount29 = intTPFileCount29 + 1
                                   strFirstTP29 = "N"
                                End If
								intDayTranSet29 = intDayTranSet29 + intTRDGCnt
								intDayTransIndiv29 = intDayTransIndiv29 + intSRCHCnt
                wscript.echo "DAY 29:  " & intTPFileCount29 & " File: " & readfile
                wscript.echo "DAY 29: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "30"
						        If strFirstTP30 = "Y" Then
						           intTPFileCount30 = intTPFileCount30 + 1
                                   strFirstTP30 = "N"
                                End If
								intDayTranSet30 = intDayTranSet30 + intTRDGCnt
								intDayTransIndiv30 = intDayTransIndiv30 + intSRCHCnt
                wscript.echo "DAY 30:  " & intTPFileCount30 & " File: " & readfile
                wscript.echo "DAY 30: " & intTRDGCnt & "File: " & readfile
						Case intFolderMonth & "31"
						'wscript.echo objTransFolder.Name & "   " & objFile.Name & "   " & strData
						        If strFirstTP31 = "Y" Then
						           intTPFileCount31 = intTPFileCount31 + 1
                                   strFirstTP31 = "N"
                                End If
								intDayTranSet31 = intDayTranSet31 + intTRDGCnt
								intDayTransIndiv31 = intDayTransIndiv31 + intSRCHCnt
                wscript.echo "DAY 31:  " & intTPFileCount31 & " File: " & readfile
                wscript.echo "DAY 31: " & intTRDGCnt & "File: " & readfile

					End Select			  
		   End If
		   strData = ""
		   intTransSetTotal = intTransSetTotal + intTRDGCnt
       intTransIndivTotal = intTransIndivTotal + intSRCHCnt
		   intTRDGCnt = 0
       intSRCHCnt = 0
       strTPFileInd = "N"
       Wscript.Echo "TRANSET_TOTAL: " & intTransSetTotal
 
		  End If
Next

strFirstTP01 = "Y"
strFirstTP02 = "Y"
strFirstTP03 = "Y"
strFirstTP04 = "Y"
strFirstTP05 = "Y"
strFirstTP06 = "Y"
strFirstTP07 = "Y"
strFirstTP08 = "Y"
strFirstTP09 = "Y"
strFirstTP10 = "Y"
strFirstTP11 = "Y"
strFirstTP12 = "Y"
strFirstTP13 = "Y"
strFirstTP14 = "Y"
strFirstTP15 = "Y"
strFirstTP16 = "Y"
strFirstTP17 = "Y"
strFirstTP18 = "Y"
strFirstTP19 = "Y"
strFirstTP20 = "Y"
strFirstTP21 = "Y"
strFirstTP22 = "Y"
strFirstTP23 = "Y"
strFirstTP24 = "Y"
strFirstTP25 = "Y"
strFirstTP26 = "Y"
strFirstTP27 = "Y"
strFirstTP28 = "Y"
strFirstTP29 = "Y"
strFirstTP30 = "Y"
strFirstTP31 = "Y"
  'objTransRep.WriteLine "REPORT"
    'objTransRep.WriteLine 
'Wscript.Echo intDayTranSet01
   'objTransRep.WriteLine "--------------------------------------------------------------------------------     ----------     ----------"
   'objTransRep.WriteLine "TOTALS                                                                          " & RightJustified(intTRDGCnt, 15) & RightJustified(intSRCHCnt, 15) 

'   Wscript.Echo "SET: " &  intTransSetTotal & "INDIV: " & intTransIndivTotal
   strFirstTime = "Y"
        'Wscript.Echo strZipTempFolder & " Set: " & intTransSetTotal & " Ind: " & intTransIndivTotal
         If Instr(UCase(strZipTempFolder), "UNZIP") <> 0 Then
            DeleteFolder strZipTempFolder
            Wscript.Echo "DELETED FOLDER: " & strZipTempFolder
         End If
 '        wscript.echo "DAY 1: " & intDayTranSet01
      End If
    End If
 'End If
Next
	  Set objTransRep = objFSO.CreateTextFile(strFileOutput, True)
	  objTransRep.WriteLine strDateStrip
      objTransRep.WriteLine "YEAR   MONTH    DAY   TRANS_SET_COUNT   INDIV_TRAN_CNT    TP_COUNT"
      objTransRep.WriteLine "------------------------------------------------------------------"

strTrans = "270"

If intDayTranSet01 > 0 Or intDayTranIndiv01 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("01", 6)& RightJustified(intDayTranSet01, 15) & RightJustified(intDayTransIndiv01, 15) & RightJustified(intTPFileCount01, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 				"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '01' " & _
                    ", '" & intDayTranSet01 & "' " & _
                    ", '" & intDayTransIndiv01 & "' " & _
                    ", '" & intTPFileCount01 & "') " 
End If	
If intDayTranSet02 > 0 Or intDayTranIndiv02 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("02", 6)& RightJustified(intDayTranSet02, 15) & RightJustified(intDayTransIndiv02, 15) & RightJustified(intTPFileCount02, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '02' " & _
                    ", '" & intDayTranSet02 & "' " & _
                    ", '" & intDayTransIndiv02 & "' " & _
                    ", '" & intTPFileCount02 & "') " 
End If
If intDayTranSet03 > 0 Or intDayTranIndiv03 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("03", 6)& RightJustified(intDayTranSet03, 15) & RightJustified(intDayTransIndiv03, 15) & RightJustified(intTPFileCount03, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '03' " & _
                    ", '" & intDayTranSet03 & "' " & _
                    ", '" & intDayTransIndiv03 & "' " & _
                    ", '" & intTPFileCount03 & "') " 
End If
If intDayTranSet04 > 0 Or intDayTranIndiv04 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("04", 6)& RightJustified(intDayTranSet04, 15) & RightJustified(intDayTransIndiv04, 15) & RightJustified(intTPFileCount04, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '04' " & _
                    ", '" & intDayTranSet04 & "' " & _
                    ", '" & intDayTransIndiv04 & "' " & _
                    ", '" & intTPFileCount04 & "') " 
End If
If intDayTranSet05 > 0 Or intDayTranIndiv05 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("05", 6)& RightJustified(intDayTranSet05, 15) & RightJustified(intDayTransIndiv05, 15) & RightJustified(intTPFileCount05, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '05' " & _
                    ", '" & intDayTranSet05 & "' " & _
                    ", '" & intDayTransIndiv05 & "' " & _
                    ", '" & intTPFileCount05 & "') " 
End If
If intDayTranSet06 > 0 Or intDayTranIndiv06 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("06", 6)& RightJustified(intDayTranSet06, 15) & RightJustified(intDayTransIndiv06, 15) & RightJustified(intTPFileCount06, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '06' " & _
                    ", '" & intDayTranSet06 & "' " & _
                    ", '" & intDayTransIndiv06 & "' " & _
                    ", '" & intTPFileCount06 & "') " 
End If
If intDayTranSet07 > 0 Or intDayTranIndiv07 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("07", 6)& RightJustified(intDayTranSet07, 15) & RightJustified(intDayTransIndiv07, 15) & RightJustified(intTPFileCount07, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '07' " & _
                    ", '" & intDayTranSet07 & "' " & _
                    ", '" & intDayTransIndiv07 & "' " & _
                    ", '" & intTPFileCount07 & "') " 
End If
If intDayTranSet08 > 0 Or intDayTranIndiv08 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("08", 6)& RightJustified(intDayTranSet08, 15) & RightJustified(intDayTransIndiv08, 15) & RightJustified(intTPFileCount08, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '08' " & _
                    ", '" & intDayTranSet08 & "' " & _
                    ", '" & intDayTransIndiv08 & "' " & _
                    ", '" & intTPFileCount08 & "') " 
End If
If intDayTranSet09 > 0 Or intDayTranIndiv09 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("09", 6)& RightJustified(intDayTranSet09, 15) & RightJustified(intDayTransIndiv09, 15) & RightJustified(intTPFileCount09, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '09' " & _
                    ", '" & intDayTranSet09 & "' " & _
                    ", '" & intDayTransIndiv09 & "' " & _
                    ", '" & intTPFileCount09 & "') " 
End If
If intDayTranSet10 > 0 Or intDayTranIndiv10 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("10", 6)& RightJustified(intDayTranSet10, 15) & RightJustified(intDayTransIndiv10, 15) & RightJustified(intTPFileCount10, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '10' " & _
                    ", '" & intDayTranSet10 & "' " & _
                    ", '" & intDayTransIndiv10 & "' " & _
                    ", '" & intTPFileCount10 & "') " 
End If
If intDayTranSet11 > 0 Or intDayTranIndiv11 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("11", 6)& RightJustified(intDayTranSet11, 15) & RightJustified(intDayTransIndiv11, 15) & RightJustified(intTPFileCount11, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '11' " & _
                    ", '" & intDayTranSet11 & "' " & _
                    ", '" & intDayTransIndiv11 & "' " & _
                    ", '" & intTPFileCount11 & "') " 
End If
If intDayTranSet12 > 0 Or intDayTranIndiv12 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("12", 6)& RightJustified(intDayTranSet12, 15) & RightJustified(intDayTransIndiv12, 15) & RightJustified(intTPFileCount12, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '12' " & _
                    ", '" & intDayTranSet12 & "' " & _
                    ", '" & intDayTransIndiv12 & "' " & _
                    ", '" & intTPFileCount12 & "') " 
End If
If intDayTranSet13 > 0 Or intDayTranIndiv13 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("13", 6)& RightJustified(intDayTranSet13, 15) & RightJustified(intDayTransIndiv13, 15) & RightJustified(intTPFileCount13, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '13' " & _
                    ", '" & intDayTranSet13 & "' " & _
                    ", '" & intDayTransIndiv13 & "' " & _
                    ", '" & intTPFileCount13 & "') " 
End If
If intDayTranSet14 > 0 Or intDayTranIndiv14 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("14", 6)& RightJustified(intDayTranSet14, 15) & RightJustified(intDayTransIndiv14, 15) & RightJustified(intTPFileCount14, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '14' " & _
                    ", '" & intDayTranSet14 & "' " & _
                    ", '" & intDayTransIndiv14 & "' " & _
                    ", '" & intTPFileCount14 & "') " 
End If
If intDayTranSet15 > 0 Or intDayTranIndiv15 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("15", 6)& RightJustified(intDayTranSet15, 15) & RightJustified(intDayTransIndiv15, 15) & RightJustified(intTPFileCount15, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '15' " & _
                    ", '" & intDayTranSet15 & "' " & _
                    ", '" & intDayTransIndiv15 & "' " & _
                    ", '" & intTPFileCount15 & "') " 
End If
If intDayTranSet16 > 0 Or intDayTranIndiv16 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("16", 6)& RightJustified(intDayTranSet16, 15) & RightJustified(intDayTransIndiv16, 15) & RightJustified(intTPFileCount16, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '16' " & _
                    ", '" & intDayTranSet16 & "' " & _
                    ", '" & intDayTransIndiv16 & "' " & _
                    ", '" & intTPFileCount16 & "') " 
End If
If intDayTranSet17 > 0 Or intDayTranIndiv17 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("17", 6)& RightJustified(intDayTranSet17, 15) & RightJustified(intDayTransIndiv17, 15) & RightJustified(intTPFileCount17, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '17' " & _
                    ", '" & intDayTranSet17 & "' " & _
                    ", '" & intDayTransIndiv17 & "' " & _
                    ", '" & intTPFileCount17 & "') " 
End If
If intDayTranSet18 > 0 Or intDayTranIndiv18 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("18", 6)& RightJustified(intDayTranSet18, 15) & RightJustified(intDayTransIndiv18, 15) & RightJustified(intTPFileCount18, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '18' " & _
                    ", '" & intDayTranSet18 & "' " & _
                    ", '" & intDayTransIndiv18 & "' " & _
                    ", '" & intTPFileCount18 & "') " 
End If
If intDayTranSet19 > 0 Or intDayTranIndiv19 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("19", 6)& RightJustified(intDayTranSet19, 15) & RightJustified(intDayTransIndiv19, 15) & RightJustified(intTPFileCount19, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '19' " & _
                    ", '" & intDayTranSet19 & "' " & _
                    ", '" & intDayTransIndiv19 & "' " & _
                    ", '" & intTPFileCount19 & "') " 
End If
If intDayTranSet20 > 0 Or intDayTranIndiv20 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("20", 6)& RightJustified(intDayTranSet20, 15) & RightJustified(intDayTransIndiv20, 15) & RightJustified(intTPFileCount20, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '20' " & _
                    ", '" & intDayTranSet20 & "' " & _
                    ", '" & intDayTransIndiv20 & "' " & _
                    ", '" & intTPFileCount20 & "') " 
End If
If intDayTranSet21 > 0 Or intDayTranIndiv21 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("21", 6)& RightJustified(intDayTranSet21, 15) & RightJustified(intDayTransIndiv21, 15) & RightJustified(intTPFileCount21, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '21' " & _
                    ", '" & intDayTranSet21 & "' " & _
                    ", '" & intDayTransIndiv21 & "' " & _
                    ", '" & intTPFileCount21 & "') " 
End If
If intDayTranSet22 > 0 Or intDayTranIndiv22 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("22", 6)& RightJustified(intDayTranSet22, 15) & RightJustified(intDayTransIndiv22, 15) & RightJustified(intTPFileCount22, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '22' " & _
                    ", '" & intDayTranSet22 & "' " & _
                    ", '" & intDayTransIndiv22 & "' " & _
                    ", '" & intTPFileCount22 & "') " 
End If
If intDayTranSet23 > 0 Or intDayTranIndiv23 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("23", 6)& RightJustified(intDayTranSet23, 15) & RightJustified(intDayTransIndiv23, 15) & RightJustified(intTPFileCount23, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '23' " & _
                    ", '" & intDayTranSet23 & "' " & _
                    ", '" & intDayTransIndiv23 & "' " & _
                    ", '" & intTPFileCount23 & "') " 
End If
If intDayTranSet24 > 0 Or intDayTranIndiv24 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("24", 6)& RightJustified(intDayTranSet24, 15) & RightJustified(intDayTransIndiv24, 15) & RightJustified(intTPFileCount24, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '24' " & _
                    ", '" & intDayTranSet24 & "' " & _
                    ", '" & intDayTransIndiv24 & "' " & _
                    ", '" & intTPFileCount24 & "') " 
End If
If intDayTranSet25 > 0 Or intDayTranIndiv25 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("25", 6)& RightJustified(intDayTranSet25, 15) & RightJustified(intDayTransIndiv25, 15) & RightJustified(intTPFileCount25, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '25' " & _
                    ", '" & intDayTranSet25 & "' " & _
                    ", '" & intDayTransIndiv25 & "' " & _
                    ", '" & intTPFileCount25 & "') " 
End If
If intDayTranSet26 > 0 Or intDayTranIndiv26 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("26", 6)& RightJustified(intDayTranSet26, 15) & RightJustified(intDayTransIndiv26, 15) & RightJustified(intTPFileCount26, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '26' " & _
                    ", '" & intDayTranSet26 & "' " & _
                    ", '" & intDayTransIndiv26 & "' " & _
                    ", '" & intTPFileCount26 & "') " 
End If
If intDayTranSet27 > 0 Or intDayTranIndiv27 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("27", 6)& RightJustified(intDayTranSet27, 15) & RightJustified(intDayTransIndiv27, 15) & RightJustified(intTPFileCount27, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '27' " & _
                    ", '" & intDayTranSet27 & "' " & _
                    ", '" & intDayTransIndiv27 & "' " & _
                    ", '" & intTPFileCount27 & "') " 
End If
If intDayTranSet28 > 0 Or intDayTranIndiv28 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("28", 6)& RightJustified(intDayTranSet28, 15) & RightJustified(intDayTransIndiv28, 15) & RightJustified(intTPFileCount28, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '28' " & _
                    ", '" & intDayTranSet28 & "' " & _
                    ", '" & intDayTransIndiv28 & "' " & _
                    ", '" & intTPFileCount28 & "') " 
End If
If intDayTranSet29 > 0 Or intDayTranIndiv29 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("29", 6)& RightJustified(intDayTranSet29, 15) & RightJustified(intDayTransIndiv29, 15) & RightJustified(intTPFileCount29, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '29' " & _
                    ", '" & intDayTranSet29 & "' " & _
                    ", '" & intDayTransIndiv29 & "' " & _
                    ", '" & intTPFileCount29 & "') " 
End If
If intDayTranSet30 > 0 Or intDayTranIndiv30 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("30", 6)& RightJustified(intDayTranSet30, 15) & RightJustified(intDayTransIndiv30, 15) & RightJustified(intTPFileCount30, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '30' " & _
                    ", '" & intDayTranSet30 & "' " & _
                    ", '" & intDayTransIndiv30 & "' " & _
                    ", '" & intTPFileCount30 & "') " 
End If
If intDayTranSet31 > 0 Or intDayTranIndiv31 > 0 Then
	objTransRep.WriteLine strYearFolder & "   " & strMonthFolder & RightJustified("31", 6)& RightJustified(intDayTranSet31, 15) & RightJustified(intDayTransIndiv31, 15) & RightJustified(intTPFileCount31, 10)
objMTRCon.Execute   "INSERT INTO " & strSchema & ".Trans_Dly_Counts" & _
 					"(  Fldr_Type " & _
 				    ",Trans_Type " & _
                    ",Year " & _
                    ",Month " & _
                    ",Day " & _
                    ",Trans_Set_Cnt " & _
                    ",Indiv_Trans_Cnt " & _
                    ",Tp_Count " & _
                  ") " & _
             "VALUES ( '" & strFolderType & "' " & _
                    ", '" & strTrans & "' " & _
                    ", '" & strYearFolder & "' " & _
                    ", '" & strMonthFolder & "' " & _
                    ", '31' " & _
                    ", '" & intDayTranSet31 & "' " & _
                    ", '" & intDayTransIndiv31 & "' " & _
                    ", '" & intTPFileCount31 & "') " 
End If

      objTransRep.WriteLine "--------------------------------------------------------------------"
      objTransRep.WriteLine "TOTALS             " & RightJustified(intTransSetTotal,15) & RightJustified(intTransIndivTotal,15)

'objMTRCon.Execute   "INSERT INTO " & strSchema & ".TRANS_COUNTS" & _
' 				"(  FLDR_TYPE " & _
' 				    ",TRANS_TYPE " & _
'                    ",YEAR " & _
'                    ",FLDR_DTE " & _
'                    ",TRANS_SET_CNT " & _
'                    ",INDIV_TRANS_CNT " & _
'                  ") " & _
'             "VALUES ( '" & strFolderType & "' " & _
'                    ", '" & strTrans & "' " & _
'                    ", '" & strYearFolder & "' " & _
'                    ", '" & strMonthFolder & "' " & _
'                    ", '" & intTransSetTotal & "' " & _
'                    ", '" & intTransIndivTotal & "') " 
'	objMTRCon.Close
'MsgBox "Reports Created"
wscript.echo "Reports Created"


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

WScript.Echo "Script completed."

