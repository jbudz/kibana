import MarkdownIt from 'markdown-it';
import uiModules from 'ui/modules';

const markdown = new MarkdownIt();
uiModules
  .get('kibana')
  .filter('markdown', function ($sce) {
    return md => md ? $sce.trustAsHtml(markdown.render(md)) : '';
  });
