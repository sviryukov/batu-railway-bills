import XLSX from 'xlsx';

export type Wagons = Array<{
  number: string;
  container1number: string;
  container2number: string;
}>;

export function getWagonsAndContainersNumbersFromXLS(xlsxBuffer: Buffer) {
  const wagons: Wagons = [];
  const { Sheets, SheetNames } = XLSX.read(xlsxBuffer);
  const defaultSheet = Sheets[SheetNames[0]];
  if (!defaultSheet)
    throw new Error(`Ошибка при обработке XLSX-файла: пустой файл`);
  for (let i = 2; Boolean(defaultSheet[`A${i}`]); i++) {
    const wagonNumber = defaultSheet[`A${i}`].v.toString();
    const containerNumber = defaultSheet[`B${i}`].v.toString();
    const wagon = wagons.find(({ number }) => number === wagonNumber);
    if (!wagon) {
      wagons.push({
        number: wagonNumber,
        container1number: containerNumber,
        container2number: '',
      });
    } else {
      wagon.container2number = containerNumber;
    }
  }
  return wagons;
}
