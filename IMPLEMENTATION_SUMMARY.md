# BlimpMate 产品页与 Agent Lab 交付说明

## 1. 产品页设计扩展

当前产品页以所提供的 MacBook Neo 页面归档为设计参照，吸收其产品叙事方法而不复制 Apple 的素材、字体、文案或实现代码。页面采用吸顶局部导航、超大标题、留白与渐变背景、横向卡片轨道、滚动章节、圆角证据面板、规格折叠和明确的媒体生产占位卡。

产品故事已经扩展为：研究定位、硬件与投影结构、飞控与网络架构、显示/续航/噪声证据、应用场景、Agent 数字孪生、系统状态与技术规格。论文已有图片直接进入页面；缺失的同步视频、分解动画或更高质量影像使用“空白卡片 + 比例 + 拍摄内容 + 约束说明”，不以生成素材冒充研究记录。

## 2. 论文内容映射

页面使用项目内论文图像和数据，包括硬件平台、投影显示子系统、飞控架构、网络化交互架构、显示性能、功耗与续航、声学测试，以及 Figure 8–10 的任务指导、情境辅助和移动临场场景。

主要页面证据包括：约 33 英寸可用投影对角线、平均 305.7 cd/m² 的静态屏幕亮度、悬停加轻量视觉内容 73 分钟/8.68 W、悬停加多媒体 45 分钟/14.75 W，以及测试条件下例行悬停 47.1 dB(A)。页面始终将应用场景标为 proof-of-concept，不把它们描述为已经完成端到端评估的自主系统。

## 3. Agent 数字孪生

主产品页新增 `Agent` 章节，并提供独立页面：

```text
/projects/blimpmate/agent-lab
/projects/blimpmate/agent-lab/guidance
/projects/blimpmate/agent-lab/reminder
/projects/blimpmate/agent-lab/nutrition
/projects/blimpmate/agent-lab/safety
/projects/blimpmate/agent-lab/telepresence
/projects/blimpmate/agent-lab/positioning
```

六个场景分别覆盖步骤指导、遗留物提醒、餐食反馈、安全检查、移动临场状态和用户相对定位预览。每个场景包含可编辑输入、投影界面数字孪生、后端子系统、`real / fallback / mock / manual/Wizard-of-Oz` 来源、工具轨迹、延迟、会话记录及持续可见的“物理控制关闭”边界。

## 4. 网站与 Agent 后端

浏览器默认调用同源 Node BFF：

```text
GET  /api/blimpmate-agent/snapshot
POST /api/blimpmate-agent/action
```

BFF 仅转发到 Python host-service 的公共体验接口：

```text
GET  /experience/snapshot
POST /experience/action
```

响应统一使用 `blimpmate.web-experience.v1`。公共接口不会暴露飞行器解锁、原始电机/RC 写入、手动飞行、自主导航循环、摄像头/麦克风采集或 WebRTC peer 修改。定位场景只执行请求级纯计算，不连接全局控制器或执行器；遗留物场景使用请求级临时 SQLite 数据库，不污染持久对象记忆。

## 5. 无构建审阅入口

项目包含两个可直接通过静态 HTTP 服务审阅的页面：

```text
blimpmate-extended-preview.html
blimpmate-agent-lab-preview.html
```

运行：

```bash
python -m http.server 8080
```

静态 Agent Lab 会尝试调用同源 API；后端不可用时使用明确标注的确定性本地演示，不把 fallback 伪装成真实后端状态。

## 6. 本轮验证结果

已实际完成：

- Chromium + Playwright 真实渲染桌面端 `1440 × 960` 和移动端 `390 × 844`；
- 产品页和 Agent Lab 共四个渲染目标均无页面级横向溢出；
- 四个目标均为 `0` 张破损图片、`0` 个重复 ID、`0` 条控制台错误、`0` 个请求失败；
- 自动执行 Agent Lab 场景并截取结果状态；
- Node BFF 在真实本地 HTTP 进程中完成 live-upstream smoke：`snapshot` 与 `action` 均正确转发，`physical_control: false`、`audit_recorded: false` 和 `no-store/nosniff` 响应头得到验证；
- `server/blimpmateAgent.mjs` 通过 `node --check`；
- 两个静态预览的全部内联脚本通过 `node --check`；
- `scripts/render-blimpmate-review.py` 通过 Python 编译检查；
- 后端公共体验合约测试 `7` 项全部通过；
- `experience.py`、`safety_detector.py` 和 `server.py` 通过 `py_compile`。

渲染证据位于 `review-artifacts/`：

```text
RENDER_REVIEW.md
render-audit.json
contact-sheet.png
product-*.png
agent-*.png
```

审计中的 “potential clipped elements” 是启发式候选，主要来自有意裁切的超大字标、横向轨道、数字孪生舞台和隐藏网格；页面级 `scrollWidth` 与 `clientWidth` 一致，实际检查未发现全局溢出或元素重叠阻断交互。

## 7. 环境限制

本容器无法完成一次干净的 `npm ci`，因为配置的软件包源对 `zod-validation-error-4.0.2` 返回 404。因此本轮没有声称完成 Vite production build 或 ESLint。目标开发环境需要在可访问完整 npm 公共包的网络中执行：

```bash
npm ci
npm run build
npm run lint
```
