# gas-alexa-list-notification
Alexaリスト更新通知

スプレッドシートに記載されたAlexaリストの内容を読み取り、  
内容に変更があった場合Discordに通知する。

![](images/discord.png)

![](images/sheet.png)

```mermaid
sequenceDiagram
  participant ax as Alexa
  participant sp as Google スプレッドシート
  participant ga as Google Apps Script
  participant dc as Discord

  ax ->> sp : IFTTT
  ga ->> sp : Request Sheet Values
  sp -->> ga : Sheet Values
  ga ->> dc : Webhooks
```

## プロジェクトのデプロイ
```
npm run deploy
```

## appsscript.jsonのダウンロード
```
npm run pull
```
