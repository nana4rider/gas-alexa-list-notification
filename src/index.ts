
const gas: any = global;
import { diffLines } from 'diff';

/* Sample: [
  {
    "name": "買い物リスト",
    "latestCell": "B2",
    "currentCell": "B3",
    "webhookUrl": "https://discord.com/api/webhooks/****",
    "listUrl": "https://amzn.to/****"
  },
  {
    "name": "やることリスト",
    "latestCell": "B4",
    "currentCell": "B5",
    "webhookUrl": "https://discord.com/api/webhooks/****",
    "listUrl": "https://amzn.to/****"
  }
] */
type ListConfig = {
  name: string,
  latestCell: string,
  currentCell: string,
  webhookUrl: string,
  listUrl: string
};

gas._main = () => {
  const SPREAD_SHEET_ID = getProperty('SPREAD_SHEET_ID');

  const spreadSheet = SpreadsheetApp.openById(SPREAD_SHEET_ID);
  const mainSheet = spreadSheet.getSheets()[0];
  if (!mainSheet) throw new Error('シートが存在しません');

  const listConfigs: ListConfig[] = JSON.parse(mainSheet.getRange('B1').getValue());

  for (const listConfig of listConfigs) {
    const latestRange = mainSheet.getRange(listConfig.latestCell);
    const currentRange = mainSheet.getRange(listConfig.currentCell);
    const latestValue: string | undefined = latestRange.getValue();
    const currentValue: string | undefined = currentRange.getValue();

    if (latestValue === currentValue) {
      console.log(`${listConfig.name}: 更新なし`);
      continue;
    }

    let message = `${listConfig.name}が更新されました。\n`;
    const oldText = getDiffText(currentValue);
    const newText = getDiffText(latestValue);
    const changes = diffLines(oldText, newText);

    message += '```diff\n';
    for (const block of changes) {
      const prefix = block.added ? '+' :
        block.removed ? '-' : ' ';
      for (const line of block.value.trim().split(/\r?\n/)) {
        message += `${prefix} ${line}\n`;
      }
    }
    message += '```';

    UrlFetchApp.fetch(listConfig.webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        content: message,
        embeds: [{
          title: '編集',
          url: listConfig.listUrl
        }]
      }),
      muteHttpExceptions: true
    });

    currentRange.setValue(latestValue);
  }
};

function getDiffText(text?: string): string {
  if (!text) return '';
  return text.replace(/"/g, '').replace(/,/g, '\n') + '\n';
}

function getProperty(key: string, defaultValue?: string): string {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (value) return value;
  if (defaultValue) return defaultValue;
  throw new Error(`Undefined property: ${key}`);
}
