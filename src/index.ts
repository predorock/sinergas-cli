import * as chalk from 'chalk';
import * as figlet from 'figlet';

import {questions} from './inquirer';
import * as bills from './bills';

const run = async () => {
  console.log(
    chalk.blueBright(
      figlet.textSync('sinergas-cli', {horizontalLayout: 'full'})
    )
  );
  const credentials = await questions.askSinergasCredentials();
  await bills.startScrapingBills(credentials.username, credentials.password);
};

run();
