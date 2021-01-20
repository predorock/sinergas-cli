const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const fetch = require('node-fetch');

const files = require('./files');

function getBillFileName(bill) {
    const type = bill.type === 'power' ? 'LUCE' : (bill.type === 'gas' ? 'GAS' : 'ALTRO');
    const date = new Date(bill.issued);
    return `${type}-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

async function downloadBills(bills, authorization) {
    return Promise.all(
        bills.map(async (b) => {
            const destinationFileName = getBillFileName(b);
            const destPath = files.createDirIfNotExists(files.absPath('./bills'));
            const req = await fetch(b.pdf, {
                headers: {
                    authorization: 'SOL ' + authorization
                }
            });
            const buf = await req.buffer();

            const req2 = await fetch(b.invoice.pdf, {
                headers: {
                    authorization: 'SOL ' + authorization
                }
            });

            const buf2 = await req2.buffer();

            return Promise.all([
                fs.writeFile(`${destPath}/${destinationFileName}.pdf`, buf, 'binary'),
                fs.writeFile(`${destPath}/${destinationFileName}-dettaglio.pdf`, buf2, 'binary'),
            ]);
        }))
}

async function startScrapingBills(username, password) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://clienti.sinergas.it/login', { waitUntil: 'networkidle2' });
    await page.setViewport({ width: 1400, height: 1298 });

    page.on('response', async (response) => {
        const request = response.request();
        if (request.url().includes('/api/it/sol/bills')) {
            const res = await response.json();
            const authorization = await page.evaluate(async () => {
                // eslint-disable-next-line no-undef
                return localStorage.getItem('AUTH_TOKEN');
            });
            await downloadBills(res.bills, authorization);
            await browser.close();
        }
    })


    await page.waitForSelector('input[id=email]');
    await page.type('input[id=email]', username);
    await page.type('input[id=password]', password);

    await page.click('button[type="submit"]');


    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });

    await page.screenshot({path: 'example.png'});

    // await page.goto('https://clienti.sinergas.it/bollette', { waitUntil: 'networkidle2' })

    await page.waitForResponse(response => response.url() === 'https://clienti.sinergas.it/api/it/sol/bills' && response.status() === 200);
} 

module.exports = {
    startScrapingBills
}