# TOOLS — lool-ai
## Tools declared for this project

This file declares which tools this project uses. For credential setup, key rotation, and "where to find" guides → see **[venture-os/CREDENTIALS.md](../venture-os/CREDENTIALS.md)**.

Never manage credentials here. All secrets live in `salasoliva27/dotfiles`.

---

## TOOLS IN USE

| Tool | MCP Server | Used for |
|---|---|---|
| GitHub | `github` | Code push, PR management |
| Brave Search | `brave-search` | Competitor research, CDMX optical store prospecting |
| Google Workspace | `google-workspace` | Drive (product images, docs), Gmail (client threads), Sheets (pricing/leads) |
| Cloudflare | `cloudflare` | R2 bucket `venture-os-media/lool-ai/` — glasses product images, demo videos |
| Filesystem | `filesystem` | Local file R/W during builds |
| Fetch | `fetch` | HTTP calls to client store APIs, webhook testing |
| Sequential Thinking | `sequential-thinking` | Multi-step reasoning for build decisions |
| Playwright | `playwright` | Screenshot competitor optical store websites |

## TOOLS NOT NEEDED (excluded with reason)

| Tool | Reason excluded |
|---|---|
| n8n | No automation pipeline needed at current stage. Revisit at GTM phase. |
| Notion | Not in Jano's active workflow for this project |

---

## CREDENTIAL CHECK

Run the check from venture-os before any Claude Code session on this project:

```bash
# From any terminal in this Codespace:
cd /workspaces/venture-os && cat CREDENTIALS.md
# Or run the live check script from CREDENTIALS.md
```

**Minimum required for this project to function:**
- `GITHUB_TOKEN` (push code)
- `BRAVE_API_KEY` (research)
- `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (media storage — needed before first store pilot)
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + OAuth flow (Drive for client docs, Gmail for store threads)

---

## STORAGE ROUTING

| Content | Where |
|---|---|
| Code, configs, markdown | This repo (GitHub) |
| Glasses product images from clients | Cloudflare R2: `venture-os-media/lool-ai/catalogs/[store-name]/` |
| Demo videos, AI-generated visuals | Cloudflare R2: `venture-os-media/lool-ai/demos/` |
| Client proposals, contracts | Google Drive: `/VentureOS/lool-ai/clients/[store-name]/` |
| Pricing models, lead CSV | Google Drive: `/VentureOS/lool-ai/gtm/` |
