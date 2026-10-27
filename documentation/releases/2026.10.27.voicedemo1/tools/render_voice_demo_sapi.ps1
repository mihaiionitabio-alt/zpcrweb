param([string]$Capture,[string]$Output)
$ErrorActionPreference='Stop'
$data=Get-Content -LiteralPath $Capture -Raw -Encoding UTF8 | ConvertFrom-Json
$tts=New-Object -ComObject SAPI.SpVoice
$all=@($tts.GetVoices())
$english=@($all | Where-Object { $isEnglish=$false; foreach($code in ($_.GetAttribute('Language') -split ';')){if(([Convert]::ToInt32($code,16) -band 0x3ff) -eq 9){$isEnglish=$true}}; $isEnglish })
if($english.Count -eq 0){throw 'No installed English SAPI voice. No online fallback.'}
$male=@($english | Where-Object {$_.GetAttribute('Gender') -eq 'Male'})
$female=@($english | Where-Object {$_.GetAttribute('Gender') -eq 'Female'})
$operatorVoice=if($male.Count){$male[0]}else{$english[0]}
$missyVoice=if($female.Count){$female[0]}elseif($english.Count -gt 1){$english[1]}else{$english[0]}
$distinctCandidates=@($english | Where-Object {$_.Id -ne $operatorVoice.Id})
if($missyVoice.Id -eq $operatorVoice.Id -and $distinctCandidates.Count -gt 0){$missyVoice=$distinctCandidates[0]}
$voiceInfo=@{operator=@{name=$operatorVoice.GetDescription();language=$operatorVoice.GetAttribute('Language');rate=4;pitch=2};missy=@{name=$missyVoice.GetDescription();language=$missyVoice.GetAttribute('Language');rate=2;pitch=-2};distinct=($operatorVoice.Id -ne $missyVoice.Id);engine='Installed offline Windows SAPI voices; original generated wording, no reference recording or actor imitation'}
$voiceInfo | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $Output 'VOICES.json') -Encoding UTF8
foreach($step in $data.steps){
 foreach($role in @('operator','missy')){
  $file=Join-Path $Output ('{0:D2}_{1}.wav' -f [int]$step.id,$role)
  $stream=New-Object -ComObject SAPI.SpFileStream
  $stream.Format.Type=22
  $stream.Open($file,3,$false)
  $tts.AudioOutputStream=$stream
  if($role -eq 'operator'){$tts.Voice=$operatorVoice;$tts.Rate=4;$text=$step.say;$pitch=2}else{$tts.Voice=$missyVoice;$tts.Rate=2;$text=$step.answer.en;$pitch=-2}
  $escaped=[System.Security.SecurityElement]::Escape([string]$text)
  $tts.Speak(('<pitch middle="{0}">{1}</pitch>' -f $pitch,$escaped),8) | Out-Null
  $stream.Close()
 }
 Write-Output ('Rendered '+$step.id+' '+$step.say)
}
