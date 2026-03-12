export interface WxTheme {
  name: string
  styles: Record<string, string>
}

export const defaultTheme: WxTheme = {
  name: '默认',
  styles: {
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
  },
}

export const techTheme: WxTheme = {
  name: '技术',
  styles: {
    ...defaultTheme.styles,
    h1: 'font-size:24px;font-weight:bold;color:#0d47a1;margin:24px 0 12px;line-height:1.4;border-bottom:2px solid #0d47a1;padding-bottom:8px;',
    h2: 'font-size:20px;font-weight:bold;color:#1565c0;margin:20px 0 10px;line-height:1.4;',
    h3: 'font-size:18px;font-weight:bold;color:#1976d2;margin:16px 0 8px;line-height:1.4;',
    pre: 'background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;overflow-x:auto;margin:16px 0;font-size:13px;line-height:1.6;border:1px solid #333;',
    code: 'font-family:Menlo,Monaco,Consolas,monospace;font-size:13px;background:#e3f2fd;padding:2px 6px;border-radius:3px;color:#0d47a1;',
    blockquote: 'border-left:4px solid #1976d2;padding:8px 16px;margin:16px 0;color:#555;background:#e3f2fd;',
    a: 'color:#1976d2;text-decoration:none;',
  },
}

export const elegantTheme: WxTheme = {
  name: '优雅',
  styles: {
    ...defaultTheme.styles,
    h1: 'font-size:26px;font-weight:300;color:#2c3e50;margin:28px 0 14px;line-height:1.3;letter-spacing:1px;',
    h2: 'font-size:22px;font-weight:300;color:#34495e;margin:24px 0 12px;line-height:1.3;letter-spacing:0.5px;',
    h3: 'font-size:18px;font-weight:400;color:#34495e;margin:18px 0 8px;line-height:1.4;',
    p: 'font-size:15px;color:#444;margin:0 0 18px;line-height:2;letter-spacing:0.3px;',
    blockquote: 'border-left:3px solid #bdc3c7;padding:12px 20px;margin:20px 0;color:#7f8c8d;background:#fafafa;font-style:italic;',
    a: 'color:#e74c3c;text-decoration:none;',
    hr: 'border:none;border-top:1px solid #ecf0f1;margin:32px auto;width:60%;',
  },
}

export const themes: WxTheme[] = [defaultTheme, techTheme, elegantTheme]
