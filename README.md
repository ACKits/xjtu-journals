# excel-search

[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![SheetJS](https://img.shields.io/badge/SheetJS-0.18.5-217346)](https://sheetjs.com/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-222?logo=github&logoColor=white)](https://pf-z.github.io/excel-search/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[中文文档](README.zh-CN.md)

A web tool for searching across multiple Excel files.

## Background

In scenarios like research evaluation, journal catalogs, and subject classification, data is often split across multiple Excel files with identical structure but stored separately. Finding a specific record means opening each file and searching each sheet one by one — an inefficient process.

This project merges those structurally identical Excel files into a single searchable table, preserving the source file of each record so you can search across all files from one interface.

## Features

* **Multi-file search** — Load multiple structurally identical Excel files and merge them into one table.
* **Fuzzy search** — Match keywords across all columns without specifying a field.
* **Filter by file** — Restrict the search to one or more selected files.
* **Source tracking** — Each result shows its source file.
* **Pure front-end** — Data is parsed entirely in the browser and never uploaded to a server.

## File Requirements

* Supports `.xlsx` and `.xls` formats.
* Column names must be in the **first row**.
* Data must be in the **first worksheet**.
* Column names should be **consistent** across files; otherwise, they will be treated as different fields.

> `index.json` is only used in the development environment. The production build does not include any Excel data or the manifest file. See "Production Build" below.

## Local Development

```bash
git clone https://github.com/pf-z/excel-search.git
cd excel-search
npm install
npm run dev
```

In development mode, the tool automatically generates and reads `public/excel/index.json`, then loads the listed files.

## Production Build

```bash
npm run build
```

The build output is placed in `dist/`.

The production `dist/` does not include any Excel files or data, so it can be deployed publicly without exposing the source data.

The live demo is hosted on GitHub Pages and only demonstrates the interface and search capabilities, without any real data.

## Tech Stack

* [Vue 3](https://vuejs.org/) — Front-end framework
* [Vite](https://vite.dev/) — Build tool
* [SheetJS](https://sheetjs.com/) — Excel parsing

## License

[MIT](LICENSE)