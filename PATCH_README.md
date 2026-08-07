# BlimpMate Apple-style product-page patch

将补丁目录中的文件按原有相对路径覆盖到 `Lab_website_new-main` 即可。补丁仅包含本次修改的源码、静态预览、说明文件和新增论文图片，不包含 `node_modules`、Apple 归档素材或字体文件。

运行：

```bash
npm install
npm run dev
```

访问：

```text
/projects/blimpmate
```

无需构建的审阅方式：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000/blimpmate-extended-preview.html
```

合并后建议执行：

```bash
npm run build
npm run lint
```
