# BlimpMate 产品页与 Agent Lab 实现说明

## 1. 页面扩展范围

当前 BlimpMate 页面保留了基于所提供 MacBook Neo 页面归档形成的长篇产品叙事：吸顶产品导航、居中首屏、Highlights 横向浏览、大标题章节转场、产品/系统查看器、滚动驱动的性能叙事、圆角证据卡片、标签切换、规格折叠，以及通过“+”打开素材说明的交互。

本轮重点是在现有产品页中加入 `Agent` 章节，并新增可独立访问的网页版数字孪生体验。实现没有复制 Apple 的产品图片、视频、字体、文案或页面代码，仅参考信息层级、节奏和交互方式。

## 2. 论文内容映射

页面继续使用项目中已有的论文图片和测量数据，包括硬件平台、投影显示、飞控架构、网络化交互架构、显示性能、续航、声学数据，以及 Figure 8–10 的应用场景。

Agent Lab 将论文中的交互方向拆分为六个可体验场景：

1. `guidance`：步骤式、免手持的任务指导；
2. `reminder`：重要物品遗留提醒；
3. `nutrition`：餐食图像或示例输入的轻量营养反馈；
4. `safety`：实验室/工作区安全提示；
5. `telepresence`：来电、接通、结束等移动临场状态；
6. `positioning`：依据方位、距离和俯仰角计算用户相对位置的数字孪生设定值。

其中定位卡片是对论文网络化交互与用户相对运动方向的工程化演示，不应被描述为论文已评估的自主导航结果。论文场景整体保持“proof-of-concept”表述，不宣称已完成端到端自治评估。

## 3. Agent Lab 页面与交互

新增路由：

```text
/projects/blimpmate/agent-lab
/projects/blimpmate/agent-lab/guidance
/projects/blimpmate/agent-lab/reminder
/projects/blimpmate/agent-lab/nutrition
/projects/blimpmate/agent-lab/safety
/projects/blimpmate/agent-lab/telepresence
/projects/blimpmate/agent-lab/positioning
```

每个场景包含：

- 可编辑输入控件；
- BlimpMate 投影界面的数字孪生；
- 后端子系统与 `real / fallback / mock / manual/Wizard-of-Oz` 来源说明；
- 运行延迟、工具调用和会话事件记录；
- 论文图片与 Figure 5 架构映射；
- 始终可见的物理控制边界；
- 缺失同步视频时的“空白卡片 + 拍摄说明”。

## 4. 网站到 Agent 后端的连接

浏览器默认访问同源 Node BFF：

```text
GET  /api/blimpmate-agent/snapshot
POST /api/blimpmate-agent/action
```

Node BFF 再访问 Python host-service：

```text
GET  /experience/snapshot
POST /experience/action
```

BFF 具备有限超时、8.5 MB 默认 JSON 请求上限、`no-store` 响应头、对象结构校验和稳定错误响应。后端不可用或返回 5xx 时，页面使用明确标记的确定性演示；上游 4xx 校验错误不会被伪装成成功演示。

## 5. 安全与隐私边界

公共体验只允许读取脱敏状态、执行感知/规则/展示逻辑，以及计算未连接执行器的定位设定值。它不提供：

- 飞行器解锁或上锁；
- 电机、原始 RC 或手动飞行指令；
- 自主导航运行循环；
- 浏览器侧开启审计记录的能力。

后端对用户身份、WebRTC peer ID、原始飞控字段、自由文本控制原因、详细遥测/审计记录进行脱敏。物品提醒数据库和定位 PID 状态按请求隔离。上传图像默认限制为 6 MB，完整 JSON 请求默认限制为 8.5 MB。

## 6. 主要修改文件

```text
.env.example
README.md
AGENT_LAB_IMPLEMENTATION.md
BLIMPMATE_PAGE_NOTES.md
IMPLEMENTATION_SUMMARY.md
PATCH_MANIFEST.txt
PATCH_README.md
blimpmate-agent-lab-preview.html
blimpmate-extended-preview.html
server/api.mjs
server/blimpmateAgent.mjs
server/config.mjs
src/app/PublicSite.tsx
src/features/blimpmate/BlimpMatePage.tsx
src/features/blimpmate/agent/*
src/styles/global.css
```

Python 后端补丁位于单独的 backend patch 中，避免将两个仓库混在一起覆盖。

## 7. 验证结果

已完成：

- Node BFF 语法检查；
- BFF 离线 fallback、真实上游 mock、请求体校验、请求大小限制、上游 4xx 透传与安全响应头 smoke test；
- TS/TSX 语法检查和基于本地类型桩的隔离语义检查；
- CSS 解析、HTML 解析和静态预览内联脚本 `node --check`；
- 桌面端与 390 px 移动端无横向溢出检查；
- 两个静态预览及其论文/品牌/模型资源的文件存在与本地 HTTP 200 检查；
- Python host-service 全部测试：`57 passed, 3 skipped`（跳过项需要真实 Flask，而当前最小环境仅有测试桩）；
- Python 新增 web-experience 合约测试：`19 passed, 2 skipped`。

直接 Chromium URL 导航被容器策略拦截，因此视觉检查使用内存加载页面；静态资源另行通过本地 HTTP 验证。完整 Vite build 与 ESLint 未在此容器完成，因为配置的软件包源在安装 `zod-validation-error-4.0.2` 时返回 404。目标开发机仍需执行：

```bash
npm install
npm run build
npm run lint
```
