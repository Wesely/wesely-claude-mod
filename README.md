# wesely-claude-mod

自用的 Claude Code mod 集合，本 repo 同時是 plugin marketplace。

## 安裝

```
/plugin marketplace add wesely/wesely-claude-mod
/plugin install usage@wesely-claude-mod
```

裝完重開 Claude Code。

## Mods

### usage

輸入框下方的提示列改為單行顯示：

```
⏵⏵ auto mode on (shift+tab to cycle) · 💻 Session 名稱            5hr: 3% · Weekly: 10%
```

- 左側：💻 本機；📶 有遠端畫面（Remote Control 的手機或網頁）連入。後接 session 名稱，優先取 `/rename` 的自訂名稱，其次取自動產生的標題。
- 右側：5 小時與每週用量，依終端機寬度靠右；寬度不足時接在名稱後方。
- 用量須為訂閱方案；尚無讀數時顯示 `--`。

## 開發

```
claude plugin validate usage
claude plugin test usage
```

修改後更新已安裝的版本：

```
claude plugin marketplace update wesely-claude-mod
claude plugin update usage@wesely-claude-mod
```
