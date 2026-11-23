# assets/shared/

多游戏共用的共享素材，避免每个游戏复制一份。

放这里的东西：
- 通用音效：`click.mp3`、`win.mp3`、`lose.mp3`（短音效，<100KB）
- 通用图标：返回、暂停、分享等 UI 图标
- 品牌素材：Zodiac AI logo（如果游戏里要放“Back to Zodiac AI”入口）

不要放的东西：
- 某一款游戏专属的贴图/角色 → 放 `games/<slug>/assets/`
- 大文件：单文件 >500KB 先压缩再放；背景音乐不要放共享目录，按游戏放

引用方式：游戏里用相对路径 `../../assets/shared/click.mp3`。
注意：上架 itch/CrazyGames 的单文件包时，共享文件要一起打进包里或改成内联，见 `docs/deployment-cloudflare-pages.md` 的“平台打包”一节。
