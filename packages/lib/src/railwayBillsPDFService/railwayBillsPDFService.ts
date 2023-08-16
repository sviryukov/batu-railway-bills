import fontkit from '@pdf-lib/fontkit';
import { merge } from 'lodash';
import { PDFDocument } from 'pdf-lib';
import PDFMerger from 'pdf-merger-js';
import pdfParse from 'pdf-parse';

import { addDataToPDF, PDFDataItem, PDFPageData } from '../utils/addDataToPDF';
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
  [key in keyof Omit<ContainerData, 'number'>]: Omit<PDFDataItem, 'text'>;
} = {
  station: { x: 28, y: 610 },
  wagonNumber: { x: 202, y: 633 },
  wagonOwner: { x: 202, y: 621 },
  providedBy: { x: 335, y: 638 },
  loadCapacity: { x: 357, y: 638 },
  axles: { x: 386, y: 638 },
  weight: { x: 415, y: 638 },
};
export interface TransporterData {
  name: string;
  section: string;
  stationCode: string;
}
const transporterPropsTextOptions: {
  [key in keyof TransporterData]: Omit<PDFDataItem, 'text'>;
} = {
  name: { x: 300, y: 275 },
  section: { x: 388, y: 275 },
  stationCode: { x: 527, y: 280 },
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
    const newPdfs: Uint8Array[] = [];
    for (const pdfBuffer of pdfBuffers) {
      const containerNumber = await this.getContainerNumberFromBillPDF(
        pdfBuffer,
      );
      const container = containers.find(
        ({ number }) => containerNumber === number?.toString().trim(),
      );
      if (!container) {
        throw new Error(`No data for container with number ${containerNumber}`);
      }
      newPdfs.push(
        await this.addContainerDataToPDF(pdfBuffer, container, transporters),
      );
    }
    const merger = new PDFMerger();
    for (const pdf of newPdfs) {
      await merger.add(Buffer.from(pdf));
    }
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

    const data: PDFPageData[] = [];
    for (let i = 0; i < doc.getPageCount(); i += 2) {
      const pageData: PDFPageData = { pageNumber: i, data: [] };
      for (const key in container) {
        if (key === 'number' || container[key] === undefined) continue;
        pageData.data.push({
          ...containerPropsTextOptions[key],
          text: container[key].toString(),
        });
      }
      for (let i = 0; i < transporters.length; i++) {
        const transporter = transporters[i];
        for (const key in transporter) {
          if (transporter[key] === undefined) continue;
          pageData.data.push({
            ...transporterPropsTextOptions[key],
            text: transporter[key].toString(),
            y: transporterPropsTextOptions[key].y - i * TRANSPORTERS_LIST_GAP,
          });
        }
      }
      data.push(pageData);
    }
    await addDataToPDF(doc, data, font);
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
        `Invalid railwayBill PDF format: no container number between "${this.options.railwayBillPDFFormat.containerNumberPreText}" and "${this.options.railwayBillPDFFormat.containerNumberPreText}"`,
      );
    }
    return containerNumber.trim();
  }
}
