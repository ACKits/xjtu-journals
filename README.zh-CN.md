# xjtu-journals

[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![SheetJS](https://img.shields.io/badge/SheetJS-0.18.5-217346)](https://sheetjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个用于快速检索 **2022版博士研究生学位论文社会评价期刊目录和会议名录** 收录情况的网页工具。

## 功能

* **内置 12 份目录数据**：已内置该目录中 12 份 Excel 数据，开箱即用（会议目录后续会补充）。
* **支持自行上传**：可按需上传自己的 Excel 文件，文件仅在本地浏览器中处理，不会上传到任何服务器。
* **模糊搜索**：在所有列中匹配关键词，无需指定字段。
* **按文件筛选**：只在一个或多个指定文件中搜索。
* **来源标识**：每条结果显示其来源文件，方便确认收录来源。
* **纯前端处理**：数据不上传服务器，全部在浏览器中解析。

## 文件格式要求

* 支持 `.xlsx` 和 `.xls` 格式。
* 列名放在**第一行**。
* 数据放在**第一个工作表**中。
* 多个文件的**列名应保持一致**，否则会被视为不同字段。

## 本地开发

```bash
git clone https://github.com/ACKits/xjtu-journals.git
cd xjtu-journals
npm install
npm run dev
```

工具会自动生成并读取 `public/excel/index.json` 并加载其中列出的文件。

## 生产构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## 数据来源

* 2022版博士研究生学位论文社会评价期刊目录和会议名录
* 发布单位：西安交通大学研究生院
* 公告链接：https://gs.xjtu.edu.cn/info/1148/8964.htm
* 发布时间：2022-09-13

> 本工具仅提供检索功能，目录的最终解释权归西安交通大学研究生院所有。请以官方发布的最新版本为准。本项目与西安交通大学研究生院无隶属或合作关系。

## 技术栈

* [Vue 3](https://vuejs.org/) — 前端框架
* [Vite](https://vite.dev/) — 构建工具
* [SheetJS](https://sheetjs.com/) — Excel 解析

## License

[MIT](LICENSE)