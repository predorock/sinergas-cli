import * as puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

import * as files from './files';

export const getBillFileName = (bill: any) => {
  let type = '';
  switch (bill.type) {
    case 'power':
      type = 'LUCE';
      break;
    case 'gas':
      type = 'GAS';
      break;
    default:
      type = 'ALTRO';
  }
  const date = new Date(bill.issued);
  return `${type}-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export async function downloadBills(bills: any[], authorization: string) {
  return Promise.all(
    bills.map(async b => {
      const destinationFileName = getBillFileName(b);
      const destPath = files.createDirIfNotExists(path.resolve('./bills'));
      const req = await fetch(b.pdf, {
        headers: {
          authorization: 'SOL ' + authorization,
        },
      });
      const buf = await req.buffer();

      const req2 = await fetch(b.invoice.pdf, {
        headers: {
          authorization: 'SOL ' + authorization,
        },
      });

      const buf2 = await req2.buffer();

      return Promise.all([
        fs.writeFile(`${destPath}/${destinationFileName}.pdf`, buf, 'binary'),
        fs.writeFile(
          `${destPath}/${destinationFileName}-dettaglio.pdf`,
          buf2,
          'binary'
        ),
      ]);
    })
  );
}

export async function startScrapingBills(username: string, password: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://clienti.sinergas.it/login', {
    waitUntil: 'networkidle2',
  });
  await page.setViewport({width: 1400, height: 1298});

  page.on('response', async response => {
    const request = response.request();
    if (request.url().includes('/api/it/sol/bills')) {
      const res = await response.json() as any;
      const authorization = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        return localStorage.getItem('AUTH_TOKEN');
      });
      await downloadBills(res.bills, String(authorization));
      await browser.close();
    }
  });

  await page.waitForSelector('input[id=email]');
  await page.type('input[id=email]', username);
  await page.type('input[id=password]', password);

  await page.click('button[type="submit"]');

  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });

  await page.waitForResponse(
    response =>
      response.url() === 'https://clienti.sinergas.it/api/it/sol/bills' &&
      response.status() === 200
  );
}
