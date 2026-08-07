# BlimpMate 产品页扩展说明

## 本次实现

页面按长篇产品叙事重新组织，并参考 MacBook Neo 产品页的节奏与交互语言，但未复制 Apple 的图片、视频、文案或代码资产。

主要新增与调整：

1. 产品优先的首屏：研究原型标识、BlimpMate 大标题、核心主张、3D 模型与双入口 CTA。
2. 吸顶产品导航：章节高亮、阅读进度、Overview / Performance / Display / Applications / System / Tech Specs 锚点。
3. Presentation States：Avatar、Notification、Media、Task、Communication 五种界面状态，可切换；暂缺素材以“空白卡片 + 类型 + 比例 + 拍摄/制作说明”呈现。
4. 论文贡献卡片：将论文的三项核心贡献转化为横向产品叙事卡片。
5. Future Directions：围绕小型化、长期供电、显示可读性、多用户/隐私/自主性扩展四张研发路线卡片；所需视觉素材均提供明确制作 brief。
6. 保留并加强原有交互：Highlights 自动轮播、六热点产品查看器、滚动驱动性能章节、应用场景切换、系统证据切换、折叠式技术规格。
7. 增加独立静态预览：`blimpmate-extended-preview.html`。该预览不依赖 React 构建即可查看页面，并包含本地 3D 模型与核心交互。

## 论文内容映射

页面采用论文中的以下内容：

- 集成飞行显示平台及其“安静、长续航、柔和物理存在”的设计定位；
- 33 英寸级投影显示、323.7 g 总质量、360.0 g 估算浮力、36.3 g 余量；
- 显示亮度、视角、空间清晰度、功耗、续航、飞控和声学评估；
- 烹饪/装配/实验室指导、情境提醒、营养反馈、安全提醒、移动远程临场；
- 论文明确提出的小型化、能量、显示质量、多人交互、隐私和自主性研究方向。

## 空白素材卡片规范

缺少专用图片或视频时，不使用虚构素材。卡片至少包含：

- 素材类型；
- 目标画幅；
- 要展示的内容或镜头流程；
- 拍摄、UI、测量或安全约束；
- 该素材在产品叙事中的用途。

## 查看静态预览

直接打开 `blimpmate-extended-preview.html` 可以查看大部分页面。为保证 3D 模型模块正常加载，建议在项目目录运行：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000/blimpmate-extended-preview.html
```

## 开发与构建

```bash
npm install
npm run dev
npm run build
```

页面路由：`/projects/blimpmate`

## 验证状态

已通过：

```bash
./node_modules/.bin/tsc -b
./node_modules/.bin/eslint src/features/blimpmate src/app src/components
node --check <静态预览内联脚本>
```

提供的更新 ZIP 不包含 `node_modules`。原始说明来自 Linux 环境，当时缺少 Linux 版可选 Rolldown 原生绑定，因此未完成 Vite production build；当前 macOS 项目整合后已重新执行并通过 `npm run build`。部署机器仍需执行一次干净的 `npm install` 或 `npm ci`。

## 当前工程整合验收

更新已整合到 `/Users/suwen/Documents/blimpmate/Lab_website_new`，并通过：

```bash
npm run build
npm run lint
git diff --check
```

浏览器验收覆盖五种 Presentation States、三项论文贡献、四项 Future Directions、局部导航章节高亮与阅读进度、Highlights 暂停/恢复、产品热点、应用场景、系统视图和滚动驱动模型旋转。桌面端与 390 px 移动端无横向溢出、无断图；3D 模型实例均进入 ready 状态。静态预览的字体路径已统一为 `public/assets/fonts/...`，可按文档中的 Python HTTP server 方式查看。

Vite 仍会提示单一 JS bundle 超过 500 kB，这是非阻断性的优化建议。
