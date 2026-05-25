# Prompt 02 — Railway Dockerfile + pnpm workspace lockfile 戰

- **Date**: 2026-05-24
- **Agent**: claude-opus-4-7
- **Context**: Railway deploy 一直失敗 — `ERR_PNPM_OUTDATED_LOCKFILE`。pnpm workspace 在 Docker build context 內塞錯 manifest，AI 嘗試 3 種解法都鬼打牆。
- **Outcome**: 採用 per-workspace install pattern（`cd workspace && pnpm install`），不再用 monorepo `pnpm install --filter`。後續寫進 `docs/HARNESS-PITFALLS.md` 警示。

## Conversation summary

第一次嘗試的 Dockerfile：

```dockerfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/   # ← 想說都複製，免得 lockfile 對不上
RUN pnpm install --frozen-lockfile --filter=backend
```

掛掉。錯誤訊息是 lockfile 跟 manifests 對不起來（因為 frontend 的 manifest 跟 lockfile 在 workspace level 都看得到，但 frontend node_modules 沒安裝 → pnpm 認為 lockfile drift）。

第二次嘗試（AI 自己建議）：把 frontend 改成 **stub**（只留個 `{"name":"frontend"}` 空 package.json）。

```dockerfile
RUN mkdir -p frontend && echo '{"name":"frontend"}' > frontend/package.json
```

→ `ERR_PNPM_OUTDATED_LOCKFILE` again，因為 stub 跟 lockfile 內 frontend 的真實 dependencies 對不起來。

第三次 user 一句話：

> 你先參考一下 allen-harness-test 的 docker 怎麼寫

我（agent）原本想反問「但記憶說不要 reference 別的 repo」— 這個 hardness 是用來「自己學」的 reference repo，不算 submission docs 範圍，所以去看了。發現它用的是**完全不同的 pattern**：

```dockerfile
# 不 install monorepo root，而是 cd 進 workspace 直接裝
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/
RUN corepack enable && \
    cd backend && pnpm install --frozen-lockfile
```

兩個關鍵差異：
1. **不用 `--filter`**（filter 在 Docker build context 仍會嘗試 resolve 其他 workspace 的 manifest，stub 或 missing 都炸）
2. **`cd workspace && pnpm install` 直接**（pnpm 在 workspace 目錄內偵測到自己是 workspace 一員，只裝自家 deps，不檢查其他 workspace）

實際採用後 build pass。回頭看 first principles：pnpm 設計上是 workspace-aware 的，`cd backend && pnpm install` 等價於 `pnpm install --filter=backend --workspace-root=...` 但更乾淨；不需要塞 frontend manifest 進來。

user feedback round 3 後追加把 comment 廢話砍掉（user 名言「我覺得你 comment 廢話太多」），最終版本只留**為什麼不用 alpine**（Prisma 需 glibc）+ **為什麼不裝 global prisma**（version drift）兩條。

## Lessons / takeaways

- ✅ **pnpm workspace + Docker 的 idiom 是 `cd workspace && pnpm install`**，不要傻傻整個 monorepo `pnpm install --filter`。記到 `docs/HARNESS-PITFALLS.md`。
- ❌ **AI 第一輪、第二輪都猜錯方向**：以為要塞更多 manifest 才能讓 lockfile 對齊，實際是要**少塞**並改 install 觸發點。Symptom（lockfile drift）跟 root cause（filter resolves 多 workspace）的距離意外遠。
- ✅ **user 直接指認 reference repo 比 AI 自己 explore 快 10×**：在那個迴圈如果不打斷，AI 還會繼續鬼打牆第 4、5 種錯解。
- 🔁 **Comment 篩選原則**：每 5 行 code 1 行 comment 是極限；comment 只該寫「為什麼選 X 而不選 Y」，不該寫「我們在做 X」。

## Artifacts

- Backend Dockerfile: `backend/Dockerfile`
- Frontend Dockerfile（同 pattern）: `frontend/Dockerfile`
- Harness pitfall entry: `docs/HARNESS-PITFALLS.md` §C2
- PR: [#117](https://github.com/YiHeng0221/yihengwu-jko-interview/pull/117)（後續 #118 又 trim 一輪 comment）
