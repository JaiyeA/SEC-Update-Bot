# SEC Update Bot
A bot that constantly checks the SEC for new filings of any public company you choose.

## How to run it
In order to run the bot you have to change the email and password where you see
```var transporter = nodemailer.createTransporter...```
initialized. 

You must also change the emails in the **mailOptions** variable located at the ends of the **getData** and **updateCheck** function.

The program is set to excecute the **updateCheck** function every 6 hours. If you would like to change that, comment out the setinterval function to run it once or change the **timer** variable to your desired milliseconds.

Once you've modified the code, run the command ```node bot.js``` in your terminal.
