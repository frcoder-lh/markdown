/**
 * 参数
 *
 */
var welcomeDocName = "欢迎使用";
var welcomeDocContent = "hello world!";
var welcomeDocUrl = "welcome.md";
var publishBaseUrl = "http://book.littletools.ml/";

var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var githubUrl = "https://api.github.com/repos/little-tools/md/contents/";
var githubToken1 = "110d32214";
var githubToken3 = "e2ca7e72c9cb857d";
var githubToken2 = "d8c4bf66109ef69";
var gitBranch = "gh-pages";

/**
 * 编辑器
 *
 */
ace.require("ace/ext/language_tools");
editor = ace.edit("in");
editor.focus();
editor.setFontSize(12);
editor.setReadOnly(false);
editor.setOption("wrap", "free");
editor.setShowPrintMargin(false);
editor.$blockScrolling = Infinity;
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});


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
    } else {
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
$("#open").click(function () {
    $("#openFile").click();
    editor.focus();
});
document.body.addEventListener("drop", function (e) {
    e.preventDefault();
    openFile(e.dataTransfer.files[0]);
}, false);
$("#download").click(function () {
    saveFile();
});
$("#import").click(function () {
    importPublishedFile();
});
$("#publish").click(function () {
    publishFile();
});
$("#print").click(function () {
    document.getElementById("out").contentWindow.print();
});
$("#settings").click(function () {
    setUserName();
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
    } else return false;
}

function saveDoc(name, content) {
    localStorage.setItem(setName(name), content);
}

function delDoc(name) {
    localStorage.removeItem(setName(name));
    localStorage.removeItem(setName(name) + "-url");
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

function setDocUrl(name, url) {
    $("#publishUrl").text(url).attr("href", url);
    localStorage.setItem(setName(name) + "-url", url);
}

function getDocUrl(name) {
    return localStorage.getItem(setName(name) + "-url");
}

function addSelect(name) {
    $("#doc-select").append("<option value=" + name + ">" + name + "</option>");
    $("#doc-select").val(name);
}

function setSelect(name) {
    nowDoc(name);
    $("#doc-select").val(name);
    editor.setValue(localStorage.getItem(setName(name)));
    $("#publishUrl").text(getDocUrl(name)).attr("href", getDocUrl(name));
}

function delSelect(name) {
    $("#doc-select option[value='" + name + "']").remove();
}

function openFile(file) {
    if (file == undefined) return;
    var reader = new FileReader();
    reader.onload = function () {
        var content = getRealContent(this.result.toString());
        if (content == null) {
            content = this.result;
        }
        if (content.indexOf('�') != -1) {
            if (confirm("文件编码错误，将进行自动修正。")) {
                switchEncode();
                alert("修正完毕，请重新上传！");
                return;
            }
        }
        if ($.trim(editor.getValue()) == '' || confirm("确认导入文档？当前内容将被覆盖!") == true) {
            editor.setValue(content);
        }
    }
    reader.readAsText(file, encodeType);
}

function saveFile() {
    var fileName = prompt("保存为：", nowDoc());
    if (fileName == null) return;
    fileName = fileName.replace(/\ +/g, "");
    DownloadText(fileName + ".html", clearPlaceholder(getOutContents()));
    editor.focus();
}

function getRealContent(content) {
    var res = content.toString().match(/<!---([\s\S]*?)---->/im);
    if (res != null) return res[0].slice(5, -5);
    return null;
}

function setRealContent(realContent, content) {
    return "<!---" + realContent + "---->\n" + content;
}

function getRealUrl(url) {
    var realUrl = url.endsWith(".html") ? url : url + ".html";
    realUrl = "http" + realUrl.substring(realUrl.indexOf("://"));
    return realUrl;
}

function importPublishedFile() {
    var url = prompt("文档地址：");
    if (url == null) return;
    url = decodeURI(url.replace(/\ +/g, ""));
    $.ajax({
        type: "GET",
        url: getRealUrl(url),
        success: function (data) {
            var content = getRealContent(data);
            if (content == null) {
                content = data;
            }
            if ($.trim(editor.getValue()) == '' || confirm("确认导入文档？当前内容将被覆盖!") == true) {
                editor.setValue(content);
                editor.focus();
                setDocUrl(nowDoc(), url);
            }
        },
        error: function () {
            alert("地址不存在！");
        }
    });

}

function publishFile() {
    if ($.trim(getUserName()) == '') setUserName();
    if ($.trim(getUserName()) != '') {
        var fileName = prompt("发布为：", nowDoc());
        if (fileName == null) return;
        fileName = fileName.replace(/\ +/g, "");
        var path = getUserName() + "/" + fileName;

        var password = prompt("创建文档密码：");
        appendPassWord(password, function (content) {

            var realUrl = githubUrl + path;
            if (!realUrl.endsWith(".html")) realUrl += ".html";

            var showUrl = publishBaseUrl + path;

            // 获取文档信息，探测文档是否存在
            githubGetFileInfo(realUrl, function (data) {
                if (confirm("文档已存在，是否覆盖!")) {
                    saveOrUpdate(data.sha);
                } else {
                    setDocUrl(nowDoc(), showUrl);
                }
            }, function (e) {
                if (e.status == 404) {
                    saveOrUpdate();
                }
            });

            function saveOrUpdate(sha) {
                githubSaveFile(realUrl, sha, content,
                    function () {
                        alert("发布成功！");
                        setDocUrl(nowDoc(), showUrl);
                    }, function (e) {
                        alert("发布失败！");
                    });
            }
        }, function () {
            alert("文档加密失败！");
        });
    }
    editor.focus();
}

function switchEncode() {
    encodeType = encodeType === "utf-8" ? "gbk" : "utf-8";
}

function getOutContents() {
    return setRealContent(editor.getValue(), $("#out").contents().find("html").html());
}

function appendPassWord(password, success, fail) {

    // 在输入密码时，选择取消或者选择确认时密码为空，都表示不加密码
    if (password == null || $.trim(password) == '') {
        success(getOutContents());
        return;
    }

    var times = 0, files = ["out.html", "js/fr-password.js", "css/fr-password.css"], datas = {};
    files.forEach(function (file) {
        $.ajax({
            type: "GET",
            url: file,
            success: function (data) {
                datas[file] = data;
                trigger();
            },
            error: function () {
                trigger();
            }
        });
    });

    function trigger() {
        times++;
        if (times === files.length) {
            if (datas["out.html"] == undefined || datas["css/fr-password.css"] == undefined || datas["js/fr-password.js"] == undefined) {
                fail();
            } else {
                complete();
            }
        }
    }

    function complete() {
        var content = datas["out.html"];
        content = content.replace("<!---css/fr-password.css---->", '<style type="text/css">' + datas["css/fr-password.css"] + '</style>');
        content = content.replace("<!---js/fr-password.js---->", '<script language="javascript">' + datas["js/fr-password.js"] + '</script>');
        content = content.replace("@password@", password);
        content = content.replace("@content@", $("#out").contents().find("body").html());
        content = setRealContent(editor.getValue(), content);
        success(content);
    }
}

function clearPlaceholder(content) {
    content = content.replace("<!---css/fr-password.css---->", '');
    content = content.replace("<!---js/fr-password.js---->", '');
    return content;
}

function setUserName() {
    var username = prompt("请输入用户名：", localStorage.username);
    if ($.trim(username) != '') {
        localStorage.username = username.replace(/\ +/g, "");
    }
}

function getUserName() {
    return localStorage.username;
}

function getGithubToken() {
    return githubToken1 + githubToken2 + githubToken3;
}

function githubGetFileInfo(url, success, fail) {
    $.ajax({
        type: "GET",
        url: url,
        data: {
            "ref": gitBranch
        },
        success: success,
        error: fail
    });
}

function githubSaveFile(url, sha, content, success, fail) {
    $.ajax({
        type: "PUT",
        url: url,
        headers: {
            "Authorization": "token " + getGithubToken()
        },
        data: JSON.stringify(sha ? {
            "branch": gitBranch,
            "message": "update",
            "sha": sha,
            "content": Base64Encode(content)
        } : {
            "branch": gitBranch,
            "message": "save",
            "content": Base64Encode(content)
        }),
        dataType: 'json',
        ContentType: "application/json",
        success: success,
        error: fail
    });
}

/**
 * 生成器
 *
 */
function out(inString) {
    $("#out").contents().find("body").html(marked(inString,
        {
            breaks: true,
            highlight: function (code, lang) {
                if (lang == undefined || !hljs.listLanguages().includes(lang)) {
                    return hljs.highlightAuto(code).value;
                }
                return hljs.highlight(lang, code).value;
            }
        }));
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
    initIE();
    initParam();
    initStore();
    initBind();
    initDrag();
}

/**
 * 处理ie的兼容性问题
 */
function initIE() {
    String.prototype.startsWith = String.prototype.startsWith || function (str) {
        var reg = new RegExp("^" + str);
        return reg.test(this);
    }
    String.prototype.endsWith = String.prototype.endsWith || function (str) {
        var reg = new RegExp(str + "$");
        return reg.test(this);
    }
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

function initBind() {
    $("#openFile").on("change", function () {
        openFile(document.getElementById("openFile").files[0]);
    });

    new ClipboardJS('#copyPublishUrl', {
        text: function () {
            return $("#publishUrl").text();
        }
    });
    $("#publishUrl").bind("contextmenu", function (e) {
        return false;
    }).mousedown(function (e) {
        if (3 == e.which) {
            $('#copyPublishUrl').click();
            alert('地址已复制到剪切板！');
        }
    });
}

function initDrag() {
    //阻止浏览器默认行为
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
    //监听Ctrl+s事件
    $(document).keydown(function (e) {
        if (e.ctrlKey == true && e.keyCode == 83) {
            saveFile();
            return false; // 返回false就不会保存网页了
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
            } else
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
            } else {
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
                } else if (parseInt("0x" + a) & 0xE0 == 0xC0) { //two byte
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    var widechar = (parseInt("0x" + a) & 0x1F) << 6;
                    widechar = widechar | (parseInt("0x" + b) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                } else {
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    c = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    var widechar = (parseInt("0x" + a) & 0x0F) << 12;
                    widechar = widechar | ((parseInt("0x" + b) & 0x3F) << 6);
                    widechar = widechar | (parseInt("0x" + c) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                }
            } else {
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
    } else//IE
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
    } catch (e) {
        alert(e.message);
    }
}

function Base64Encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}

// public method for decoding
function Base64Decode(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }
    output = _utf8_decode(output);
    return output;
}

// private method for UTF-8 encoding
function _utf8_encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }
    return utftext;
}

// private method for UTF-8 decoding
function _utf8_decode(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return string;
}


