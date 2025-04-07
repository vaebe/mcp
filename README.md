# mcp

## 版本更新

```bash
# 安装 changesets
npm install @changesets/cli --save-dev

# 初始化 changesets
npx changeset init

# 创建一个新的 changeset
npx changeset

# 更新版本号和生成发布日志
npx changeset version

# 测试发布
pnpm -r publish --access public --dry-run --no-git-checks
# 发布
pnpm -r publish --access public --no-git-checks
```

## 测试 mcp

```bash
npx @modelcontextprotocol/inspector node mcp/githubSearch.mjs
```