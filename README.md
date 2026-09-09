# excel-search

[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js\&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite\&logoColor=white)](https://vite.dev/)
[![SheetJS](https://img.shields.io/badge/SheetJS-0.18.5-217346)](https://sheetjs.com/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-222?logo=github\&logoColor=white)](https://pf-z.github.io/excel-search/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Excel Search** is a lightweight web-based tool for searching and browsing data from multiple Excel files directly in the browser. It is designed for situations where collections of structured spreadsheets need to be searched quickly without repeatedly opening individual files.

The application combines data from multiple Excel files into a unified searchable table while preserving the source file of each record. Users can search across all available fields and narrow the results by selecting specific files.

## Features

* **Multiple Excel files** — Load multiple `.xlsx` or `.xls` files and process them together.
* **Fuzzy search** — Search for keywords across all columns without specifying a particular field.
* **File filtering** — Filter search results by one or more source files.
* **Unified results** — Data from multiple files is displayed in a single searchable table.
* **Source identification** — Each result retains information about its original Excel file.
* **Fixed table header** — Keep column headers visible while browsing large result sets.
* **Horizontal scrolling** — Easily navigate tables with many columns.
* **Browser-based processing** — Excel files are parsed and processed locally in the browser.

## Excel File Requirements

Multiple Excel files can be loaded together. The tool is designed primarily for files that share a common data structure, so **consistent column names are recommended** when combining multiple files.

Each Excel file should follow these conventions:

* Use the **same column names** across files whenever possible.
* Keep the column order consistent when possible.
* Place column names in the **first row**.
* Store the data in the **first worksheet** of each file.
* Use either `.xlsx` or `.xls` format.

The files do not need to contain the same records or values. However, if the column names differ between files, the application may treat them as different fields when combining the data.

For example, the following structure is recommended:

```text
File A

Journal Title        | JCR Quartile | Impact Factor
---------------------|--------------|--------------
Journal A            | Q1           | 8.2
Journal B            | Q2           | 4.5
Journal C            | Q1           | 10.1
```

```text
File B

Journal Title        | JCR Quartile | Impact Factor
---------------------|--------------|--------------
Journal D            | Q1           | 7.8
Journal E            | Q2           | 5.1
Journal F            | Q3           | 3.2
```

Using different names for the same field, such as `Quartile` in one file and `JCR Quartile` in another, may result in separate columns in the combined dataset.

## How It Works

When multiple Excel files are loaded, the application reads the first worksheet of each file and converts its rows into searchable records. Each record is associated with its original file name, allowing users to identify the source of a search result.

Search is performed across the available columns, making it possible to locate records without specifying which field contains the target information.

All Excel processing takes place in the browser. No dedicated backend server is required to read or search the files.

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/pf-z/excel-search.git
cd excel-search
npm install
```

## Development

Start the local development server:

```bash
npm run dev
```

The terminal will display the local address of the development server. Open that address in your browser to use the application.

For local development, Excel files can be placed in the project's Excel data directory and loaded by the application.

## Production Build

Create a production build with:

```bash
npm run build
```

The generated files will be placed in the `dist/` directory.

The production/demo build does not include the local Excel dataset. This allows the application to be deployed publicly without publishing the underlying Excel files.

## Technology

* [Vue 3](https://vuejs.org/) — Front-end framework
* [Vite](https://vite.dev/) — Build tool and development server
* [SheetJS](https://sheetjs.com/) — Excel file parsing

## License

This project is licensed under the [MIT License](LICENSE).
