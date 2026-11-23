# template/assets

每个游戏自己的贴图/音效放这里（复制模板时一起复制走）。

约定：
- 贴图：PNG，背景透明；玩家/目标/障碍各 1 张，先用 emoji 占位也可以不上文件
- 音效：MP3，短音效 <100KB；`main.js` 的 `beep()` 换成 Audio 播放时再放
- 命名：`player.png` / `target.png` / `obstacle.png` / `bg.png` / `click.mp3` / `win.mp3`
- 引用方式：`config.js` 的 `theme.sprites` 里写相对路径，如 `assets/player.png`

共享素材（多游戏共用、比如通用按钮音）放 `../../assets/shared/`，不要每个游戏复制一份。
