/**
 * 编辑器
 *
 */

editor = ace.edit("in");
editor.focus();
editor.setFontSize(12);
editor.setReadOnly(false);
editor.setOption("wrap", "free")
editor.setShowPrintMargin(false);
ace.require("ace/ext/language_tools");


/**
 * 生成器
 *
 */
function out(inString) {
    $("#out").contents().find("body").html(marked(inString));
}
$("#in").bind("keyup", function () {
    out(editor.getValue());
});


