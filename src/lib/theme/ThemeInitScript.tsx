export function ThemeInitScript() {
  const script = `(function(){
    try {
      var s = localStorage.getItem('medikiosk-theme') || 'light';
      var r = s === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : s;
      document.documentElement.classList.add(r);
      document.documentElement.style.colorScheme = r;
    } catch(e) {
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  })()`;
  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}
