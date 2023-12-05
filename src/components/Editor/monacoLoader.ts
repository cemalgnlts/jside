import "monaco-editor/esm/vs/editor/browser/coreCommands.js";
import "monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js";
// import "monaco-editor/esm/vs/editor/browser/widget/diffEditor/diffEditor.contribution.js";
import "monaco-editor/esm/vs/editor/contrib/anchorSelect/browser/anchorSelect.js";
import "monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/esm/vs/editor/contrib/caretOperations/browser/caretOperations.js";
import "monaco-editor/esm/vs/editor/contrib/caretOperations/browser/transpose.js";
import "monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js";
import "monaco-editor/esm/vs/editor/contrib/codeAction/browser/codeActionContributions.js";
import "monaco-editor/esm/vs/editor/contrib/codelens/browser/codelensController.js";
import "monaco-editor/esm/vs/editor/contrib/colorPicker/browser/colorContributions.js";
import "monaco-editor/esm/vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions.js";
import "monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js";
import "monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js";
import "monaco-editor/esm/vs/editor/contrib/cursorUndo/browser/cursorUndo.js";
import "monaco-editor/esm/vs/editor/contrib/dnd/browser/dnd.js";
import "monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js";
import "monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.js";
import "monaco-editor/esm/vs/editor/contrib/find/browser/findController.js";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js";
import "monaco-editor/esm/vs/editor/contrib/fontZoom/browser/fontZoom.js";
import "monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js";
import "monaco-editor/esm/vs/editor/contrib/documentSymbols/browser/documentSymbols.js";
import "monaco-editor/esm/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.js";
import "monaco-editor/esm/vs/editor/contrib/inlineProgress/browser/inlineProgress.js";
import "monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/goToCommands.js";
import "monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.js";
import "monaco-editor/esm/vs/editor/contrib/gotoError/browser/gotoError.js";
import "monaco-editor/esm/vs/editor/contrib/hover/browser/hover.js";
import "monaco-editor/esm/vs/editor/contrib/indentation/browser/indentation.js";
import "monaco-editor/esm/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.js";
import "monaco-editor/esm/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.js";
import "monaco-editor/esm/vs/editor/contrib/lineSelection/browser/lineSelection.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/linkedEditing/browser/linkedEditing.js";
import "monaco-editor/esm/vs/editor/contrib/links/browser/links.js";
import "monaco-editor/esm/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.js";
import "monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js";
import "monaco-editor/esm/vs/editor/contrib/parameterHints/browser/parameterHints.js";
import "monaco-editor/esm/vs/editor/contrib/rename/browser/rename.js";
import "monaco-editor/esm/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.js";
import "monaco-editor/esm/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.js";
import "monaco-editor/esm/vs/editor/contrib/smartSelect/browser/smartSelect.js";
import "monaco-editor/esm/vs/editor/contrib/snippet/browser/snippetController2.js";
import "monaco-editor/esm/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.js";
import "monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestInlineCompletions.js";
import "monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization.js";
import "monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js";
import "monaco-editor/esm/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.js";
import "monaco-editor/esm/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.js";
import "monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.js";
import "monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js";
import "monaco-editor/esm/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.js";
import "monaco-editor/esm/vs/editor/contrib/readOnlyMessage/browser/contribution.js";
import "monaco-editor/esm/vs/editor/common/standaloneStrings.js";
import "monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

// Languages.
import "monaco-editor/esm/vs/language/html/monaco.contribution.js";
import "monaco-editor/esm/vs/language/css/monaco.contribution.js";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution.js";
import "monaco-editor/esm/vs/language/json/monaco.contribution.js";
// Basic languages.
import "monaco-editor/esm/vs/basic-languages/html/html.contribution.js";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution.js";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";
import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js";

// Workers.
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case "json":
        return new jsonWorker();
      case "css":
      case "scss":
      case "less":
        return new cssWorker();
      case "html":
      case "handlebars":
      case "razor":
        return new htmlWorker();
      case "javascript":
      case "typescript":
        return new tsWorker();
      default:
        return new editorWorker();
    }
  }
};

export { monaco };
