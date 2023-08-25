import fontkit from '@pdf-lib/fontkit';
import { merge } from 'lodash';
import { PDFDocument } from 'pdf-lib';
import PDFMerger from 'pdf-merger-js';
import pdfParse from 'pdf-parse';

import { addTextToPDF, PDFPageTexts, PDFTextItem } from '../utils/addTextToPDF';
import { ContainerData } from '../utils/getContainersDataFromXLS';

export interface RailwayBillsPDFServiceOptions {
  railwayBillPDFFormat: {
    containerNumberPreText: string;
    containerNumberAfterText: string;
  };
  defaultFontURL: string;
}
const defaultRailwayBillsPDFServiceOptions: RailwayBillsPDFServiceOptions = {
  railwayBillPDFFormat: {
    containerNumberPreText: '15 Наименование груза',
    containerNumberAfterText: '23 Уплата провозных платежей',
  },
  defaultFontURL: 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf',
};

const containerPropsTextOptions: {
  [key in keyof Omit<ContainerData, 'number'>]: Omit<PDFTextItem, 'text'>;
} = {
  station: { x: 28, y: 610 },
  wagonNumber: {
    x: 199,
    y: 632.5,
    containerWidth: 128,
    style: { align: 'center' },
  },
  wagonOwner: {
    x: 197,
    y: 622,
    containerWidth: 128,
    style: { align: 'center' },
  },
  providedBy: {
    x: 327,
    y: 638,
    containerWidth: 22,
    style: { align: 'center' },
  },
  loadCapacity: {
    x: 349,
    y: 638,
    containerWidth: 29,
    style: { align: 'center' },
  },
  axles: { x: 378, y: 638, containerWidth: 22, style: { align: 'center' } },
  weight: { x: 400, y: 638, containerWidth: 38, style: { align: 'center' } },
};
export interface TransporterData {
  name: string;
  section: string;
  stationCode: string;
}
const transporterPropsTextOptions: {
  [key in keyof TransporterData]: Omit<PDFTextItem, 'text'>;
} = {
  name: { x: 300, y: 275 },
  section: { x: 385, y: 275, containerWidth: 140, style: { align: 'center' } },
  stationCode: {
    x: 525,
    y: 280,
    containerWidth: 55,
    style: { align: 'center' },
  },
};
const TRANSPORTERS_LIST_GAP = 25;

export class RailwayBillsPDFService {
  public options: RailwayBillsPDFServiceOptions;

  constructor(options: Partial<RailwayBillsPDFServiceOptions> = {}) {
    this.options = merge(defaultRailwayBillsPDFServiceOptions, options);
  }

  async createAllContainersPDF(
    pdfBuffers: Buffer[],
    containers: ContainerData[],
    transporters: TransporterData[],
  ) {
    const merger = new PDFMerger();
    await Promise.all(
      pdfBuffers.map((pdfBuffer) =>
        this.getContainerNumberFromBillPDF(pdfBuffer)
          .then((containerNumber) => {
            const container = containers.find(
              ({ number }) => containerNumber === number?.toString().trim(),
            );
            if (!container) {
              throw new Error(
                `Отсутствуют данные для контейнера № ${containerNumber}`,
              );
            }
            return this.addContainerDataToPDF(
              pdfBuffer,
              container,
              transporters,
            );
          })
          .then((pdf) => merger.add(Buffer.from(pdf))),
      ),
    );
    return merger.saveAsBuffer();
  }

  async addContainerDataToPDF(
    pdfBuffer: Buffer,
    container: ContainerData,
    transporters: TransporterData[],
  ) {
    const doc = await PDFDocument.load(pdfBuffer);
    doc.registerFontkit(fontkit);
    const fontBuffer = await fetch(this.options.defaultFontURL).then((res) =>
      res.arrayBuffer(),
    );
    const font = await doc.embedFont(fontBuffer);

    const texts: PDFPageTexts[] = [];
    for (let i = 0; i < doc.getPageCount(); i += 2) {
      const pageTexts: PDFPageTexts = { pageNumber: i, texts: [] };
      for (const key in container) {
        if (key === 'number' || container[key] === undefined) continue;
        pageTexts.texts.push({
          ...containerPropsTextOptions[key],
          text: container[key].toString(),
        });
      }
      for (let i = 0; i < transporters.length; i++) {
        const transporter = transporters[i];
        for (const key in transporter) {
          if (transporter[key] === undefined) continue;
          pageTexts.texts.push({
            ...transporterPropsTextOptions[key],
            text: transporter[key].toString(),
            y: transporterPropsTextOptions[key].y - i * TRANSPORTERS_LIST_GAP,
          });
        }
      }
      texts.push(pageTexts);
    }
    addTextToPDF(doc, texts, font);
    return doc.save();
  }

  async getContainerNumberFromBillPDF(pdfBuffer: Buffer) {
    const { text } = await pdfParse(pdfBuffer);
    const containerNumber = text
      .split(this.options.railwayBillPDFFormat.containerNumberPreText)[1]
      ?.split(this.options.railwayBillPDFFormat.containerNumberAfterText)[0]
      .split(' ')[0];
    if (!containerNumber) {
      throw new Error(
        `Неверный формат PDF-файла ЖДН: отсутствует номер контейнера между строками "${this.options.railwayBillPDFFormat.containerNumberPreText}" и "${this.options.railwayBillPDFFormat.containerNumberPreText}"`,
      );
    }
    return containerNumber.trim();
  }
}
