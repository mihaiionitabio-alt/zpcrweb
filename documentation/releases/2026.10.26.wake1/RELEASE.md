# Addressed voice commands and original computer responses

26 October 2026. Start voice first. Each spoken action must be addressed to **Computer** or **Missy**. Examples: “Computer, next”, “Missy, forward”, “Computer, two”, “Missy, previous”. Numbered submenu options use the same prefix. Numbers zero–fifteen remain supported. Plain numbers without a name are ignored unless the name was recognized in the preceding five seconds. One wake acknowledgement per result index; one action per result index. A successful command consumes the listening window. The browser may keep a long utterance in one result: pause between separate commands.

The acknowledgement is a short original two-tone cue, with “Ready” spoken only if a suitable local voice is available. It obeys global sound and individual cue settings. No cloud voice or character imitation is used. The catalogue now has 61 cues; twelve existing responses were adapted rather than adding twelve duplicate events.

The supplied archives are Star Trek movie/TNG scripts, not Star Wars. They were inspected as reference data only. The source register records both archive hashes. Original adapted responses are mapped to existing interface events:

| Event | English | Chinese |
|---|---|---|
| Read requested | Processing the selected data. | 正在处理所选数据。 |
| Files selected | Input received. Standing by to read. | 已接收输入，等待读取。 |
| Data read | Reading complete. Data ready for review. | 读取完成，数据可供审核。 |
| Integrity page | File integrity records on screen. | 文件完整性记录已显示。 |
| Application error | Action incomplete. Check the displayed details. | 操作未完成，请查看显示的详细信息。 |
| Next | Next chart on screen. | 下一张图表已显示。 |
| Previous | Previous chart on screen. | 上一张图表已显示。 |
| Save method | Method profile prepared for saving. | 方法配置已准备保存。 |
| Start voice requested | Voice controls ready. | 语音控制已就绪。 |
| Stop voice | Voice controls off. | 语音控制已关闭。 |
| Report requested | Preparing the selected report. | 正在准备所选报告。 |
| Save status requested | Preparing a status summary. | 正在准备状态摘要。 |

These are presentation cues, not evidence of successful scientific analysis or file saving. Existing event dispatch remains unchanged. Twelve response texts and one acknowledgement cue change; no original recordings are embedded.

Chrome tests use emulated recognizer events: both wake names, standalone wake, window expiry, all sixteen numbers, stable interim results, corrections, duplicate finalization, conflicts, negation and Stop cancellation passed. Physical microphone transcription accuracy is not asserted. Scientific code, readers, results, export code and full font remain byte-identical to the previous scientific baseline; only the voice controller and embedded sound catalogue differ. Existing separate-format regression evidence is in voice-stable1. The application remains a single offline HTML file.
