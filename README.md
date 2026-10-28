# xjtu-journals

[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![SheetJS](https://img.shields.io/badge/SheetJS-0.18.5-217346)](https://sheetjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A web tool for quickly checking whether a journal or conference is included in the **2022 Edition of the Social Evaluation Journal Directory and Conference List for Doctoral Dissertation** of Xi'an Jiaotong University.

## Features

* **Full support for journals and conferences** — All journal and conference documents are built-in and searchable within the system.
* **Custom Upload** — Upload your own Excel files as needed. Files are processed entirely in your local browser and are never uploaded to any server.
* **Fuzzy Search** — Match keywords across all columns without specifying a field.
* **Filter by File** — Search within one or more selected files only.
* **Source Labeling** — Each result shows its source file, making it easy to confirm where it comes from.
* **Pure Frontend Processing** — No data is uploaded to a server; everything is parsed in the browser.

## File Format Requirements

* Supports `.xlsx` and `.xls` formats.
* Column names must be in the **first row**.
* Data must be in the **first worksheet**.
* The **column names of multiple files should be consistent**, otherwise they will be treated as different fields.

## Local Development

```bash
git clone https://github.com/pf-z/xjtu-journals.git
cd xjtu-journals
npm install
npm run dev
```

The tool automatically creates and reads the `public/excel/journals/index.json` and `public/excel/conferences/index.json` files, then loads the files listed within them.

## Production Build

```bash
npm run build
```

The build output goes to `dist/`.

## Data Source

* 2022 Edition of the Social Evaluation Journal Directory and Conference List for Doctoral Dissertation
* Publisher: Graduate School of Xi'an Jiaotong University
* Announcement: https://gs.xjtu.edu.cn/info/1148/8964.htm
* Published: 2022-09-13

> This tool only provides search functionality. The final interpretation of the directory belongs to the Graduate School of Xi'an Jiaotong University. Please refer to the latest official version. This project is not affiliated with or endorsed by the Graduate School of Xi'an Jiaotong University.

## Tech Stack

* [Vue 3](https://vuejs.org/) — Frontend framework
* [Vite](https://vite.dev/) — Build tool
* [SheetJS](https://sheetjs.com/) — Excel parsing

## License

[MIT](LICENSE)