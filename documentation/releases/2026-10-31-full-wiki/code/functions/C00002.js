function showUnsupported() {
    if (document.getElementById('missy-browser-unsupported')) return;
    var panel = document.createElement('div');
    panel.id = 'missy-browser-unsupported';
    panel.setAttribute('role', 'alert');
    panel.innerHTML = '<h1>Internet Explorer is not supported</h1><p>MISSY cannot run in Internet Explorer or Edge IE mode. Open this same HTML file or website in current Google Chrome or Microsoft Edge, with IE mode turned off.</p><p>Internet Explorer 无法运行 MISSY。请使用新版 Google Chrome 或 Microsoft Edge，并关闭 IE 模式，打开同一 HTML 文件或网址。</p>';
    document.body.appendChild(panel);
  }