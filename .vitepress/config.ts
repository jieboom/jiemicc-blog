import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Jiemicc",
  description: " Jiemicc's blog ",
  srcDir: "src",
  base: "/jiemicc-blog/",
  head:[
    ['link',{
      rel:'icon',href:'/public/favicon.ico'
    }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/example/markdown-examples" },
      { text: "Vite", link: "/vite/start/start" },
    ],
    sidebar: {
      "/example/": [
        {
          text: "Examples",
          items: [
            { text: "Markdown Examples", link: "/example/markdown-examples" },
            { text: "Runtime API Examples", link: "/example/api-examples" },
          ],
        },
      ],
      "/vite/": [
        {
          text: "开始",
          items: [{ text: "认识", link: "/vite/start/start.md" }],
        },
        {
          text: "基础使用",
          items: [
            { text: "样式方案", link: "/vite/use/style-process.md" },
            { text: "code lint", link: "/vite/use/lint.md" },
            { text: "assets", link: "/vite/use/asset.md" },
          ],
        },
        {
          text: "内在",
          items: [
            { text: "预构建", link: "/vite/internal/preBundle.md" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/jieboom/jiemicc-blog" },
    ],
  },
});
