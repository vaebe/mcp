# mcp

## 版本更新

```bash
# 安装 changesets
npm install @changesets/cli --save-dev

# 初始化 changesets
npx changeset init

# 生成变更日志
pnpm changelog

# 创建一个新的 changeset
npx changeset

# 更新版本号和生成发布日志
npx changeset version

# 测试发布
pnpm -r publish --access public --dry-run --no-git-checks
# 发布
pnpm -r publish --access public --no-git-checks

# 移除版本
npm unpublish @vaebe/server-github-search@0.2.0 --force
```

## 测试 mcp

```bash
npx @modelcontextprotocol/inspector node mcp/githubSearch.mjs
```

## docker 打包测试

```bash
docker build -f packages/github-search/Dockerfile -t github-search .
```