# excel-search

[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![SheetJS](https://img.shields.io/badge/SheetJS-0.18.5-217346)](https://sheetjs.com/)
[![在线演示](https://img.shields.io/badge/在线演示-GitHub%20Pages-222?logo=github&logoColor=white)](https://pf-z.github.io/excel-search/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个用于检索多份 Excel 数据的网页工具。

## 项目背景

科研评价、期刊目录、学科分类等场景中，数据往往按类别拆分成多个 Excel 文件，结构相同但分散存储。想在其中查找某条记录时，需要逐个打开文件、逐个表格搜索，非常低效。

本项目把这些结构相同的 Excel 文件合并到一张统一的可搜索表格中，保留每条记录的来源文件，让你在一个界面里完成跨文件的检索。

## 功能

* **多文件合并检索** — 同时加载多个结构相同的 Excel 文件，合并为一张表。
* **模糊搜索** — 在所有列中匹配关键词，无需指定字段。
* **按文件筛选** — 只在一个或多个指定文件中搜索。
* **来源标识** — 每条结果显示其来源文件。
* **纯前端处理** — 数据不上传服务器，全部在浏览器中解析。

## 文件格式要求

* 支持 `.xlsx` 和 `.xls` 格式。
* 列名放在**第一行**。
* 数据放在**第一个工作表**中。
* 多个文件的**列名应保持一致**，否则会被视为不同字段。

> `index.json` 仅用于开发环境。生产构建不会包含任何 Excel 数据和该清单文件，详见下方「生产构建」。

## 本地开发

```bash
git clone https://github.com/pf-z/excel-search.git
cd excel-search
npm install
npm run dev
```

开发模式下，工具会自动生成并读取 `public/excel/index.json` 并加载其中列出的文件。

## 生产构建

```bash
npm run build
```

构建产物输出到 `dist/`。

生产构建的 `dist/` 不包含任何 Excel 文件和数据，可以安全地公开部署。

在线演示部署在 GitHub Pages，仅展示工具本身的界面和搜索能力，不包含真实数据。

## 技术栈

* [Vue 3](https://vuejs.org/) — 前端框架
* [Vite](https://vite.dev/) — 构建工具
* [SheetJS](https://sheetjs.com/) — Excel 解析

## License

[MIT](LICENSE)