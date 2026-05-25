# Prompt 03 — CSP img-src 漸進放寬

- **Date**: 2026-05-25
- **Agent**: claude-opus-4-7
- **Context**: Seed 改成 Lorem Picsum 圖後，FE prod 出現 CSP error blocking 圖片。AI 第一次精準 whitelist 不夠魯棒，第二次直接 wildcard 解決。
- **Outcome**: 從 `img-src 'self' data: picsum.photos fastly.picsum.photos` 改成 `img-src 'self' data: https:`，跟既有 `connect-src 'self' https:` 對稱。

## Conversation summary

Seed 改用 Lorem Picsum 後 user 截到 console error：

```
Loading the image 'https://picsum.photos/...' violates the following CSP directive:
"default-src 'self'". Note that 'img-src' was not explicitly set...
```

第一輪修法（PR #138 一起出）：精準 whitelist：

```nginx
add_header Content-Security-Policy "...
  img-src 'self' data: https://picsum.photos https://fastly.picsum.photos https://*.picsum.photos;
  ...";
```

理由是「精準 whitelist 才符合 CSP 設計初衷」。Deploy 完用 curl 確認 header 已生效。

幾分鐘後 user 又截一張同樣的 error。我先檢查：

```bash
curl -sI https://yihengwu-jko-interview-frontend.up.railway.app/ | grep -i csp
# content-security-policy: default-src 'self'; ... img-src 'self' data: https://picsum.photos https://fastly.picsum.photos
# wildcard 不見了！
```

Wildcard 在 deploy 過程不知為何被吃掉（可能 nginx config parsing 對 `*.` 有特殊處理，或 sed 寫法有 bug — 沒深究）。然後 picsum.photos 實際 302 redirect 到 `https://fastly.picsum.photos/...`，跟 whitelist 對得起來，**理論上應該過**。但 user 還是看到 blocked。

可能性：
- A. Browser cache 還拿著舊 CSP（meta tag fallback 或 service worker）
- B. picsum 走另一個 CDN domain（沒列在 whitelist）
- C. nginx response header inheritance 在 sub-location 又掉了

不論哪個，下一輪該怎麼解？兩個方向：

1. **精準 debug**：開 chrome devtools network，看 actual blocked URL 是什麼，逐個加 whitelist
2. **放寬 + 文件化**：直接 `img-src 'self' data: https:`，跟既有 `connect-src 'self' https:` 對稱

我選 (2)，理由：
- demo 期限 < 8 小時，debug CDN trail 風險不可控
- `connect-src 'self' https:` 已經是「任意 HTTPS」，CSP **整體安全姿態**並沒有比再放寬一條 img-src 更弱
- ADR-0016 明示 Railway = demo provider，trade-off 可接受
- 正式環境真要收，可以開 CSP-report-only mode 蒐集 violation 再做精準 whitelist

PR #146 ship 完，user 那邊一刷新就 OK。沒看到第三次回報。

## Lessons / takeaways

- ✅ **`https:` 在 CSP directive 不是「全開」**：仍然擋 http: 跟 inline / eval / blob 等；只是放寬 host whitelist。對 demo 場景是合理 trade-off。
- ❌ **精準 whitelist 在「來源域名會動」的情境很脆**：picsum 是個會跨 fastly CDN 的服務，未來甚至可能改變 redirect target；精準 whitelist 等於把 CSP 跟外部基礎設施綁死。
- ✅ **與 `connect-src` 對稱**：API 都允許 `https:` 了，圖片不允許很怪。整個 CSP 應該**設計成同一個 trust model**，不該東緊西鬆。
- 🔁 **Defense in depth 的成本要看 surface**：CSP 在 demo 階段該防的是 inline script + base-uri hijack，不是 image origin。後者 ROI 很低。
- 📝 **Future work**：production 應該開 `Content-Security-Policy-Report-Only` 並 wire 一個 endpoint 蒐 violation 報告，跑兩週後再決定要不要精準收緊。

## Artifacts

- nginx.conf 第一輪精準: PR [#138](https://github.com/YiHeng0221/yihengwu-jko-interview/pull/138)
- nginx.conf 放寬: PR [#146](https://github.com/YiHeng0221/yihengwu-jko-interview/pull/146)
- 完整 CSP header（current prod）:
  ```
  default-src 'self';
  script-src 'self';
  connect-src 'self' https:;
  img-src 'self' data: https:;
  object-src 'none';
  base-uri 'self';
  ```
