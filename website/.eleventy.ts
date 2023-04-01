import eleventyPluginFilesMinifier  from "@sherby/eleventy-plugin-files-minifier";
import CleanCSS from "clean-css";
import postcss from "postcss";
import rtl from 'postcss-rtl';
import autoprefixer from "autoprefixer";
import {loadLocale, i18n} from '../src/i18n_base';
import type EleventyConfig from "@11ty/eleventy/src/UserConfig";
import type EleventyDefaultConfig from "@11ty/eleventy/src/defaultConfig";

const eleventyGoogleFonts = require("eleventy-google-fonts");
const { EleventyI18nPlugin  } = require("@11ty/eleventy"); 

const dir = {
  input: 'src',
  output: 'dist',
};

module.exports = function (eleventyConfig: EleventyConfig): typeof EleventyDefaultConfig {
  // ts settings
  eleventyConfig.addExtension(["11ty.ts", "11ty.tsx"], {
    key: "11ty.js",
  });

  eleventyConfig.addDataExtension('ts', (content, path) => {
    const data = require(path);
    return data.default;
  });

  // Passthrough Copy
  eleventyConfig.addPassthroughCopy({
    'src/assets/favicon/*': '/',
    'src/assets/images/*.png': '/images/',
    'src/assets/images/f-droid/*.png': '/images/f-droid/'
  });
  
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    // any valid BCP 47-compatible language tag is supported
    defaultLanguage: "en",

    // When to throw errors for missing localized content files
    errorMode: "allow-fallback", 
  });

  // for minification: 
  eleventyConfig.addPlugin(eleventyPluginFilesMinifier);
  // for fonts
  // eleventyConfig.addPlugin(eleventyGoogleFonts);

  async function processCSS(content, inputPath) {
    let output = await postcss([
      autoprefixer,
      rtl,
    ]).process(content, { from: inputPath });
    return output.css;
  }

  eleventyConfig.addFilter("postcss", async function(inputContent, inputPath) {
    return new CleanCSS({}).minify(await processCSS(inputContent, inputPath)).styles;
  });


  // dev server doesn't spider js dependencies properly, so opt for hard browsersync with watch. 
  eleventyConfig.setServerOptions({
    module: "@11ty/eleventy-server-browsersync",
    snippet: true,
    watch: true, 
    server: dir.output,
    port: 3000,
  });

  // for translation of navigation keys in nunjucks

  eleventyConfig.addFilter("lingui", function(inputContent) {
    loadLocale(this.page.lang);
    return i18n._(inputContent);
  });

  return {
    dir,
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
};
