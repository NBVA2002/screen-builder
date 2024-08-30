// vite.config.mts
import dotenv from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/dotenv/lib/main.js";
import { defineConfig } from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/@vitejs/plugin-react/dist/index.mjs";
import viteTsconfigPaths from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/vite-tsconfig-paths/dist/index.mjs";
import svgrPlugin from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/vite-plugin-svgr/dist/index.mjs";
import checker from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/vite-plugin-checker/dist/esm/main.js";
import { visualizer } from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import path from "path";
import chalk from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/chalk/source/index.js";
import { createHtmlPlugin } from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/vite-plugin-html/dist/index.mjs";
import dynamicImport from "file:///C:/Users/pc-user/Desktop/smartcity-framework/lowcoder/client/node_modules/vite-plugin-dynamic-import/dist/index.mjs";

// src/dev-utils/util.js
function ensureLastSlash(str) {
  if (!str) {
    return "/";
  }
  if (!str.endsWith("/")) {
    return `${str}/`;
  }
  return str;
}

// src/dev-utils/buildVars.js
var buildVars = [
  {
    name: "PUBLIC_URL",
    defaultValue: "/"
  },
  {
    name: "REACT_APP_EDITION",
    defaultValue: "community"
  },
  {
    name: "REACT_APP_LANGUAGES",
    defaultValue: ""
  },
  {
    name: "REACT_APP_COMMIT_ID",
    defaultValue: "00000"
  },
  {
    name: "REACT_APP_API_HOST",
    defaultValue: ""
  },
  {
    name: "LOWCODER_NODE_SERVICE_URL",
    defaultValue: ""
  },
  {
    name: "REACT_APP_ENV",
    defaultValue: "production"
  },
  {
    name: "REACT_APP_BUILD_ID",
    defaultValue: ""
  },
  {
    name: "REACT_APP_LOG_LEVEL",
    defaultValue: "error"
  },
  {
    name: "REACT_APP_IMPORT_MAP",
    defaultValue: "{}"
  },
  {
    name: "REACT_APP_SERVER_IPS",
    defaultValue: ""
  },
  {
    name: "REACT_APP_BUNDLE_BUILTIN_PLUGIN",
    defaultValue: ""
  },
  {
    name: "REACT_APP_BUNDLE_TYPE",
    defaultValue: "app"
  },
  {
    name: "REACT_APP_DISABLE_JS_SANDBOX",
    defaultValue: ""
  }
];

// src/dev-utils/external.js
var libs = [
  "axios",
  "redux",
  "react-router",
  "react-router-dom",
  "react-redux",
  "react",
  "react-dom",
  "lodash",
  "history",
  "antd",
  "@dnd-kit/core",
  "@dnd-kit/modifiers",
  "@dnd-kit/sortable",
  "@dnd-kit/utilities",
  {
    name: "moment",
    extractDefault: true
  },
  {
    name: "dayjs",
    extractDefault: true
  },
  {
    name: "lowcoder-sdk",
    from: "./src/index.sdk.ts"
  },
  {
    name: "styled-components",
    mergeDefaultAndNameExports: true
  }
];
var getLibGlobalVarName = (name) => {
  return "$" + name.replace(/@/g, "$").replace(/[\/\-]/g, "_");
};
var libsImportCode = (exclude = []) => {
  const importLines = [];
  const assignLines = [];
  libs.forEach((i) => {
    let name = i;
    let merge = false;
    let from = name;
    let extractDefault = false;
    if (typeof i === "object") {
      name = i.name;
      merge = i.mergeDefaultAndNameExports ?? false;
      from = i.from ?? name;
      extractDefault = i.extractDefault ?? false;
    }
    if (exclude.includes(name)) {
      return;
    }
    const varName = getLibGlobalVarName(name);
    if (merge) {
      importLines.push(`import * as ${varName}_named_exports from '${from}';`);
      importLines.push(`import ${varName} from '${from}';`);
      assignLines.push(`Object.assign(${varName}, ${varName}_named_exports);`);
    } else if (extractDefault) {
      importLines.push(`import ${varName} from '${from}';`);
    } else {
      importLines.push(`import * as ${varName} from '${from}';`);
    }
    assignLines.push(`window.${varName} = ${varName};`);
  });
  return importLines.concat(assignLines).join("\n");
};

// src/dev-utils/globalDepPlguin.js
function globalDepPlugin(exclude = []) {
  const virtualModuleId = "virtual:globals";
  return {
    name: "lowcoder-global-plugin",
    resolveId(id) {
      if (id === virtualModuleId) {
        return id;
      }
    },
    load(id) {
      if (id === virtualModuleId) {
        return libsImportCode(exclude);
      }
    }
  };
}

// vite.config.mts
var __vite_injected_original_dirname = "C:\\Users\\pc-user\\Desktop\\smartcity-framework\\lowcoder\\client\\packages\\lowcoder";
dotenv.config();
var apiProxyTarget = process.env.LOWCODER_API_SERVICE_URL;
var nodeServiceApiProxyTarget = process.env.NODE_SERVICE_API_PROXY_TARGET;
var nodeEnv = process.env.NODE_ENV ?? "development";
var isDev = nodeEnv === "development";
var isVisualizerEnabled = !!process.env.ENABLE_VISUALIZER;
var browserCheckFileName = `browser-check.js`;
var base = ensureLastSlash(process.env.PUBLIC_URL);
if (!apiProxyTarget && isDev) {
  console.log();
  console.log(chalk.red`LOWCODER_API_SERVICE_URL is required.\n`);
  console.log(chalk.cyan`Start with command: LOWCODER_API_SERVICE_URL=\{backend-api-addr\} yarn start`);
  console.log();
  process.exit(1);
}
var proxyConfig = {
  "/api": {
    target: apiProxyTarget,
    changeOrigin: false
  }
};
if (nodeServiceApiProxyTarget) {
  proxyConfig["/node-service"] = {
    target: nodeServiceApiProxyTarget
  };
}
var define = {};
buildVars.forEach(({ name, defaultValue }) => {
  define[name] = JSON.stringify(process.env[name] || defaultValue);
});
var viteConfig = {
  define,
  assetsInclude: ["**/*.md"],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    alias: {
      "@lowcoder-ee": path.resolve(
        __vite_injected_original_dirname,
        "../lowcoder/src"
      )
    }
  },
  base,
  build: {
    manifest: true,
    target: "es2015",
    cssTarget: "chrome63",
    outDir: "build",
    assetsDir: "static",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        chunkFileNames: "[hash].js"
      },
      onwarn: (warning, warn) => {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      }
    },
    commonjsOptions: {
      defaultIsModuleExports: (id) => {
        if (id.indexOf("antd/lib") !== -1) {
          return false;
        }
        return "auto";
      }
    }
  },
  optimizeDeps: {
    entries: ["./src/**/*.{js,jsx,ts,tsx}"]
    // include: ['antd/es/*'],
    // include: ['antd/**/*'],
    // force: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          "@primary-color": "#3377FF",
          "@link-color": "#3377FF",
          "@border-color-base": "#D7D9E0",
          "@border-radius-base": "4px"
        },
        javascriptEnabled: true
      }
    }
  },
  server: {
    open: true,
    cors: true,
    port: 8e3,
    host: "0.0.0.0",
    proxy: proxyConfig
  },
  plugins: [
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint --quiet "./src/**/*.{ts,tsx}"',
        dev: {
          logLevel: ["error"]
        }
      }
    }),
    react({
      babel: {
        parserOpts: {
          plugins: ["decorators-legacy"]
        },
        plugins: [
          [
            "babel-plugin-styled-components"
          ]
        ]
      }
    }),
    viteTsconfigPaths({
      projects: ["../lowcoder/tsconfig.json", "../lowcoder-design/tsconfig.json"]
    }),
    svgrPlugin({
      svgrOptions: {
        exportType: "named",
        prettier: false,
        svgo: false,
        titleProp: true,
        ref: true
      }
    }),
    globalDepPlugin(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          browserCheckScript: isDev ? "" : `<script src="${base}${browserCheckFileName}"></script>`
        }
      }
    }),
    isVisualizerEnabled && visualizer(),
    dynamicImport()
  ].filter(Boolean)
};
var browserCheckConfig = {
  ...viteConfig,
  define: {
    ...viteConfig.define,
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    ...viteConfig.build,
    manifest: false,
    copyPublicDir: false,
    emptyOutDir: true,
    lib: {
      formats: ["iife"],
      name: "BrowserCheck",
      entry: "./src/browser-check.ts",
      fileName: () => {
        return browserCheckFileName;
      }
    }
  }
};
var buildTargets = {
  main: viteConfig,
  browserCheck: browserCheckConfig
};
var buildTarget = buildTargets[process.env.BUILD_TARGET || "main"];
var vite_config_default = defineConfig(buildTarget || viteConfig);
export {
  vite_config_default as default,
  viteConfig
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgInNyYy9kZXYtdXRpbHMvdXRpbC5qcyIsICJzcmMvZGV2LXV0aWxzL2J1aWxkVmFycy5qcyIsICJzcmMvZGV2LXV0aWxzL2V4dGVybmFsLmpzIiwgInNyYy9kZXYtdXRpbHMvZ2xvYmFsRGVwUGxndWluLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccGMtdXNlclxcXFxEZXNrdG9wXFxcXHNtYXJ0Y2l0eS1mcmFtZXdvcmtcXFxcbG93Y29kZXJcXFxcY2xpZW50XFxcXHBhY2thZ2VzXFxcXGxvd2NvZGVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwYy11c2VyXFxcXERlc2t0b3BcXFxcc21hcnRjaXR5LWZyYW1ld29ya1xcXFxsb3djb2RlclxcXFxjbGllbnRcXFxccGFja2FnZXNcXFxcbG93Y29kZXJcXFxcdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9wYy11c2VyL0Rlc2t0b3Avc21hcnRjaXR5LWZyYW1ld29yay9sb3djb2Rlci9jbGllbnQvcGFja2FnZXMvbG93Y29kZXIvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IGRvdGVudiBmcm9tIFwiZG90ZW52XCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgU2VydmVyT3B0aW9ucywgVXNlckNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHZpdGVUc2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XHJcbmltcG9ydCBzdmdyUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XHJcbmltcG9ydCBjaGVja2VyIGZyb20gXCJ2aXRlLXBsdWdpbi1jaGVja2VyXCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBjaGFsayBmcm9tIFwiY2hhbGtcIjtcclxuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1odG1sXCI7XHJcbmltcG9ydCBkeW5hbWljSW1wb3J0IGZyb20gJ3ZpdGUtcGx1Z2luLWR5bmFtaWMtaW1wb3J0JztcclxuaW1wb3J0IHsgZW5zdXJlTGFzdFNsYXNoIH0gZnJvbSBcIi4vc3JjL2Rldi11dGlscy91dGlsXCI7XHJcbmltcG9ydCB7IGJ1aWxkVmFycyB9IGZyb20gXCIuL3NyYy9kZXYtdXRpbHMvYnVpbGRWYXJzXCI7XHJcbmltcG9ydCB7IGdsb2JhbERlcFBsdWdpbiB9IGZyb20gXCIuL3NyYy9kZXYtdXRpbHMvZ2xvYmFsRGVwUGxndWluXCI7XHJcblxyXG5kb3RlbnYuY29uZmlnKCk7XHJcblxyXG5jb25zdCBhcGlQcm94eVRhcmdldCA9IHByb2Nlc3MuZW52LkxPV0NPREVSX0FQSV9TRVJWSUNFX1VSTDtcclxuY29uc3Qgbm9kZVNlcnZpY2VBcGlQcm94eVRhcmdldCA9IHByb2Nlc3MuZW52Lk5PREVfU0VSVklDRV9BUElfUFJPWFlfVEFSR0VUO1xyXG5jb25zdCBub2RlRW52ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPz8gXCJkZXZlbG9wbWVudFwiO1xyXG5jb25zdCBpc0RldiA9IG5vZGVFbnYgPT09IFwiZGV2ZWxvcG1lbnRcIjtcclxuY29uc3QgaXNWaXN1YWxpemVyRW5hYmxlZCA9ICEhcHJvY2Vzcy5lbnYuRU5BQkxFX1ZJU1VBTElaRVI7XHJcbi8vIHRoZSBmaWxlIHdhcyBuZXZlciBjcmVhdGVkXHJcbi8vIGNvbnN0IGJyb3dzZXJDaGVja0ZpbGVOYW1lID0gYGJyb3dzZXItY2hlY2stJHtwcm9jZXNzLmVudi5SRUFDVF9BUFBfQ09NTUlUX0lEfS5qc2A7XHJcbmNvbnN0IGJyb3dzZXJDaGVja0ZpbGVOYW1lID0gYGJyb3dzZXItY2hlY2suanNgO1xyXG5jb25zdCBiYXNlID0gZW5zdXJlTGFzdFNsYXNoKHByb2Nlc3MuZW52LlBVQkxJQ19VUkwpO1xyXG5cclxuaWYgKCFhcGlQcm94eVRhcmdldCAmJiBpc0Rldikge1xyXG4gIGNvbnNvbGUubG9nKCk7XHJcbiAgY29uc29sZS5sb2coY2hhbGsucmVkYExPV0NPREVSX0FQSV9TRVJWSUNFX1VSTCBpcyByZXF1aXJlZC5cXG5gKTtcclxuICBjb25zb2xlLmxvZyhjaGFsay5jeWFuYFN0YXJ0IHdpdGggY29tbWFuZDogTE9XQ09ERVJfQVBJX1NFUlZJQ0VfVVJMPVxce2JhY2tlbmQtYXBpLWFkZHJcXH0geWFybiBzdGFydGApO1xyXG4gIGNvbnNvbGUubG9nKCk7XHJcbiAgcHJvY2Vzcy5leGl0KDEpO1xyXG59XHJcblxyXG5jb25zdCBwcm94eUNvbmZpZzogU2VydmVyT3B0aW9uc1tcInByb3h5XCJdID0ge1xyXG4gIFwiL2FwaVwiOiB7XHJcbiAgICB0YXJnZXQ6IGFwaVByb3h5VGFyZ2V0LFxyXG4gICAgY2hhbmdlT3JpZ2luOiBmYWxzZSxcclxuICB9LFxyXG59O1xyXG5cclxuaWYgKG5vZGVTZXJ2aWNlQXBpUHJveHlUYXJnZXQpIHtcclxuICBwcm94eUNvbmZpZ1tcIi9ub2RlLXNlcnZpY2VcIl0gPSB7XHJcbiAgICB0YXJnZXQ6IG5vZGVTZXJ2aWNlQXBpUHJveHlUYXJnZXQsXHJcbiAgfTtcclxufVxyXG5cclxuY29uc3QgZGVmaW5lID0ge307XHJcbmJ1aWxkVmFycy5mb3JFYWNoKCh7IG5hbWUsIGRlZmF1bHRWYWx1ZSB9KSA9PiB7XHJcbiAgZGVmaW5lW25hbWVdID0gSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnZbbmFtZV0gfHwgZGVmYXVsdFZhbHVlKTtcclxufSk7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgY29uc3Qgdml0ZUNvbmZpZzogVXNlckNvbmZpZyA9IHtcclxuICBkZWZpbmUsXHJcbiAgYXNzZXRzSW5jbHVkZTogW1wiKiovKi5tZFwiXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBleHRlbnNpb25zOiBbXCIubWpzXCIsIFwiLmpzXCIsIFwiLnRzXCIsIFwiLmpzeFwiLCBcIi50c3hcIiwgXCIuanNvblwiXSxcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQGxvd2NvZGVyLWVlXCI6IHBhdGgucmVzb2x2ZShcclxuICAgICAgICBfX2Rpcm5hbWUsIFwiLi4vbG93Y29kZXIvc3JjXCJcclxuICAgICAgKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBiYXNlLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBtYW5pZmVzdDogdHJ1ZSxcclxuICAgIHRhcmdldDogXCJlczIwMTVcIixcclxuICAgIGNzc1RhcmdldDogXCJjaHJvbWU2M1wiLFxyXG4gICAgb3V0RGlyOiBcImJ1aWxkXCIsXHJcbiAgICBhc3NldHNEaXI6IFwic3RhdGljXCIsXHJcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBcIltoYXNoXS5qc1wiLFxyXG4gICAgICB9LFxyXG4gICAgICBvbndhcm46ICh3YXJuaW5nLCB3YXJuKSA9PiB7XHJcbiAgICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ01PRFVMRV9MRVZFTF9ESVJFQ1RJVkUnKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgd2Fybih3YXJuaW5nKVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xyXG4gICAgICBkZWZhdWx0SXNNb2R1bGVFeHBvcnRzOiAoaWQpID0+IHtcclxuICAgICAgICBpZiAoaWQuaW5kZXhPZihcImFudGQvbGliXCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gXCJhdXRvXCI7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBlbnRyaWVzOiBbJy4vc3JjLyoqLyoue2pzLGpzeCx0cyx0c3h9J11cclxuICAgIC8vIGluY2x1ZGU6IFsnYW50ZC9lcy8qJ10sXHJcbiAgICAvLyBpbmNsdWRlOiBbJ2FudGQvKiovKiddLFxyXG4gICAgLy8gZm9yY2U6IHRydWUsXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgbGVzczoge1xyXG4gICAgICAgIG1vZGlmeVZhcnM6IHtcclxuICAgICAgICAgIFwiQHByaW1hcnktY29sb3JcIjogXCIjMzM3N0ZGXCIsXHJcbiAgICAgICAgICBcIkBsaW5rLWNvbG9yXCI6IFwiIzMzNzdGRlwiLFxyXG4gICAgICAgICAgXCJAYm9yZGVyLWNvbG9yLWJhc2VcIjogXCIjRDdEOUUwXCIsXHJcbiAgICAgICAgICBcIkBib3JkZXItcmFkaXVzLWJhc2VcIjogXCI0cHhcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgb3BlbjogdHJ1ZSxcclxuICAgIGNvcnM6IHRydWUsXHJcbiAgICBwb3J0OiA4MDAwLFxyXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICBwcm94eTogcHJveHlDb25maWcsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICBjaGVja2VyKHtcclxuICAgICAgdHlwZXNjcmlwdDogdHJ1ZSxcclxuICAgICAgZXNsaW50OiB7XHJcbiAgICAgICAgbGludENvbW1hbmQ6ICdlc2xpbnQgLS1xdWlldCBcIi4vc3JjLyoqLyoue3RzLHRzeH1cIicsXHJcbiAgICAgICAgZGV2OiB7XHJcbiAgICAgICAgICBsb2dMZXZlbDogW1wiZXJyb3JcIl0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgcmVhY3Qoe1xyXG4gICAgICBiYWJlbDoge1xyXG4gICAgICAgIHBhcnNlck9wdHM6IHtcclxuICAgICAgICAgIHBsdWdpbnM6IFtcImRlY29yYXRvcnMtbGVnYWN5XCJdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgW1xyXG4gICAgICAgICAgICBcImJhYmVsLXBsdWdpbi1zdHlsZWQtY29tcG9uZW50c1wiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICB2aXRlVHNjb25maWdQYXRocyh7XHJcbiAgICAgIHByb2plY3RzOiBbXCIuLi9sb3djb2Rlci90c2NvbmZpZy5qc29uXCIsIFwiLi4vbG93Y29kZXItZGVzaWduL3RzY29uZmlnLmpzb25cIl0sXHJcbiAgICB9KSxcclxuICAgIHN2Z3JQbHVnaW4oe1xyXG4gICAgICBzdmdyT3B0aW9uczoge1xyXG4gICAgICAgIGV4cG9ydFR5cGU6IFwibmFtZWRcIixcclxuICAgICAgICBwcmV0dGllcjogZmFsc2UsXHJcbiAgICAgICAgc3ZnbzogZmFsc2UsXHJcbiAgICAgICAgdGl0bGVQcm9wOiB0cnVlLFxyXG4gICAgICAgIHJlZjogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgZ2xvYmFsRGVwUGx1Z2luKCksXHJcbiAgICBjcmVhdGVIdG1sUGx1Z2luKHtcclxuICAgICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgICBpbmplY3Q6IHtcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICBicm93c2VyQ2hlY2tTY3JpcHQ6IGlzRGV2ID8gXCJcIiA6IGA8c2NyaXB0IHNyYz1cIiR7YmFzZX0ke2Jyb3dzZXJDaGVja0ZpbGVOYW1lfVwiPjwvc2NyaXB0PmAsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgaXNWaXN1YWxpemVyRW5hYmxlZCAmJiB2aXN1YWxpemVyKCksXHJcbiAgICBkeW5hbWljSW1wb3J0KCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbn07XHJcblxyXG5jb25zdCBicm93c2VyQ2hlY2tDb25maWc6IFVzZXJDb25maWcgPSB7XHJcbiAgLi4udml0ZUNvbmZpZyxcclxuICBkZWZpbmU6IHtcclxuICAgIC4uLnZpdGVDb25maWcuZGVmaW5lLFxyXG4gICAgXCJwcm9jZXNzLmVudi5OT0RFX0VOVlwiOiBKU09OLnN0cmluZ2lmeShcInByb2R1Y3Rpb25cIiksXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgLi4udml0ZUNvbmZpZy5idWlsZCxcclxuICAgIG1hbmlmZXN0OiBmYWxzZSxcclxuICAgIGNvcHlQdWJsaWNEaXI6IGZhbHNlLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICBsaWI6IHtcclxuICAgICAgZm9ybWF0czogW1wiaWlmZVwiXSxcclxuICAgICAgbmFtZTogXCJCcm93c2VyQ2hlY2tcIixcclxuICAgICAgZW50cnk6IFwiLi9zcmMvYnJvd3Nlci1jaGVjay50c1wiLFxyXG4gICAgICBmaWxlTmFtZTogKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBicm93c2VyQ2hlY2tGaWxlTmFtZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkVGFyZ2V0cyA9IHtcclxuICBtYWluOiB2aXRlQ29uZmlnLFxyXG4gIGJyb3dzZXJDaGVjazogYnJvd3NlckNoZWNrQ29uZmlnLFxyXG59O1xyXG5cclxuY29uc3QgYnVpbGRUYXJnZXQgPSBidWlsZFRhcmdldHNbcHJvY2Vzcy5lbnYuQlVJTERfVEFSR0VUIHx8IFwibWFpblwiXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhidWlsZFRhcmdldCB8fCB2aXRlQ29uZmlnKTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwYy11c2VyXFxcXERlc2t0b3BcXFxcc21hcnRjaXR5LWZyYW1ld29ya1xcXFxsb3djb2RlclxcXFxjbGllbnRcXFxccGFja2FnZXNcXFxcbG93Y29kZXJcXFxcc3JjXFxcXGRldi11dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccGMtdXNlclxcXFxEZXNrdG9wXFxcXHNtYXJ0Y2l0eS1mcmFtZXdvcmtcXFxcbG93Y29kZXJcXFxcY2xpZW50XFxcXHBhY2thZ2VzXFxcXGxvd2NvZGVyXFxcXHNyY1xcXFxkZXYtdXRpbHNcXFxcdXRpbC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcGMtdXNlci9EZXNrdG9wL3NtYXJ0Y2l0eS1mcmFtZXdvcmsvbG93Y29kZXIvY2xpZW50L3BhY2thZ2VzL2xvd2NvZGVyL3NyYy9kZXYtdXRpbHMvdXRpbC5qc1wiO2ltcG9ydCBmcyBmcm9tIFwibm9kZTpmc1wiO1xyXG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcIm5vZGU6dXJsXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBMYXN0U2xhc2goc3RyKSB7XHJcbiAgaWYgKHN0ci5lbmRzV2l0aChcIi9cIikpIHtcclxuICAgIHJldHVybiBzdHIuc2xpY2UoMCwgc3RyLmxlbmd0aCAtIDEpO1xyXG4gIH1cclxuICByZXR1cm4gc3RyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlTGFzdFNsYXNoKHN0cikge1xyXG4gIGlmICghc3RyKSB7XHJcbiAgICByZXR1cm4gXCIvXCI7XHJcbiAgfVxyXG4gIGlmICghc3RyLmVuZHNXaXRoKFwiL1wiKSkge1xyXG4gICAgcmV0dXJuIGAke3N0cn0vYDtcclxuICB9XHJcbiAgcmV0dXJuIHN0cjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRKc29uKGZpbGUpIHtcclxuICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZmlsZSkudG9TdHJpbmcoKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjdXJyZW50RGlyTmFtZShpbXBvcnRNZXRhVXJsKSB7XHJcbiAgcmV0dXJuIGRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnRNZXRhVXJsKSk7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwYy11c2VyXFxcXERlc2t0b3BcXFxcc21hcnRjaXR5LWZyYW1ld29ya1xcXFxsb3djb2RlclxcXFxjbGllbnRcXFxccGFja2FnZXNcXFxcbG93Y29kZXJcXFxcc3JjXFxcXGRldi11dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccGMtdXNlclxcXFxEZXNrdG9wXFxcXHNtYXJ0Y2l0eS1mcmFtZXdvcmtcXFxcbG93Y29kZXJcXFxcY2xpZW50XFxcXHBhY2thZ2VzXFxcXGxvd2NvZGVyXFxcXHNyY1xcXFxkZXYtdXRpbHNcXFxcYnVpbGRWYXJzLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9wYy11c2VyL0Rlc2t0b3Avc21hcnRjaXR5LWZyYW1ld29yay9sb3djb2Rlci9jbGllbnQvcGFja2FnZXMvbG93Y29kZXIvc3JjL2Rldi11dGlscy9idWlsZFZhcnMuanNcIjtleHBvcnQgY29uc3QgYnVpbGRWYXJzID0gW1xyXG4gIHtcclxuICAgIG5hbWU6IFwiUFVCTElDX1VSTFwiLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBcIi9cIixcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUkVBQ1RfQVBQX0VESVRJT05cIixcclxuICAgIGRlZmF1bHRWYWx1ZTogXCJjb21tdW5pdHlcIixcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUkVBQ1RfQVBQX0xBTkdVQUdFU1wiLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBcIlwiLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogXCJSRUFDVF9BUFBfQ09NTUlUX0lEXCIsXHJcbiAgICBkZWZhdWx0VmFsdWU6IFwiMDAwMDBcIixcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUkVBQ1RfQVBQX0FQSV9IT1NUXCIsXHJcbiAgICBkZWZhdWx0VmFsdWU6IFwiXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIkxPV0NPREVSX05PREVfU0VSVklDRV9VUkxcIixcclxuICAgIGRlZmF1bHRWYWx1ZTogXCJcIixcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUkVBQ1RfQVBQX0VOVlwiLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBcInByb2R1Y3Rpb25cIixcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUkVBQ1RfQVBQX0JVSUxEX0lEXCIsXHJcbiAgICBkZWZhdWx0VmFsdWU6IFwiXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIlJFQUNUX0FQUF9MT0dfTEVWRUxcIixcclxuICAgIGRlZmF1bHRWYWx1ZTogXCJlcnJvclwiLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogXCJSRUFDVF9BUFBfSU1QT1JUX01BUFwiLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBcInt9XCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIlJFQUNUX0FQUF9TRVJWRVJfSVBTXCIsXHJcbiAgICBkZWZhdWx0VmFsdWU6IFwiXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIlJFQUNUX0FQUF9CVU5ETEVfQlVJTFRJTl9QTFVHSU5cIixcclxuICAgIGRlZmF1bHRWYWx1ZTogXCJcIixcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUkVBQ1RfQVBQX0JVTkRMRV9UWVBFXCIsXHJcbiAgICBkZWZhdWx0VmFsdWU6IFwiYXBwXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIlJFQUNUX0FQUF9ESVNBQkxFX0pTX1NBTkRCT1hcIixcclxuICAgIGRlZmF1bHRWYWx1ZTogXCJcIixcclxuICB9LFxyXG5dO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHBjLXVzZXJcXFxcRGVza3RvcFxcXFxzbWFydGNpdHktZnJhbWV3b3JrXFxcXGxvd2NvZGVyXFxcXGNsaWVudFxcXFxwYWNrYWdlc1xcXFxsb3djb2RlclxcXFxzcmNcXFxcZGV2LXV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwYy11c2VyXFxcXERlc2t0b3BcXFxcc21hcnRjaXR5LWZyYW1ld29ya1xcXFxsb3djb2RlclxcXFxjbGllbnRcXFxccGFja2FnZXNcXFxcbG93Y29kZXJcXFxcc3JjXFxcXGRldi11dGlsc1xcXFxleHRlcm5hbC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcGMtdXNlci9EZXNrdG9wL3NtYXJ0Y2l0eS1mcmFtZXdvcmsvbG93Y29kZXIvY2xpZW50L3BhY2thZ2VzL2xvd2NvZGVyL3NyYy9kZXYtdXRpbHMvZXh0ZXJuYWwuanNcIjsvKipcclxuICogbGlicyB0byBpbXBvcnQgYXMgZ2xvYmFsIHZhclxyXG4gKiBuYW1lOiBtb2R1bGUgbmFtZVxyXG4gKiBtZXJnZURlZmF1bHRBbmROYW1lRXhwb3J0czogd2hldGhlciB0byBtZXJnZSBkZWZhdWx0IGFuZCBuYW1lZCBleHBvcnRzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbGlicyA9IFtcclxuICBcImF4aW9zXCIsXHJcbiAgXCJyZWR1eFwiLFxyXG4gIFwicmVhY3Qtcm91dGVyXCIsXHJcbiAgXCJyZWFjdC1yb3V0ZXItZG9tXCIsXHJcbiAgXCJyZWFjdC1yZWR1eFwiLFxyXG4gIFwicmVhY3RcIixcclxuICBcInJlYWN0LWRvbVwiLFxyXG4gIFwibG9kYXNoXCIsXHJcbiAgXCJoaXN0b3J5XCIsXHJcbiAgXCJhbnRkXCIsXHJcbiAgXCJAZG5kLWtpdC9jb3JlXCIsXHJcbiAgXCJAZG5kLWtpdC9tb2RpZmllcnNcIixcclxuICBcIkBkbmQta2l0L3NvcnRhYmxlXCIsXHJcbiAgXCJAZG5kLWtpdC91dGlsaXRpZXNcIixcclxuICB7XHJcbiAgICBuYW1lOiBcIm1vbWVudFwiLFxyXG4gICAgZXh0cmFjdERlZmF1bHQ6IHRydWUsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcImRheWpzXCIsXHJcbiAgICBleHRyYWN0RGVmYXVsdDogdHJ1ZSxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwibG93Y29kZXItc2RrXCIsXHJcbiAgICBmcm9tOiBcIi4vc3JjL2luZGV4LnNkay50c1wiLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogXCJzdHlsZWQtY29tcG9uZW50c1wiLFxyXG4gICAgbWVyZ2VEZWZhdWx0QW5kTmFtZUV4cG9ydHM6IHRydWUsXHJcbiAgfSxcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBnZXQgZ2xvYmFsIHZhciBuYW1lIGZyb20gbW9kdWxlIG5hbWVcclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBjb25zdCBnZXRMaWJHbG9iYWxWYXJOYW1lID0gKG5hbWUpID0+IHtcclxuICByZXR1cm4gXCIkXCIgKyBuYW1lLnJlcGxhY2UoL0AvZywgXCIkXCIpLnJlcGxhY2UoL1tcXC9cXC1dL2csIFwiX1wiKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRMaWJOYW1lcyA9ICgpID0+IHtcclxuICByZXR1cm4gbGlicy5tYXAoKGkpID0+IHtcclxuICAgIGlmICh0eXBlb2YgaSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICByZXR1cm4gaS5uYW1lO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGk7XHJcbiAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0QWxsTGliR2xvYmFsVmFyTmFtZXMgPSAoKSA9PiB7XHJcbiAgY29uc3QgcmV0ID0ge307XHJcbiAgbGlicy5mb3JFYWNoKChsaWIpID0+IHtcclxuICAgIGxldCBuYW1lID0gbGliO1xyXG4gICAgaWYgKHR5cGVvZiBsaWIgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgbmFtZSA9IGxpYi5uYW1lO1xyXG4gICAgfVxyXG4gICAgcmV0W25hbWVdID0gZ2V0TGliR2xvYmFsVmFyTmFtZShuYW1lKTtcclxuICB9KTtcclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGxpYnNJbXBvcnRDb2RlID0gKGV4Y2x1ZGUgPSBbXSkgPT4ge1xyXG4gIGNvbnN0IGltcG9ydExpbmVzID0gW107XHJcbiAgY29uc3QgYXNzaWduTGluZXMgPSBbXTtcclxuICBsaWJzLmZvckVhY2goKGkpID0+IHtcclxuICAgIGxldCBuYW1lID0gaTtcclxuICAgIGxldCBtZXJnZSA9IGZhbHNlO1xyXG4gICAgbGV0IGZyb20gPSBuYW1lO1xyXG4gICAgbGV0IGV4dHJhY3REZWZhdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIG5hbWUgPSBpLm5hbWU7XHJcbiAgICAgIG1lcmdlID0gaS5tZXJnZURlZmF1bHRBbmROYW1lRXhwb3J0cyA/PyBmYWxzZTtcclxuICAgICAgZnJvbSA9IGkuZnJvbSA/PyBuYW1lO1xyXG4gICAgICBleHRyYWN0RGVmYXVsdCA9IGkuZXh0cmFjdERlZmF1bHQgPz8gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV4Y2x1ZGUuaW5jbHVkZXMobmFtZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZhck5hbWUgPSBnZXRMaWJHbG9iYWxWYXJOYW1lKG5hbWUpO1xyXG4gICAgaWYgKG1lcmdlKSB7XHJcbiAgICAgIGltcG9ydExpbmVzLnB1c2goYGltcG9ydCAqIGFzICR7dmFyTmFtZX1fbmFtZWRfZXhwb3J0cyBmcm9tICcke2Zyb219JztgKTtcclxuICAgICAgaW1wb3J0TGluZXMucHVzaChgaW1wb3J0ICR7dmFyTmFtZX0gZnJvbSAnJHtmcm9tfSc7YCk7XHJcbiAgICAgIGFzc2lnbkxpbmVzLnB1c2goYE9iamVjdC5hc3NpZ24oJHt2YXJOYW1lfSwgJHt2YXJOYW1lfV9uYW1lZF9leHBvcnRzKTtgKTtcclxuICAgIH0gZWxzZSBpZiAoZXh0cmFjdERlZmF1bHQpIHtcclxuICAgICAgaW1wb3J0TGluZXMucHVzaChgaW1wb3J0ICR7dmFyTmFtZX0gZnJvbSAnJHtmcm9tfSc7YCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpbXBvcnRMaW5lcy5wdXNoKGBpbXBvcnQgKiBhcyAke3Zhck5hbWV9IGZyb20gJyR7ZnJvbX0nO2ApO1xyXG4gICAgfVxyXG4gICAgYXNzaWduTGluZXMucHVzaChgd2luZG93LiR7dmFyTmFtZX0gPSAke3Zhck5hbWV9O2ApO1xyXG4gIH0pO1xyXG4gIHJldHVybiBpbXBvcnRMaW5lcy5jb25jYXQoYXNzaWduTGluZXMpLmpvaW4oXCJcXG5cIik7XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccGMtdXNlclxcXFxEZXNrdG9wXFxcXHNtYXJ0Y2l0eS1mcmFtZXdvcmtcXFxcbG93Y29kZXJcXFxcY2xpZW50XFxcXHBhY2thZ2VzXFxcXGxvd2NvZGVyXFxcXHNyY1xcXFxkZXYtdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHBjLXVzZXJcXFxcRGVza3RvcFxcXFxzbWFydGNpdHktZnJhbWV3b3JrXFxcXGxvd2NvZGVyXFxcXGNsaWVudFxcXFxwYWNrYWdlc1xcXFxsb3djb2RlclxcXFxzcmNcXFxcZGV2LXV0aWxzXFxcXGdsb2JhbERlcFBsZ3Vpbi5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcGMtdXNlci9EZXNrdG9wL3NtYXJ0Y2l0eS1mcmFtZXdvcmsvbG93Y29kZXIvY2xpZW50L3BhY2thZ2VzL2xvd2NvZGVyL3NyYy9kZXYtdXRpbHMvZ2xvYmFsRGVwUGxndWluLmpzXCI7aW1wb3J0IHsgbGlic0ltcG9ydENvZGUgfSBmcm9tIFwiLi9leHRlcm5hbC5qc1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdsb2JhbERlcFBsdWdpbihleGNsdWRlID0gW10pIHtcclxuICBjb25zdCB2aXJ0dWFsTW9kdWxlSWQgPSBcInZpcnR1YWw6Z2xvYmFsc1wiO1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiBcImxvd2NvZGVyLWdsb2JhbC1wbHVnaW5cIixcclxuICAgIHJlc29sdmVJZChpZCkge1xyXG4gICAgICBpZiAoaWQgPT09IHZpcnR1YWxNb2R1bGVJZCkge1xyXG4gICAgICAgIHJldHVybiBpZDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGxvYWQoaWQpIHtcclxuICAgICAgaWYgKGlkID09PSB2aXJ0dWFsTW9kdWxlSWQpIHtcclxuICAgICAgICByZXR1cm4gbGlic0ltcG9ydENvZGUoZXhjbHVkZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdiLE9BQU8sWUFBWTtBQUNuYyxTQUFTLG9CQUErQztBQUN4RCxPQUFPLFdBQVc7QUFDbEIsT0FBTyx1QkFBdUI7QUFDOUIsT0FBTyxnQkFBZ0I7QUFD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
