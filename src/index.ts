
const gas: any = global;
import { diffLines } from 'diff';

gas._main = () => {
  const SPREAD_SHEET_ID = getProperty('SPREAD_SHEET_ID');
  const WEBHOOK_URL = getProperty('WEBHOOK_URL');

  const spreadSheet = SpreadsheetApp.openById(SPREAD_SHEET_ID);
  const mainSheet = spreadSheet.getSheets()[0];
  if (!mainSheet) throw new Error('シートが存在しません');

  const values = mainSheet.getRange(2, 2, 2, 1).getValues();
  const alexaValue: string | undefined = values[0][0];
  const discordValue: string | undefined = values[1][0];

  if (!alexaValue || alexaValue === discordValue) return;

  let message = '買い物リストが更新されました。\n';
  const oldText = getDiffText(discordValue);
  const newText = getDiffText(alexaValue);
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

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      content: message,
      embeds: [{
        title: '編集',
        url: 'https://amzn.to/2WNkAeh'
      }]
    }),
    muteHttpExceptions: true
  });

  mainSheet.getRange(3, 2).setValue(alexaValue);
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
