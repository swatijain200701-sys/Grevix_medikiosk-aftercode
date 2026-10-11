export function ThemeInitScript() {
  const script = `(function(){
    try {
      var s = localStorage.getItem('medikiosk-theme');
      var r = 'light';
      if (s === 'dark') {
        r = 'dark';
      } else if (s === 'system') {
        r = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        r = 'light';
      }
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(r);
      document.documentElement.style.colorScheme = r;
    } catch(e) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  })()`;
  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}
