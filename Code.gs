function doPost(e) {
  const sheet = SpreadsheetApp.openById("YOUR_SHEET_ID").getSheets()[0];
  const data = JSON.parse(e.postData.contents);

  // Добавляем строку с данными
  sheet.appendRow([
    new Date(),           // Время отправки
    data.name,            // Имя
    data.phone,           // Телефон
    data.birthdate        // Дата рождения
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ result: "success" })
  ).setMimeType(ContentService.MimeType.JSON);
}