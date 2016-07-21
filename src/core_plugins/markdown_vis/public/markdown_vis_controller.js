import MarkdownIt from 'markdown-it';
import uiModules from 'ui/modules';

const markdown = new MarkdownIt();
const module = uiModules.get('kibana/markdown_vis', ['kibana']);
module.controller('KbnMarkdownVisController', function ($scope, $sce) {
  $scope.$watch('vis.params.markdown', function (html) {
    if (!html) return;
    $scope.html = $sce.trustAsHtml(markdown.render(html));
  });
});
