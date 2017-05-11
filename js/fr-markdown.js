/**
 * 参数
 *
 */
var welcomeDocName = "欢迎使用";
var welcomeDocContent = "hello world!";
var welcomeDocUrl = "welcome.md";

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
    var docname = prompt("请输入新文档名：", "新建文档" + (i == 0 ? "" : "(" + i + ")"));
    if (docname == null) return;
    docname = docname.replace(/\ +/g, "");
    if (newDoc(docname, "")) {
        addSelect(docname);
        setSelect(docname);
    }
    else {
        alert("文档名：\"" + docname + "\"已被使用，请重新命名。");
    }
    editor.focus();
});
$("#delete").click(function () {
    if (nowDoc() === welcomeDocName) alert("本文件为系统文件，不能删除！");
    else if (confirm("确认删除！")) {
        delDoc(nowDoc());
        delSelect(nowDoc());
        setSelect(getDocNames()[getDocNames().length - 1]);
    }
    editor.focus();
});
$("#import").click(function () {
    $("#importFile").click();
    $("#importFile").on("change", function () {
        importFile(document.getElementById("importFile").files[0]);
    });
    editor.focus();
});
document.body.addEventListener("drop", function (e) {
    e.preventDefault();
    importFile(e.dataTransfer.files[0]);
}, false);
$("#export").click(function () {
    var fileName = prompt("导出为：", nowDoc());
    if (fileName == null) return;
    fileName = fileName.replace(/\ +/g, "");
    DownloadText(fileName + ".html", getOutContents());
    editor.focus();
});
$("#settings").click(function () {
    alert("settings");
    editor.focus();
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
function importFile(file) {
    if (file == undefined) return;
    var reader = new FileReader();
    reader.onload = function () {
        console.log(this.result);
        if (this.result.indexOf('�') != -1) {
            if (confirm("文件编码错误，将进行自动修正。")) {
                switchEncode();
                alert("修正完毕，请重新上传！");
                return;
            }
        }
        editor.setValue(this.result);
    }
    reader.readAsText(file, encodeType);
}
function switchEncode() {
    encodeType = encodeType === "utf-8" ? "gbk" : "utf-8";
}
function getOutContents() {
    return $("#out").contents().find("html").html();
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
    initParam();
    initStore();
    initDrag();
}
function initParam() {
    encodeType = "utf-8";
}
function initStore() {
    if (!localStorage.docnames) {
        $.ajax({
            url: welcomeDocUrl,
            success: function (data) {
                newDoc(welcomeDocName, data);
                nowDoc(welcomeDocName);
            },
            error: function () {
                newDoc(welcomeDocName, welcomeDocContent);
                nowDoc(welcomeDocName);
            },
            complete: function () {
                initSelete();
            }
        });
    } else {
        initSelete();
    }
}

function initSelete() {
    $.each(getDocNames(), function (i, v) {
        if (v != null) $("#doc-select").append("<option value=" + v + ">" + v + "</option>");
    })
    setSelect(nowDoc());
}

function initDrag() {
    //阻止浏览器默认行为。
    $(document).on({
        dragleave: function (e) {   //拖离
            e.preventDefault();
        },
        drop: function (e) {        //拖后放
            e.preventDefault();
        },
        dragenter: function (e) {   //拖进
            e.preventDefault();
        },
        dragover: function (e) {    //拖来拖去
            e.preventDefault();
        }
    });
}


/**
 * 工具函数
 *
 */
function GB2312UTF8() {
    this.Dig2Dec = function (s) {
        var retV = 0;
        if (s.length == 4) {
            for (var i = 0; i < 4; i++) {
                retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
            }
            return retV;
        }
        return -1;
    }
    this.Hex2Utf8 = function (s) {
        var retS = "";
        var tempS = "";
        var ss = "";
        if (s.length == 16) {
            tempS = "1110" + s.substring(0, 4);
            tempS += "10" + s.substring(4, 10);
            tempS += "10" + s.substring(10, 16);
            var sss = "0123456789ABCDEF";
            for (var i = 0; i < 3; i++) {
                retS += "%";
                ss = tempS.substring(i * 8, (eval(i) + 1) * 8);
                retS += sss.charAt(this.Dig2Dec(ss.substring(0, 4)));
                retS += sss.charAt(this.Dig2Dec(ss.substring(4, 8)));
            }
            return retS;
        }
        return "";
    }
    this.Dec2Dig = function (n1) {
        var s = "";
        var n2 = 0;
        for (var i = 0; i < 4; i++) {
            n2 = Math.pow(2, 3 - i);
            if (n1 >= n2) {
                s += '1';
                n1 = n1 - n2;
            }
            else
                s += '0';
        }
        return s;
    }

    this.Str2Hex = function (s) {
        var c = "";
        var n;
        var ss = "0123456789ABCDEF";
        var digS = "";
        for (var i = 0; i < s.length; i++) {
            c = s.charAt(i);
            n = ss.indexOf(c);
            digS += this.Dec2Dig(eval(n));
        }
        return digS;
    }
    this.Gb2312ToUtf8 = function (s1) {
        var s = escape(s1);
        var sa = s.split("%");
        var retV = "";
        if (sa[0] != "") {
            retV = sa[0];
        }
        for (var i = 1; i < sa.length; i++) {
            if (sa[i].substring(0, 1) == "u") {
                retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1, 5)));
                if (sa[i].length) {
                    retV += sa[i].substring(5);
                }
            }
            else {
                retV += unescape("%" + sa[i]);
                if (sa[i].length) {
                    retV += sa[i].substring(5);
                }
            }
        }
        return retV;
    }
    this.Utf8ToGb2312 = function (str1) {
        var substr = "";
        var a = "";
        var b = "";
        var c = "";
        var i = -1;
        i = str1.indexOf("%");
        if (i == -1) {
            return str1;
        }
        while (i != -1) {
            if (i < 3) {
                substr = substr + str1.substr(0, i - 1);
                str1 = str1.substr(i + 1, str1.length - i);
                a = str1.substr(0, 2);
                str1 = str1.substr(2, str1.length - 2);
                if (parseInt("0x" + a) & 0x80 == 0) {
                    substr = substr + String.fromCharCode(parseInt("0x" + a));
                }
                else if (parseInt("0x" + a) & 0xE0 == 0xC0) { //two byte
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    var widechar = (parseInt("0x" + a) & 0x1F) << 6;
                    widechar = widechar | (parseInt("0x" + b) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                }
                else {
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    c = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    var widechar = (parseInt("0x" + a) & 0x0F) << 12;
                    widechar = widechar | ((parseInt("0x" + b) & 0x3F) << 6);
                    widechar = widechar | (parseInt("0x" + c) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                }
            }
            else {
                substr = substr + str1.substring(0, i);
                str1 = str1.substring(i);
            }
            i = str1.indexOf("%");
        }

        return substr + str1;
    }
}

function DownloadText(filename, content) {
    if (document.createElement("a").download != undefined)//谷歌和火狐，使用“a”标签的download属性
    {
        var aLink = document.createElement('a');
        var blob = new Blob([content]);
        aLink.download = filename;
        aLink.href = URL.createObjectURL(blob);
        aLink.click();
    }
    else//IE
    {
        var Folder = BrowseFolder();
        var fso, tf;
        fso = new ActiveXObject("Scripting.FileSystemObject");//创建文件系统对象
        tf = fso.CreateTextFile(Folder + filename, true);//创建一个文本文件
        tf.write(content);//向文件中写入内容
        tf.Close();
    }
}

function BrowseFolder() {//使用ActiveX控件，选择保存目录
    try {
        var Message = "请选择保存文件夹"; //选择框提示信息
        var Shell = new ActiveXObject("Shell.Application");
        //var Folder = Shell.BrowseForFolder(0, Message, 0x0040, 0x11);//起始目录为：我的电脑
        var Folder = Shell.BrowseForFolder(0, Message, 0); //起始目录为：桌面
        if (Folder != null) {
            Folder = Folder.items(); // 返回 FolderItems 对象
            Folder = Folder.item(); // 返回 Folderitem 对象
            Folder = Folder.Path; // 返回路径
            if (Folder.charAt(Folder.length - 1) != "\\") {
                Folder = Folder + "\\";
            }
            //document.all.savePath.value=Folder;
            return Folder;
        }
    }
    catch (e) {
        alert(e.message);
    }
}
