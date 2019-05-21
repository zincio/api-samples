# Zinc Orders Exporter

This simple project enables an API user to user their browser to generate a CSV file of all orders placed on a certain day.

## Usage
Modify `local-exporter.js` to have your secret client token in place of the `ENTER_YOUR_TOKEN_HERE` string:
```
const CLIENT_TOKEN = 'ENTER_YOUR_TOKEN_HERE';
```
Then load local-exporter.html in your browser, select the date you want to generate a report for and click `Download Orders`.

## Notes
This uses modern javascript features and has only been tested on Chrome v74.