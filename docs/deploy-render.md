# GitHub + Render 部署指南

本项目是 Next.js 动态应用，包含 API Routes、Middleware、后台登录和服务端数据库访问。部署到 Render 时必须选择 **Web Service**，不要选择 Static Site。

## 1. 本地上线前检查

在项目目录执行：

```powershell
npm run lint
npm run typecheck
npm run build
```

全部通过后再推送到 GitHub。

## 2. 修复或初始化 Git 仓库

当前项目目录里的 `.git` 不完整，缺少 `HEAD` 和 `config`。如果 `git status` 提示 `not a git repository`，执行：

```powershell
git init
git add .
git commit -m "Prepare Render deployment"
```

然后在 GitHub 创建一个空仓库，把下面命令中的地址替换成你的仓库地址：

```powershell
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

如果 `remote origin already exists`，改用：

```powershell
git remote set-url origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

## 3. Render 创建服务

1. 打开 Render。
2. New → Web Service。
3. 连接 GitHub 仓库。
4. Root Directory 留空。
5. Runtime 选择 Node。
6. Build Command：

```bash
npm ci && npm run build
```

7. Start Command：

```bash
npm run render-start
```

项目已提供 `render.yaml`，如果用 Blueprint 方式导入，也会自动读取这些配置。

## 4. Render 环境变量

生产环境必须配置：

```env
DEEPSEEK_API_KEY=你的真实DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
TURSO_DATABASE_URL=你的Turso数据库地址
TURSO_AUTH_TOKEN=你的Turso数据库Token
ADMIN_PASSWORD=你的后台强密码
JWT_SECRET=至少32位随机字符串
```

可选：

```env
WECHAT_WORK_WEBHOOK_URL=企业微信群机器人Webhook
```

不要在 Render 配置：

```env
DATABASE_MODE=local
```

`DATABASE_MODE=local` 只适合本地开发。生产环境必须使用 Turso，否则数据不可靠。

## 5. 上线后验收流程

部署完成后，用 Render 线上域名测试：

1. 打开 `/api/health`，确认 `ok: true`。
2. 打开首页 `/`。
3. 打开 `/diagnosis`，完整填写问卷并提交。
4. 确认提交后立即跳转至 `/diagnosis-status` 微信顾问确认等待页（不调用 AI）。
5. 打开 `/admin`，使用后台密码登录。
6. 在”诊断请求队列”中找到刚提交的待确认请求（状态：待确认）。
7. 点击确认，服务端调用 DeepSeek 生成完整报告。
8. 回到客户等待页，确认自动跳转至 `/result` 并展示完整报告。
9. 测试 PDF 打印/保存。
10. 测试失败重试：如果 AI 生成失败，请求状态变为”失败”，管理员可在后台重试。

## 6. 常见错误

### 生成报告失败

优先检查：

- `DEEPSEEK_API_KEY` 是否配置到 Render。
- Render 服务是否能访问 DeepSeek API。
- `DEEPSEEK_MODEL` 是否填写为当前可用模型（如 `deepseek-v4-flash`）。

### 后台没有请求或报告

优先检查：

- Render 是否配置了 `TURSO_DATABASE_URL`。
- Render 是否配置了 `TURSO_AUTH_TOKEN`。
- 是否误配置了 `DATABASE_MODE=local`。
- 确认诊断请求状态是否为"待确认"（pending_contact），管理员需点击确认才触发 AI 生成。

### 页面能打开，但 API 报错

进入 Render Logs，查看 `/api/diagnose`、`/api/reports` 或 `/api/admin/reports` 的服务端错误日志。
