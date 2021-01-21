import * as inquirer from "inquirer";

export const questions = {
  askSinergasCredentials: () => {
    return inquirer.prompt([
      {
        name: "username",
        type: "input",
        message: "Enter your Sinergas e-mail address:",
        validate: (value: any) => {
          if (value.length) {
            return true;
          } else {
            return "Please enter your e-mail address.";
          }
        },
      },
      {
        name: "password",
        type: "password",
        message: "Enter your password:",
        validate: (value: any) => {
          if (value.length) {
            return true;
          } else {
            return "Please enter your password.";
          }
        },
      },
    ])
  }
};
