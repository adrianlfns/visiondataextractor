# Cleanup docs folder
Remove-Item -Path docs\* -Recurse -Force

#publish
dotnet publish -o docs

#move the actuall site directly to the docs folder
XCOPY docs\wwwroot docs /E /I