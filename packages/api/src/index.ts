import {
  getContainersDataFromXLS,
  getWagonsAndContainersNumbersFromXLS,
  RailwayBillsPDFService,
  TransporterData,
} from 'batu-railway-bills-lib';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { unflatten } from 'flat';
import multer from 'multer';
import pino from 'pino-http';

dotenv.config();

const app = express();
app.use(cors());
app.use(pino());
const upload = multer();

const defaultFontURL = process.env.DEFAULT_FONT_URL;
const railwayBillsPDFService = new RailwayBillsPDFService({ defaultFontURL });

app.post('/createAllContainersPDF', upload.any(), async (req, res) => {
  try {
    if (!Array.isArray(req.files)) return res.status(400).send();
    const xlsx = req.files.find((file) => file.fieldname === 'dataXlsx');
    if (!xlsx) return res.status(400).send('No XLSX file');
    const pdfs = req.files.filter((file) =>
      /^pdfs\[\d*]$/.test(file.fieldname),
    );
    const transporters = Object.values(
      unflatten(req.body) as { [prop: string]: unknown },
    ) as TransporterData[];
    const containers = await getContainersDataFromXLS(xlsx.buffer);
    const resultPDFBuffer = await railwayBillsPDFService.createAllContainersPDF(
      pdfs.map((file) => file.buffer),
      containers,
      transporters,
    );
    res.send(resultPDFBuffer);
  } catch (e) {
    req.log.error(e);
    if (e?.message) res.statusMessage = encodeURIComponent(e.message);
    res.status(400).end();
  }
});

app.get<string, { xlsxUrl: string }>(
  '/getWagonsAndContainersNumbers',
  async (req, res) => {
    try {
      if (!req.query.xlsxUrl) return res.status(400).send();
      const xlsxDownloadResponse = await fetch(req.query.xlsxUrl.toString());
      const xlsxBuffer = Buffer.from(await xlsxDownloadResponse.arrayBuffer());
      res.send(getWagonsAndContainersNumbersFromXLS(xlsxBuffer));
    } catch (e) {
      req.log.error(e);
      if (e?.message) res.statusMessage = encodeURIComponent(e.message);
      res.status(400).end();
    }
  },
);

const port = process.env.APP_PORT || 3001;
app.listen(port, () => {
  console.log('App listening on port ' + port);
});
