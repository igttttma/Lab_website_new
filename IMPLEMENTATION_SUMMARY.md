# BlimpMate 产品页扩展说明

## 设计与交互

页面依据所提供的 MacBook Neo 归档页面，重构为长篇产品叙事。参考内容仅限于信息层级、节奏和交互方式，包括吸顶产品导航、居中首屏、Highlights 横向画廊、大标题转场、“Take a closer look” 产品查看器、滚动驱动的性能章节、圆角内容卡片、标签式内容切换、规格折叠，以及点击“+”打开详情弹窗的方式。

页面未复用 Apple 的产品图片、视频、文案或代码资产。

本次完成的主要扩展包括：

- Highlights 支持箭头、圆点、暂停/播放、触控板/拖动同步，以及当前序号显示；
- 所有缺少图片或视频的位置均使用“空白卡片 + 素材类型 + 比例 + 内容说明”，并可打开完整 production brief；
- Presentation States、Future Directions 和 Media Production Plan 的空白素材说明均支持弹窗查看；
- 3D 模型无法加载时，自动切换到论文场景图，避免留白；
- 依据论文 Table 3 渲染完整声学证据表；论文 Figure 8 保留为任务指导场景来源；
- 独立静态预览同步了主要交互，可在不运行 React 构建的情况下审阅。

## 论文数据校正

页面内容以 `/Users/suwen/Documents/blimpmate/paper/uist26-53.pdf` 为唯一事实源；网站内置 PDF 与该文件逐字节一致（SHA-256：`3ad86f9849d4f35f96a67fc3e6edff9e803b6a3a7f940dec73c7ee20eba62547`）：

- ambient background：46.0 dB(A)，平均试验最大值 48.1 dB(A)；
- routine hover：47.1 dB(A)，平均试验最大值 51.9 dB(A)；
- active vertical repositioning：50.5 dB(A)，平均试验最大值 56.1 dB(A)；
- active yaw rotation：48.3 dB(A)，平均试验最大值 54.6 dB(A)；
- active horizontal repositioning：49.7 dB(A)，平均试验最大值 56.2 dB(A)；
- hover + lightweight visuals：73 min，8.68 W；
- display-only multimedia：58 min，11.6 W；
- hover + multimedia：45 min，14.75 W；
- 任务指导对应 Figure 8，情境辅助对应 Figure 9，远程临场对应 Figure 10；
- 作者为 `Henghao Li, Shan Lin, Yang Xu, Yixiao Wei, Hongjie Li, Suwen Mei, Xindi Lyu, Xing-Dong Yang, and Yuhua Jin`，DOI 为 `10.1145/3830398.3830527`。

## 修改位置

核心文件包括：

- `src/features/blimpmate/BlimpMatePage.tsx`
- `src/features/blimpmate/BlimpExperienceSections.tsx`
- `src/features/blimpmate/BlimpTechnicalSections.tsx`
- `src/features/blimpmate/BlimpVisuals.tsx`
- `src/features/blimpmate/BlimpModel.tsx`
- `src/features/blimpmate/blimpmateData.ts`
- `src/styles/global.css`
- `public/assets/blimpmate/research/blimpmate-paper.pdf`（与指定源 PDF 字节一致）
- `blimpmate-extended-preview.html`

## 本地运行

```bash
npm install
npm run dev
```

页面路由：`/projects/blimpmate`

静态预览：

```bash
python3 -m http.server 8000
```

访问 `http://localhost:8000/blimpmate-extended-preview.html`。

## 验证状态

本次修改已完成以下检查：

- 修改后的 TS/TSX 文件通过 TypeScript 语法转译检查；
- 使用本地 React 类型桩完成隔离类型检查；
- 静态预览内联脚本通过 `node --check`；
- 桌面端和 390 px 移动端无横向溢出；
- Highlights、素材弹窗、Figure 8 图片和 3D 模型降级图均完成浏览器交互检查。

当前容器无法从配置的软件包仓库完整安装项目依赖，因此未在此环境执行 Vite production build。部署或合并后，应在目标开发机执行一次干净的 `npm install`/`npm ci`、`npm run build` 和 `npm run lint`。
