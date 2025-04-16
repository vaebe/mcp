#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import packageJson from './package.json'
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from 'zod-to-json-schema';

const server = new Server(
  {
    name: "github-search-mcp-server",
    version: packageJson.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);


const SearchParamsSchema = z.object({
  query: z.string().describe('搜索关键词，用于匹配 GitHub 中的内容'),
  page: z.number().optional().default(1).describe('当前页码，用于分页查询'),
  perPage: z.number().optional().default(30).describe('每页返回的搜索结果数量'),
  type: z.enum(['repositories', 'code', 'issues', 'users'])
    .optional()
    .describe('搜索类型，可选值为 repositories、code、issues 或 users')
});

const UserInfoParamsSchema = z.object({
  username: z.string().describe('GitHub 的用户名')
});


server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "github_search",
        description: "在 GitHub 上搜索仓库、代码、Issues 或用户",
        inputSchema: zodToJsonSchema(SearchParamsSchema),
      },
      {
        name: "get_github_user",
        description: "获取指定 GitHub 用户的详细信息",
        inputSchema: zodToJsonSchema(UserInfoParamsSchema),
      },
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "github_search": {
        const { query, page, perPage, type } = SearchParamsSchema.parse(request.params.arguments);

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

        const data = await res.json()

        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "get_github_user": {
        const { username } = UserInfoParamsSchema.parse(request.params.arguments);
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

        const data = await res.json()

        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('GitHub 搜索 MCP 服务器已在 stdio 上启动')
}

runServer().catch((error) => {
  console.error('启动服务器时出错:', error)
  process.exit(1)
})
