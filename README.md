# 企业AI数字工厂

基于 Next.js 15、TypeScript、Tailwind CSS、DeepSeek API 和 Turso 的企业AI诊断与商业转化系统。

## 正式业务流程

1. 客户完成六步企业问卷并提交。
2. 问卷数据仅保存为待确认请求，**不调用 AI**，客户立即进入微信顾问确认等待页。
3. 等待页展示微信二维码、诊断编号和自动跳转说明，每 5 秒轮询状态。
4. 管理员登录 `/admin`，在”诊断请求队列”中查看待确认项并点击确认。
5. 确认后服务端调用 DeepSeek 生成完整报告，写入 `reports` 表，状态变为已解锁。
6. 客户等待页检测到解锁状态后自动跳转 `/result`，查看完整报告并生成 PDF。

## 本地运行

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev -- -p 3010
```

访问：

- 首页：http://localhost:3010
- 诊断：http://localhost:3010/diagnosis
- 等待确认：http://localhost:3010/diagnosis-status
- 结果：http://localhost:3010/result
- 后台：http://localhost:3010/admin
- 健康检查：http://localhost:3010/api/health

## 必需环境变量

```env
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
DATABASE_MODE=
ADMIN_PASSWORD=
JWT_SECRET=
```

`JWT_SECRET` 至少使用32位随机字符。生产环境不能依赖本地 `data.db`，因为云服务文件系统不适合作为正式业务数据库。

本地网络无法连接 Turso 时，可在 `.env.local` 增加：

```env
DATABASE_MODE=local
```

Render / Vercel 生产环境不要配置 `DATABASE_MODE=local`。

## 上线前验证

```powershell
npm run typecheck
npm run build
```

## GitHub + Render 部署

本项目包含 API Routes、Middleware、后台登录和服务端数据库访问。部署到 Render 时请选择 Web Service，不要选择 Static Site。

Render 推荐配置：

```bash
Build Command: npm ci && npm run build
Start Command: npm run render-start
```

也可以使用项目根目录的 `render.yaml` 作为 Render Blueprint。

详细步骤见：

- `docs/deploy-render.md`

## Vercel 部署

1. 将项目推送到 GitHub。
2. 在 Turso 创建数据库并获取 URL、Token。
3. 在 Vercel 导入仓库。
4. 配置全部必需环境变量。
5. 首次生成报告时系统会自动创建和升级数据库表。
6. 使用真实域名测试诊断、后台登录、确认收款、客户解锁和PDF打印。

## 线上故障排查

部署完成后先访问：

```text
https://你的域名/api/health
```

如果 `ok` 为 `false`，优先检查 Render 的环境变量：

- `DEEPSEEK_API_KEY`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

生产环境不要设置 `DATABASE_MODE=local`。

## 安全说明

- 用户提交问卷时仅保存待确认请求，不调用 AI，避免资源浪费和滥用。
- 访问令牌仅保存 SHA-256 哈希，原始令牌绝不落库。
- AI 生成仅在管理员确认后触发，失败保留问卷并允许后台重试。
- 完整报告不会在管理员确认前返回浏览器。
- 客户报告接口需要随机访问凭证，并且只有管理员确认后才返回完整内容。
- 管理后台使用 HttpOnly、SameSite Cookie。
- 诊断、线索提交和后台登录均有限流。
- DeepSeek API Key、数据库 Token 和管理密码仅存放在服务端环境变量中。
