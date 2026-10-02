$url = "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/archive/refs/heads/main.zip"
Invoke-WebRequest -Uri $url -OutFile "skill.zip"
Expand-Archive -Path "skill.zip" -DestinationPath "skill_extracted" -Force
$source = Get-ChildItem -Path "skill_extracted" | Select-Object -First 1
New-Item -ItemType Directory -Force -Path ".agents/skills/ui-ux-pro-max"
Move-Item -Path "$($source.FullName)\*" -Destination ".agents/skills/ui-ux-pro-max" -Force
Remove-Item -Path "skill.zip" -Force
Remove-Item -Path "skill_extracted" -Recurse -Force
