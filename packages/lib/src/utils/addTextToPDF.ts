import { Color, ColorTypes, PDFDocument, PDFFont, PDFPage } from 'pdf-lib';

export interface PDFTextStyle {
  fontSize?: number;
  color?: Color;
  align?: 'center';
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
  containerWidth?: number;
  style?: PDFTextStyle;
}
export type PDFPageTexts = {
  pageNumber: number;
  texts: PDFTextItem[];
};

export function addTextToPDF(
  doc: PDFDocument,
  textsByPages: PDFPageTexts[],
  font: PDFFont,
) {
  for (const { pageNumber, texts } of textsByPages) {
    const page = doc.getPage(pageNumber);
    page.setFont(font);
    texts.forEach((textItem) => addTextItemToPDF(page, textItem, font));
  }
}

export function addTextItemToPDF(
  page: PDFPage,
  textItem: PDFTextItem,
  font: PDFFont,
) {
  const { text, x, y, containerWidth, style } = textItem;
  const fontSize = style?.fontSize || DEFAULT_FONT_SIZE;
  const color = style?.color || DEFAULT_FONT_COLOR;
  page.setFontSize(fontSize);
  page.setFontColor(color);
  if (style?.align === 'center' && typeof containerWidth === 'number') {
    const containerMiddle = x + containerWidth / 2;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.moveTo(containerMiddle - textWidth / 2, y);
  } else page.moveTo(x, y);
  page.drawText(text);
}
