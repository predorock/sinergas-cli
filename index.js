const chalk = require('chalk');
const figlet = require('figlet');
const inquirer  = require('./src/inquirer');
const bills = require('./src/bills');


const run = async () => {
  console.clear();
  console.log(
    chalk.blueBright(
      figlet.textSync('sinergas-cli', { horizontalLayout: 'full' })
    )
  );
  const credentials = await inquirer.askSinergasCredentials();
  await bills.startScrapingBills(credentials.username, credentials.password);
};

run();