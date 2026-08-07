# BlimpMate 产品页与 Agent Lab 网站补丁

将网站补丁内文件按原有相对路径覆盖到 `Lab_website_new` 项目。整合包中的 `backend-patch/` 另行覆盖到 `/Users/suwen/Documents/blimpmate/BlimpMate_agent`。补丁只包含本轮新增或修改的源码、说明和静态预览；不会覆盖项目现有的论文图片、3D 模型和品牌资源，也不包含字体、Apple 页面归档、`node_modules` 或构建产物。

## 运行网站

```bash
cp .env.example .env
npm install
npm run dev
```

主要页面：

```text
/projects/blimpmate
/projects/blimpmate/agent-lab/reminder
```

其余 Agent Lab 子页面见 `AGENT_LAB_IMPLEMENTATION.md`。

## 连接 Python Agent 后端

在网站 `.env` 中配置：

```text
BLIMPMATE_AGENT_URL=http://127.0.0.1:5050
BLIMPMATE_AGENT_TIMEOUT_MS=3500
BLIMPMATE_AGENT_MAX_REQUEST_BYTES=8500000
BLIMPMATE_AGENT_DEMO_FALLBACK=true
```

先在 `/Users/suwen/Documents/blimpmate/BlimpMate_agent/host-service` 启动 Python host-service（本机 `run.sh` 默认使用 `5050`），再启动网站。浏览器默认只访问同源 Node BFF，不直接暴露飞控接口。

## 无构建静态审阅

从原项目根目录运行：

```bash
python3 -m http.server 8000
```

打开：

```text
http://localhost:8000/blimpmate-extended-preview.html
http://localhost:8000/blimpmate-agent-lab-preview.html
```

静态预览依赖原项目已有的 `public/assets/`。Agent Lab 静态页会先尝试同源 API；API 不可用时显示明确标记的本地演示状态。

## 合并后检查

```bash
npm run build
npm run lint
```

本容器未完成完整 Vite/ESLint 检查，原因是配置的软件包源在依赖安装阶段返回 404；其他语法、类型、BFF smoke、静态资源和响应式检查结果见 `IMPLEMENTATION_SUMMARY.md`。
