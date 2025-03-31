import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

// Custom remark plugin to change heading levels
function remarkHeadingLevel() {
  return (tree) => {
    // Walk through the tree and adjust heading levels
    // This specifically changes h2 to h4
    const visit = (node) => {
      if (node.type === 'heading' && node.depth === 2) {
        node.depth = 4;
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}

const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      remarkPlugins: [remarkHeadingLevel]
    })
  ]
};

export default config;
