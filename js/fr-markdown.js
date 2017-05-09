/**
 * 参数
 *
 */
var welcomeDocName = "欢迎使用";
var welcomeDocContent = "hello world!";

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
 * 菜单栏
 *
 */
$("#doc-select").on("change", function () {
    setSelect(nowDoc($("#doc-select").val()));
});
$("#new").click(function () {
    var i = 0;
    while (isExistsInDocNames("新建文档" + (i == 0 ? "" : "(" + i + ")"))) i++;
    var docname = prompt("请输入新文档名：", "新建文档" + (i == 0 ? "" : "(" + i + ")")).replace(/\ +/g, "");
    if (newDoc(docname, "")) {
        addSelect(docname);
        setSelect(docname);
    }
    else {
        alert("文档名：\"" + docname + "\"已被使用，请重新命名。");
    }
});
$("#delete").click(function () {
    if (nowDoc() === welcomeDocName) alert("本文件为系统文件，不能删除！");
    else if (confirm("确认删除！")) {
        delDoc(nowDoc());
        delSelect(nowDoc());
        setSelect(getDocNames()[getDocNames().length - 1]);
    }
});
$("#import").click(function () {
    alert("import");
});
$("#export").click(function () {
    alert("export");
});
$("#settings").click(function () {
    alert("settings");
});
function setName(name) {
    return "fr-" + name;
}
function getName(name) {
    name = name.toString();
    if (name.substring(0, 3) === "fr-") return name.substring(3);
    else return null;
}
function newDoc(name, content) {
    if (!isExistsInDocNames(name)) {
        saveDoc(name, content);
        var docnames = getDocNames();
        docnames.push(name);
        localStorage.docnames = docnames;
        return true;
    }
    else return false;
}
function saveDoc(name, content) {
    localStorage.setItem(setName(name), content);
}
function delDoc(name) {
    localStorage.removeItem(setName(name));
    var docnames = getDocNames();
    docnames.splice($.inArray(name, docnames), 1);
    localStorage.docnames = docnames;
}
function nowDoc(name) {
    if (name != null) localStorage.doc_now = name;
    return localStorage.doc_now;
}
function isExistsInDocNames(docname) {
    if (("," + localStorage.docnames + ",").indexOf(("," + docname + ",")) != -1) return true;
    else return false;
}
function getDocNames() {
    if (!localStorage.docnames) return [];
    return localStorage.docnames.toString().split(",");
}
function addSelect(name) {
    $("#doc-select").append("<option value=" + name + ">" + name + "</option>");
    $("#doc-select").val(name);
}
function setSelect(name) {
    nowDoc(name);
    $("#doc-select").val(name);
    editor.setValue(localStorage.getItem(setName(name)));
}
function delSelect(name) {
    $("#doc-select option[value='" + name + "']").remove();
}

/**
 * 生成器
 *
 */
function out(inString) {
    $("#out").contents().find("body").html(marked(inString));
}
editor.getSession().on("change", function () {
    out(editor.getValue());
    saveDoc(nowDoc(), editor.getValue());
})

/**
 * 初始化
 *
 */
window.onload = function () {
    initStore();
    initSelete();
}

function initStore() {
    if (!localStorage.docnames) {
        newDoc(welcomeDocName, welcomeDocContent);
        nowDoc(welcomeDocName);
    }
}

function initSelete() {
    $.each(getDocNames(), function (i, v) {
        console.log(i + v);
        if (v != null) $("#doc-select").append("<option value=" + v + ">" + v + "</option>");
    })
    setSelect(nowDoc());
}


