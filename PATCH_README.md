# BlimpMate 产品页与 Agent Lab 交付包

本目录是完整的网站项目，不再依赖旧版的 `backend-patch/` 覆盖流程。Agent 后端作为单独的完整仓库压缩包交付。

## 运行网站

```bash
cp .env.example .env
npm ci
npm run dev
```

主要页面：

```text
/projects/blimpmate
/projects/blimpmate/agent-lab
/projects/blimpmate/agent-lab/reminder
```

## 连接 Python Agent 后端

将两个项目目录放在同一父目录后运行：

```bash
cd ../BlimpMate_agent-main/host-service
./run.sh

cd ../../Lab_website_new-main
npm run dev
```

网站 `.env` 默认使用：

```text
BLIMPMATE_AGENT_URL=http://127.0.0.1:5050
BLIMPMATE_AGENT_TIMEOUT_MS=30000
BLIMPMATE_AGENT_MAX_REQUEST_BYTES=8500000
BLIMPMATE_AGENT_DEMO_FALLBACK=true
```

浏览器仅访问同源 Node BFF；完整 host-service 的可信接口不应直接暴露给公网。

## 无构建静态审阅

```bash
python -m http.server 8080
```

打开：

```text
http://127.0.0.1:8080/blimpmate-extended-preview.html
http://127.0.0.1:8080/blimpmate-agent-lab-preview.html
```

## 重跑真实渲染检查

```bash
python scripts/render-blimpmate-review.py --quick
```

结果写入 `review-artifacts/`。当前交付的实际检查结果和 npm 安装限制见 `IMPLEMENTATION_SUMMARY.md`。
