# Agent Reach — Internet Access for Agents

Give AI agents the ability to read the entire internet. One CLI install, zero API fees.
Based on [Agent Reach](https://github.com/Panniantong/Agent-Reach) (16K+ GitHub stars).

## Prerequisites

```bash
# Check if installed
agent-reach doctor

# Install if needed
pipx install https://github.com/Panniantong/agent-reach/archive/main.zip
agent-reach install --env=auto
```

## Platform Quick Reference

### Zero-Config (works immediately)

```bash
# Read any web page (primary)
curl -s "https://r.jina.ai/URL"

# Read any web page (fallback — local, no API dependency)
npx defuddle parse URL --markdown

# YouTube — get video metadata + subtitles
yt-dlp --dump-json "https://youtube.com/watch?v=xxx"
yt-dlp --write-sub --skip-download "URL"

# GitHub — repos, issues, PRs
gh repo view owner/repo
gh search repos "LLM framework" --sort stars
gh issue list -R owner/repo

# Reddit — search and read
rdt search "query"
rdt read POST_ID

# RSS — parse any feed
python3 -c "import feedparser; f=feedparser.parse('URL'); print([e.title for e in f.entries[:10]])"

# Exa semantic search (via MCP)
mcporter call 'exa.web_search_exa(query: "topic", num_results: 10)'
```

### Cookie-Required (configure first)

```bash
# Twitter/X — search, read, timeline
twitter search "query" -n 10
twitter tweet URL
twitter timeline -n 20

# Configure Twitter cookies (one-time):
# User exports cookies from Cookie-Editor Chrome extension
agent-reach configure twitter-cookies "COOKIE_STRING"
```

## Multi-Platform Research Pattern

When asked to research a topic, combine platforms:

1. `twitter search "topic" -n 10` — real-time discussion and sentiment
2. `yt-dlp --dump-json URL` — deep-dive video transcripts
3. `gh search repos "topic" --sort stars` — implementations and tools
4. `rdt search "topic"` — community discussions and troubleshooting
5. `mcporter call 'exa.web_search_exa(query: "topic")'` — semantic web search
6. `curl -s "https://r.jina.ai/URL"` — read specific articles (fallback: `npx defuddle parse URL --markdown`)

### Username OSINT (handle → platforms)

When the task is "where does this username exist?" rather than "what are people saying?", use Sherlock:

```bash
pipx install sherlock-project
sherlock handle --csv
```

400+ sites. Complements Twitter/GitHub search in agent-reach. See [[sherlock]] in wiki.

Synthesize across all sources for an answer that covers the evidence.

## Web Page Fallback Chain

If Jina Reader fails (rate limit, timeout, error), use defuddle:

```bash
npx defuddle parse URL --markdown     # Markdown content
npx defuddle parse URL --json         # Metadata + content (title, author, published, schema.org)
```

Defuddle runs locally with no API dependency. Output is Obsidian-native Markdown.

## Health Check

```bash
agent-reach doctor    # Shows status of all channels (✅/❌/⚠️)
agent-reach watch     # Quick health + update check
```

## Security Notes

- Credentials stored locally only at `~/.agent-reach/config.yaml` (permission 600)
- Use dedicated/secondary accounts for cookie-based platforms
- All upstream tools are open source and auditable
- `--safe` mode previews without installing; `--dry-run` shows operations

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `claude-agent-reach` | [`references/skills/claude-agent-reach/SKILL.md`](references/skills/claude-agent-reach/SKILL.md) | Give your AI agent eyes to see the entire internet. 17 platforms via CLI, MCP, curl, and Python scripts. Zero config for 8 channels. 【路由方式】SKILL.md 包含路由表和常用命令，复杂场景需按需阅读对应分类的 references/*.md。 分类：search / social (小红书/抖音/微博/推特/B站/V2EX/Reddit) / career(LinkedIn) / dev(github) / web(网页/文章/公众号/RSS) / video(YouTube/B站/播客). Use when user asks to search, read, or interact on any supported platform, shares a URL, or asks to search the web. |
<!-- folded-skills:auto:end -->
