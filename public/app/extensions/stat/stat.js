angular.module('classeur.extensions.stat', [])
	.directive('clStat', function(clEditorSvc, clDraggablePanel, clSelectionListeningSvc) {
		function Stat(name, regex) {
			this.name = name;
			this.regex = new RegExp(regex, 'gm');
		}

		var markdownStats = [
			new Stat('bytes', '[\\s\\S]'),
			new Stat('words', '\\S+'),
			new Stat('lines', '\n'),
		];

		var htmlStats = [
			new Stat('characters', '\\S'),
			new Stat('words', '\\S+'),
			new Stat('paragraphs', '\\S.*\n'),
		];

		return {
			restrict: 'E',
			scope: true,
			templateUrl: 'app/extensions/stat/stat.html',
			link: function(scope, element) {
				scope.markdownStats = markdownStats;
				scope.htmlStats = htmlStats;
				scope.editor = clEditorSvc;
				scope.selectionListener = clSelectionListeningSvc;

				clDraggablePanel(element, '.stat.panel', 0, -130, -1.5);

				function computeMarkdown() {
					scope.isMarkdownSelection = false;
					var text = clEditorSvc.cledit.getContent();
					var selectedText = clEditorSvc.cledit.selectionMgr.getSelectedText();
					if(selectedText) {
						scope.isMarkdownSelection = true;
						text = selectedText;
					}
					markdownStats.forEach(function(stat) {
						stat.value = (text.match(stat.regex) || []).length;
					});
				}

				function computeHtml() {
					var text;
					if(clSelectionListeningSvc.range &&
						(clEditorSvc.previewElt.compareDocumentPosition(clSelectionListeningSvc.range.startContainer) & Node.DOCUMENT_POSITION_CONTAINED_BY) &&
						(clEditorSvc.previewElt.compareDocumentPosition(clSelectionListeningSvc.range.endContainer) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
						text = '' + clSelectionListeningSvc.range;
					}
					if(text) {
						scope.isHtmlSelection = true;
					}
					else {
						scope.isHtmlSelection = false;
						text = clEditorSvc.previewText;
					}
					htmlStats.forEach(function(stat) {
						stat.value = (text.match(stat.regex) || []).length;
					});
				}

				scope.$watch('editorSvc.sectionList', computeMarkdown);
				scope.$watch('editorSvc.selectionRange', computeMarkdown);
				scope.$watch('editor.previewText', computeHtml);
				scope.$watch('selectionListener.range', computeHtml);
			}
		};
	});