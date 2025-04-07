#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import packageJson from './package.json' with { type: "json" }

// 创建 MCP 服务器
const server = new McpServer({
  name: 'mcp-server-github-search',
  version: packageJson.version
})

const SearchParams = {
  query: z.string().describe('搜索关键词，用于匹配 GitHub 中的内容'),
  page: z.number().optional().default(1).describe('当前页码，用于分页查询'),
  perPage: z.number().optional().default(30).describe('每页返回的搜索结果数量'),
  type: z.enum(['repositories', 'code', 'issues', 'users'])
         .optional()
         .describe('搜索类型，可选值为 repositories、code、issues 或 users')
} 

const SearchParamsSchema = z.object(SearchParams);

// 注册搜索工具
server.tool(
  'search_github',
  '在 GitHub 上搜索仓库、代码、Issues 或用户',
  SearchParams,
  async ({ query, page, perPage, type }: z.infer<typeof SearchParamsSchema>) => {
    const url = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    })

    if (!res.ok) {
      throw new Error(`GitHub API 错误: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }
)

const UserInfoParams = {
  username: z.string().describe('GitHub 的用户名')
};
const UserInfoParamsSchema = z.object(UserInfoParams);

server.tool(
  'get_github_user',
  '获取指定 GitHub 用户的详细信息',
  UserInfoParams,
  async ({ username }: z.infer<typeof UserInfoParamsSchema>) => {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    })

    if (!res.ok) {
      throw new Error(`获取用户信息失败: ${res.status} ${res.statusText}`)
    }

    return await res.json()
  }
)

// 启动服务器
async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('GitHub 搜索 MCP 服务器已在 stdio 上启动')
}

runServer().catch((error) => {
  console.error('启动服务器时出错:', error)
  process.exit(1)
})
