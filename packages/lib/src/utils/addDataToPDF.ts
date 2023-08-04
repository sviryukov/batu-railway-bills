import { Color, ColorTypes, PDFDocument, PDFFont } from 'pdf-lib';

export interface PDFTextStyle {
  fontSize?: number;
  color?: Color;
}
const DEFAULT_FONT_COLOR: Color = {
  type: ColorTypes.RGB,
  red: 0,
  green: 0,
  blue: 0,
};
const DEFAULT_FONT_SIZE = 7;
export interface PDFDataItem {
  text: string;
  x: number;
  y: number;
  style?: PDFTextStyle;
}
export type PDFPageData = {
  pageNumber: number;
  data: PDFDataItem[];
};

export async function addDataToPDF(
  doc: PDFDocument,
  dataByPages: PDFPageData[],
  font: PDFFont,
) {
  for (const { pageNumber, data } of dataByPages) {
    const page = doc.getPage(pageNumber);
    page.setFont(font);
    for (const dataItem of data) {
      const { text, x, y, style } = dataItem;
      page.setFontSize(style?.fontSize || DEFAULT_FONT_SIZE);
      page.setFontColor(style?.color || DEFAULT_FONT_COLOR);
      page.moveTo(x, y);
      page.drawText(text);
    }
  }
}
