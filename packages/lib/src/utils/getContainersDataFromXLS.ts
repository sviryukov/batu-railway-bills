import XLSX, { CellObject } from 'xlsx';

export interface ContainerData {
  number: CellObject['v'];
  station: CellObject['v'];
  wagonNumber: CellObject['v'];
  wagonOwner: CellObject['v'];
  providedBy: CellObject['v'];
  loadCapacity: CellObject['v'];
  axles: CellObject['v'];
  weight: CellObject['v'];
}

const CONTAINERS_LIST_NAME = 'Контейнеры';
const DEFAULT_CONTAINER_PROVIDED_BY_VALUE = 'О';
const DEFAULT_CONTAINER_AXLES_VALUE = '4';

export async function getContainersDataFromXLS(xlsxBuffer: Buffer) {
  const containers: ContainerData[] = [];
  const { Sheets } = XLSX.read(xlsxBuffer);
  const containersSheet = Sheets[CONTAINERS_LIST_NAME];
  if (!containersSheet)
    throw new Error(
      `Ошибка при обработке XLSX-файла: отсутствует лист "${CONTAINERS_LIST_NAME}"`,
    );
  for (let i = 2; Boolean(containersSheet[`A${i}`]); i++) {
    containers.push({
      number: containersSheet[`A${i}`].v,
      station: containersSheet[`B${i}`].v,
      wagonNumber: containersSheet[`C${i}`].v,
      wagonOwner: containersSheet[`D${i}`].v,
      loadCapacity: containersSheet[`E${i}`].v,
      weight: containersSheet[`F${i}`].v,
      providedBy: DEFAULT_CONTAINER_PROVIDED_BY_VALUE,
      axles: DEFAULT_CONTAINER_AXLES_VALUE,
    });
  }
  return containers;
}
