import { marked, Tokens } from 'marked'
import hljs from 'highlight.js'

const defaultStyles: Record<string, string> = {
  h1: 'font-size:24px;font-weight:bold;color:#1a1a1a;margin:24px 0 12px;line-height:1.4;',
  h2: 'font-size:20px;font-weight:bold;color:#1a1a1a;margin:20px 0 10px;line-height:1.4;',
  h3: 'font-size:18px;font-weight:bold;color:#1a1a1a;margin:16px 0 8px;line-height:1.4;',
  p: 'font-size:15px;color:#333;margin:0 0 16px;line-height:1.8;',
  blockquote: 'border-left:4px solid #ddd;padding:8px 16px;margin:16px 0;color:#666;background:#f9f9f9;',
  code: 'font-family:Menlo,Monaco,Consolas,monospace;font-size:13px;background:#f5f5f5;padding:2px 4px;border-radius:3px;color:#c7254e;',
  pre: 'background:#282c34;color:#abb2bf;padding:16px;border-radius:6px;overflow-x:auto;margin:16px 0;font-size:13px;line-height:1.6;',
  ul: 'margin:0 0 16px;padding-left:24px;',
  ol: 'margin:0 0 16px;padding-left:24px;',
  li: 'font-size:15px;color:#333;line-height:1.8;margin:4px 0;',
  a: 'color:#576b95;text-decoration:none;',
  img: 'max-width:100%;height:auto;margin:8px 0;border-radius:4px;',
  table: 'width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;',
  th: 'border:1px solid #ddd;padding:8px 12px;background:#f5f5f5;font-weight:bold;text-align:left;',
  td: 'border:1px solid #ddd;padding:8px 12px;',
  hr: 'border:none;border-top:1px solid #eee;margin:24px 0;',
  strong: 'font-weight:bold;color:#1a1a1a;',
  em: 'font-style:italic;',
}

export function markdownToWxHtml(markdown: string, styles = defaultStyles): string {
  const renderer = new marked.Renderer()

  renderer.heading = (token: Tokens.Heading) => {
    const tag = `h${token.depth}` as keyof typeof styles
    return `<${tag} style="${styles[tag] || ''}">${token.text}</${tag}>`
  }

  renderer.paragraph = (token: Tokens.Paragraph) =>
    `<p style="${styles.p}">${token.text}</p>`

  renderer.blockquote = (token: Tokens.Blockquote) =>
    `<blockquote style="${styles.blockquote}">${token.text}</blockquote>`

  renderer.code = (token: Tokens.Code) => {
    let highlighted = token.text
    if (token.lang && hljs.getLanguage(token.lang)) {
      highlighted = hljs.highlight(token.text, { language: token.lang }).value
    } else {
      highlighted = hljs.highlightAuto(token.text).value
    }
    return `<pre style="${styles.pre}"><code>${highlighted}</code></pre>`
  }

  renderer.codespan = (token: Tokens.Codespan) =>
    `<code style="${styles.code}">${token.text}</code>`

  renderer.list = (token: Tokens.List) => {
    const tag = token.ordered ? 'ol' : 'ul'
    const items = token.items.map(item =>
      `<li style="${styles.li}">${item.text}</li>`
    ).join('')
    return `<${tag} style="${styles[tag]}">${items}</${tag}>`
  }

  renderer.link = (token: Tokens.Link) =>
    `<a href="${token.href}" style="${styles.a}">${token.text}</a>`

  renderer.image = (token: Tokens.Image) =>
    `<img src="${token.href}" alt="${token.text || ''}" style="${styles.img}" />`

  renderer.table = (token: Tokens.Table) => {
    const header = token.header.map(cell =>
      `<th style="${styles.th}">${cell.text}</th>`
    ).join('')
    const rows = token.rows.map(row =>
      `<tr>${row.map(cell => `<td style="${styles.td}">${cell.text}</td>`).join('')}</tr>`
    ).join('')
    return `<table style="${styles.table}"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`
  }

  renderer.hr = () =>
    `<hr style="${styles.hr}" />`

  renderer.strong = (token: Tokens.Strong) =>
    `<strong style="${styles.strong}">${token.text}</strong>`

  renderer.em = (token: Tokens.Em) =>
    `<em style="${styles.em}">${token.text}</em>`

  const html = marked(markdown, { renderer, async: false }) as string
  return html
}
