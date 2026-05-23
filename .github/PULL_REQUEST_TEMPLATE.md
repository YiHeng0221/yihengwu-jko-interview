<!-- 標題請用 Conventional Commits: <type>(<scope>): <subject> -->

<details>
<summary>Pull Request Instructions</summary>

1. **Pull Request Changes**：描述本 PR 新增或異動的程式碼（必填，繁體中文）
2. **Breaking Changes**：若異動影響 interface（如 component props、API contract、wire shape）請列出，沒有則整段刪除
3. **Deprecated**：已棄用、能移除的請移除，還不能移除請加 `@deprecated` jsdoc，沒有則整段刪除
4. **Checklist**：local 必須自行測試過（self-check log 必貼），其他項目視情況勾選
5. **To-do**：規格還沒確認或要另外處理的事項，最好附 issue 連結或負責人，沒有則整段刪除
6. **AC traceability**：必須對應到 issue 的 Given/When/Then AC，勾選此 PR 真的有交付的條目
7. **票號**：footer `Refs Issue#<NN>` 必填；branch 命名走 `feature/epic-<NN>-<lane>-issue-<NN>`

</details>

## Pull Request Changes

<!-- 1-3 段話，描述「做了什麼」、「為什麼這樣做」、「影響範圍」。繁體中文。 -->

## AC traceability

<!-- 對應 issue AC，本 PR 真的有交付的勾起來。-->

- [ ] AC-XXX — …
- [ ] AC-XXX — …

## Checklist

- [ ] **我已 local 測試過（必填）**
- [ ] **Self-check log 已附（必填）**
- [ ] 對應的 unit / integration / e2e 測試已新增或更新
- [ ] axe-core a11y 檢查通過（若異動到 UI）
- [ ] 不違反 AGENTS.md Hard Rule #16（無 `as` / `any` / `unknown`，除 `catch (error)` 單行例外）

## Self-check log

```
✅ lint
✅ typecheck
✅ test (NN passed)
✅ build
```

## Breaking Changes

<!-- 沒有的話整個 section 刪除。 -->

## Deprecated

<!-- 沒有的話整個 section 刪除。 -->

## To-do

<!-- 沒有的話整個 section 刪除；若有，最好附 issue 連結或負責人。 -->

## Architectural decisions

<!-- 連結任何新 ADR；或寫「不需 ADR 因為 <理由>」。 -->

## Screenshots / Demo

<!-- UI 異動才需要。 -->

---

<!-- AI-FIX-STATE
Round: 0/3
Last: -
-->

Refs Issue#<NN>
