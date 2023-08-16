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
const DEFAULT_FONT_SIZE = 8;
export interface PDFTextItem {
  text: string;
  x: number;
  y: number;
  style?: PDFTextStyle;
}
export type PDFPageTexts = {
  pageNumber: number;
  texts: PDFTextItem[];
};

export async function addTextToPDF(
  doc: PDFDocument,
  textsByPages: PDFPageTexts[],
  font: PDFFont,
) {
  for (const { pageNumber, texts } of textsByPages) {
    const page = doc.getPage(pageNumber);
    page.setFont(font);
    for (const textItem of texts) {
      const { text, x, y, style } = textItem;
      page.setFontSize(style?.fontSize || DEFAULT_FONT_SIZE);
      page.setFontColor(style?.color || DEFAULT_FONT_COLOR);
      page.moveTo(x, y);
      page.drawText(text);
    }
  }
}
