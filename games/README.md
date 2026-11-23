# games/

一款游戏 = 一个文件夹。**这里不放第一款游戏本体**，等选题定下来再从 `../template/` 复制。

## 结构

```
games/
  <game-slug>/            # kebab-case，如 zodiac-merge、goat-jump
    index.html           # 从 template 复制，基本不动
    config.js            # 必改：slug/title/主题/难度/版本号
    style.css            # 换皮改 :root 变量
    main.js              # 只改 TODO-GAME-1（规则）/ TODO-GAME-2（画面）
    assets/              # 本游戏贴图/音效
    README.md            # 本游戏一页说明：玩法、目标分、已知问题
    VERSION              # 纯文本，如 0.1.0，与 config.js 的 version 一致
    CHANGELOG.md         # 每次上线记一行：版本、日期、改了什么
```

## 新游戏流程

```bash
cp -r ../template ./<game-slug>
# 然后按 ../template/README.md 的换皮 5 步做
```

## 命名规则

- slug：小写 + 连字符，`<主题>-<玩法>`，如 `zodiac-merge`；一旦上线就不要改（GA4、链接、平台收录都认它）
- 版本：语义化 `主.次.修`，见 `docs/release-checklist.md` 的版本规则

## 当前状态

- （空）—— 模板已就绪，待选题（见 `docs/topic-research.md`）定下第一款再建文件夹。
