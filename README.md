# 企业AI数字工厂

基于 Next.js 15、TypeScript、Tailwind CSS、OpenAI Responses API 和 Turso 的企业AI诊断与商业转化系统。

## 正式业务流程

1. 客户完成六步企业问卷。
2. `/api/diagnose` 调用 OpenAI 生成结构化报告。
3. 完整报告只保存到服务端数据库，浏览器仅收到评分预览、报告编号和随机访问凭证。
4. 客户添加微信并发送报告编号，支付99元。
5. 管理员登录 `/admin`，在“报告收款与解锁”中确认收款。
6. 客户在 `/result` 刷新状态，查看完整报告并生成PDF。

## 本地运行

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev -- -p 3010
```

访问：

- 首页：http://localhost:3010
- 诊断：http://localhost:3010/diagnosis
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

- 完整报告不会在付款前返回浏览器。
- 客户报告接口需要随机访问凭证，并且只有管理员确认后才返回完整内容。
- 管理后台使用 HttpOnly、SameSite Cookie。
- 诊断、线索提交和后台登录均有限流。
- OpenAI API Key、数据库 Token 和管理密码仅存放在服务端环境变量中。
