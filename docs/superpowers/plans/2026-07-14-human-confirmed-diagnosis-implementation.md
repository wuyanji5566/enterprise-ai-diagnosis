# 人工确认式企业 AI 诊断流程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户提交问卷后立即进入微信顾问确认页，管理员确认后生成完整报告，用户无需刷新即可自动跳转结果页。

**Architecture:** 独立的 `diagnosis_requests` 表保存未调用 AI 的问卷、访问令牌哈希和状态。用户提交仅创建请求；管理员确认时通过抽取出的生成服务调用 DeepSeek、创建现有 `reports` 记录并解锁；等待页轮询请求状态。

**Tech Stack:** Next.js App Router、TypeScript、Tailwind CSS、@libsql/client、Vitest、DeepSeek。

## Global Constraints

- 不删除既有 `reports`、账户、后台登录或已解锁报告的读取方式。
- 用户提交接口不得调用 AI，AI 只能在管理员确认接口中调用。
- 访问令牌只保存 SHA-256 哈希。
- AI 失败必须保留问卷且允许后台重试。
- 报告必须包含经营结论、四链路、机会矩阵、TOP3、ROI、7/30/90 路线、风险与下一步建议。

---

### Task 1: 添加测试工具与诊断请求状态类型

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `types/diagnosis-request.ts`
- Test: `tests/diagnosis-request-storage.test.ts`

- [x] **Step 1: 写失败测试**

```ts
import { describe, expect, it } from "vitest";
import { isTerminalDiagnosisRequestStatus } from "@/types/diagnosis-request";

describe("diagnosis request status", () => {
  it("marks only unlocked and failed requests as terminal", () => {
    expect(isTerminalDiagnosisRequestStatus("pending_contact")).toBe(false);
    expect(isTerminalDiagnosisRequestStatus("generating")).toBe(false);
    expect(isTerminalDiagnosisRequestStatus("unlocked")).toBe(true);
    expect(isTerminalDiagnosisRequestStatus("failed")).toBe(true);
  });
});
```

- [x] **Step 2: 确认测试失败**

Run: `npm run test -- tests/diagnosis-request-storage.test.ts`

Expected: FAIL，模块尚不存在。

- [x] **Step 3: 最小实现**

```ts
export type DiagnosisRequestStatus = "pending_contact" | "generating" | "unlocked" | "failed";

export function isTerminalDiagnosisRequestStatus(status: DiagnosisRequestStatus) {
  return status === "unlocked" || status === "failed";
}
```

在 `package.json` 添加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [x] **Step 4: 确认测试通过并提交**

Run: `npm run test -- tests/diagnosis-request-storage.test.ts`

Expected: PASS，1 test passed。

```powershell
git add package.json package-lock.json vitest.config.ts tests/setup.ts types/diagnosis-request.ts tests/diagnosis-request-storage.test.ts
git commit -m "test: add diagnosis request status coverage"
```

### Task 2: 安全保存待确认请求

**Files:**
- Create: `lib/diagnosis-request-storage.ts`
- Test: `tests/diagnosis-request-storage.test.ts`

**Produces:** `createDiagnosisRequest(questionnaire, userId?)`、`readDiagnosisRequestForCustomer(id, token)`、`listDiagnosisRequestsForAdmin()`、`markDiagnosisRequestGenerating(id)`、`markDiagnosisRequestFailed(id, message)`、`markDiagnosisRequestUnlocked(id, reportId, reportAccessToken)`。

- [x] **Step 1: 写失败测试**

```ts
it("does not expose a request when its access token is wrong", async () => {
  const created = await createDiagnosisRequest(sampleQuestionnaire);
  expect(await readDiagnosisRequestForCustomer(created.requestId, "wrong-token")).toBeNull();
  expect((await readDiagnosisRequestForCustomer(created.requestId, created.accessToken))?.status)
    .toBe("pending_contact");
});
```

- [x] **Step 2: 确认测试失败**

Run: `npm run test -- tests/diagnosis-request-storage.test.ts`

Expected: FAIL，存储函数尚不存在。

- [ ] **Step 3: 实现请求表和令牌校验**

```sql
CREATE TABLE IF NOT EXISTS diagnosis_requests (
  id TEXT PRIMARY KEY, questionnaire_json TEXT NOT NULL, company_name TEXT NOT NULL,
  access_token_hash TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending_contact',
  failure_message TEXT DEFAULT NULL, report_id TEXT DEFAULT NULL,
  report_access_token TEXT DEFAULT NULL, user_id TEXT DEFAULT NULL,
  created_at TEXT NOT NULL, confirmed_at TEXT DEFAULT NULL, completed_at TEXT DEFAULT NULL
)
```

使用 `randomBytes(32).toString("base64url")` 创建访问令牌，使用 `createHash("sha256")` 存储和比较令牌哈希；原始令牌绝不落库。

- [x] **Step 4: 确认测试通过并提交**

Run: `npm run test -- tests/diagnosis-request-storage.test.ts`

Expected: PASS，错误令牌无法读取，正确令牌只得到公开状态。

```powershell
git add lib/diagnosis-request-storage.ts tests/diagnosis-request-storage.test.ts
git commit -m "feat: store pending diagnosis requests securely"
```

### Task 3: 分离 AI 生成并实现请求接口

**Files:**
- Create: `lib/diagnosis-generator.ts`
- Modify: `app/api/diagnose/route.ts`
- Create: `app/api/diagnosis-requests/route.ts`
- Create: `app/api/diagnosis-requests/[id]/route.ts`
- Create: `app/api/admin/diagnosis-requests/route.ts`
- Create: `app/api/admin/diagnosis-requests/[id]/confirm/route.ts`
- Test: `tests/diagnosis-request-routes.test.ts`

**Produces:** 用户 `POST /api/diagnosis-requests` 返回 201 `{ requestId, accessToken, status: "pending_contact" }`；后台确认接口把状态改为 `generating`，调用 `generateLockedReport`，成功后写入 `unlocked`。

- [ ] **Step 1: 写失败测试，锁定“不在用户请求中调用 AI”**

```ts
it("creates a pending request without calling the AI generator", async () => {
  const generator = vi.fn();
  const response = await createDiagnosisRequestRoute(sampleQuestionnaire, { generator });
  expect(response.status).toBe(201);
  expect(generator).not.toHaveBeenCalled();
});
```

- [x] **Step 2: 确认测试失败**

Run: `npm run test -- tests/diagnosis-request-routes.test.ts`

Expected: FAIL，提交路由尚不存在。

- [x] **Step 3: 最小实现**

用户接口实现：

```ts
const parsed = questionnaireSchema.safeParse(await request.json());
if (!parsed.success) return validationError(parsed.error);
const created = await createDiagnosisRequest(parsed.data, userSession?.userId);
return NextResponse.json({ ...created, status: "pending_contact" }, { status: 201 });
```

管理员确认必须先标记 `generating`，再调用 `generateLockedReport`；成功时调用 `markDiagnosisRequestUnlocked`，失败时调用 `markDiagnosisRequestFailed`。既有 `/api/diagnose` 只复用创建请求逻辑，不再同步生成完整报告。

- [x] **Step 4: 确认测试通过并提交**

Run: `npm run test -- tests/diagnosis-request-routes.test.ts`

Expected: PASS，用户提交不调用生成器；管理员确认后状态可读取。

```powershell
git add lib/diagnosis-generator.ts app/api/diagnose/route.ts app/api/diagnosis-requests app/api/admin/diagnosis-requests tests/diagnosis-request-routes.test.ts
git commit -m "feat: generate reports after admin confirmation"
```

### Task 4: 微信确认等待页与自动跳转

**Files:**
- Modify: `components/DiagnosisForm.tsx`
- Create: `app/diagnosis-status/page.tsx`
- Create: `components/DiagnosisStatusPanel.tsx`
- Test: `tests/diagnosis-status-panel.test.tsx`

**Produces:** `DiagnosisStatusPanel({ requestId, accessToken })` 每 5 秒读取状态；在 `unlocked` 时使用 `router.replace("/result?id=...&token=...")`。

- [x] **Step 1: 写失败测试**

```tsx
it("redirects to the result when the request becomes unlocked", async () => {
  server.use(statusResponse({ status: "unlocked", reportId: "r1", reportAccessToken: "token" }));
  render(<DiagnosisStatusPanel requestId="q1" accessToken="access" />);
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/result?id=r1&token=token"));
});
```

- [x] **Step 2: 确认测试失败**

Run: `npm run test -- tests/diagnosis-status-panel.test.tsx`

Expected: FAIL，等待组件尚不存在。

- [x] **Step 3: 最小实现**

提交成功后：

```ts
router.push(`/diagnosis-status?id=${encodeURIComponent(data.requestId)}&token=${encodeURIComponent(data.accessToken)}`);
```

等待页包含：诊断已提交、微信二维码、诊断编号和复制按钮、三步时间线、当前状态、自动跳转说明。网络错误不删除令牌，保留“可稍后打开此链接继续查看”的提示。

- [x] **Step 4: 确认测试通过并提交**

Run: `npm run test -- tests/diagnosis-status-panel.test.tsx`

Expected: PASS，解锁状态会自动跳转。

```powershell
git add components/DiagnosisForm.tsx app/diagnosis-status/page.tsx components/DiagnosisStatusPanel.tsx tests/diagnosis-status-panel.test.tsx
git commit -m "feat: add WeChat confirmation and auto redirect"
```

### Task 5: 后台确认体验和企业主报告价值升级

**Files:**
- Modify: `components/ReportUnlockPanel.tsx`
- Modify: `components/ResultReport.tsx`
- Modify: `lib/ai-prompt.ts`
- Modify: `lib/diagnosis-schema.ts`
- Modify: `types/diagnosis.ts`
- Test: `tests/report-value-contract.test.ts`

- [x] **Step 1: 写失败测试**

```ts
it("requires executive summary, project acceptance metrics and ROI assumptions", () => {
  expect(diagnosisJsonSchema.required).toContain("executiveSummary");
  expect(diagnosisJsonSchema.properties.topProjects.items.required).toContain("acceptanceMetrics");
  expect(diagnosisJsonSchema.properties.roiAnalysis.required).toContain("assumptions");
});
```

- [x] **Step 2: 确认测试失败**

Run: `npm run test -- tests/report-value-contract.test.ts`

Expected: FAIL，新的决策报告字段尚未被 schema 强制。

- [ ] **Step 3: 实现报告合同和 UI**

报告页面按以下顺序展示：

```text
经营者摘要 → 最优先项目 → 预计价值及假设 → TOP3 项目 → 四链路诊断 → ROI → 7/30/90 天路线 → 风险与暂不建议 → 下一步沟通清单
```

每个项目都显示业务问题、样品验证、周期、预算、负责人、验收指标和风险；后台按 `pending_contact`、`generating`、`failed`、`unlocked` 展示队列，只有待确认或失败项允许确认/重试。

- [x] **Step 4: 确认测试通过并提交**

Run: `npm run test -- tests/report-value-contract.test.ts`

Expected: PASS，核心老板决策字段为必填。

```powershell
git add components/ReportUnlockPanel.tsx components/ResultReport.tsx lib/ai-prompt.ts lib/diagnosis-schema.ts types/diagnosis.ts tests/report-value-contract.test.ts
git commit -m "feat: upgrade report value and admin confirmation UI"
```

### Task 6: 完整验证、部署与运维说明

**Files:**
- Modify: `README.md`
- Modify: `docs/deploy-render.md`

- [ ] **Step 1: 写部署操作说明**

说明用户提交、后台确认、失败重试和自动跳转；保留 `DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`ADMIN_PASSWORD`、`JWT_SECRET` 环境变量说明。

- [ ] **Step 2: 运行完整验证**

Run: `npm run test && npm run lint && npm run typecheck && npm run build`

Expected: 所有命令 exit code 0。

- [ ] **Step 3: 本地与线上验收并提交推送**

Run:

```powershell
npm run dev
git add README.md docs/deploy-render.md
git commit -m "docs: document human-confirmed diagnosis flow"
git push origin main
Invoke-WebRequest -Uri 'https://enterprise-ai-diagnosis.onrender.com/api/health' -UseBasicParsing
```

Expected: 提交后 3 秒内进入确认页；后台确认后用户自动跳转；健康接口返回 `"ok":true`。
