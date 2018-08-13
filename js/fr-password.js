var password = "@password@";
var enterPressFlag = null;

Function.prototype.getMutilines = function () {
    var content = new String(this);
    var start = content.indexOf('/*') + 2;
    var stop = content.lastIndexOf('*/');
    return content.substring(start, stop);
};

var content = function () {
    /*@content@*/
};

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

function buildBody() {
    if (location.protocol.startsWith("http")) {
        document.body.innerHTML = '<div id="background"><div id="container"><input id="pass" type="password" placeholder="请输入文档密码..." onkeypress=\'enterPress(event)\' onkeydown=\'enterPress()\' autofocus="autofocus"/><button id="submit" type="button">确认</button></div></div>';
    } else {
        document.body.innerHTML = content.getMutilines();
    }
    var btn = document.getElementById("submit");
    btn.onclick = function () {
        checkPwd();
    };
}

function enterPress(e) {
    var e = e || window.event;
    if (e.keyCode == 13 && enterPressFlag != 13) {
        checkPwd();
    }
    enterPressFlag = e.keyCode;
}

function checkPwd() {
    var pass = document.getElementById("pass");
    if (pass.value == password) {
        document.body.innerHTML = content.getMutilines();
    } else {
        alert("密码错误，请重试");
        pass.value = "";
        pass.focus();
    }
}

window.onload = function () {
    initIE();
    buildBody();
}