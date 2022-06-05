<?php
require_once('../verify.php');
if (!GetUserLogonInfo()) {
    header('Location: ../');
    die();
}

$type = (isset($_GET['type']) ? 
            ($_GET['type'] == 'modify' ? 'modify' : 'new')
            : 'new'
        );
?>

<!DOCTYPE html>
<html lang="zh-cn">

<head>
    <meta charset="utf-8" />
    <title>pctr</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" href="../generic.css" />
    <style>*{font-size:20px}.dblock{display:block}</style>
    <script src="../ModalElement.js"></script>
</head>

<body>

<form action method="POST" id=a>
    <h1 style="font-size:42px"><?php echo $type=='new'?'增加':'修改'; ?>记录</h1>

    <div>
        <label class=dblock id=b>
            开始时间: 
            <input type=number min=1970 max=9999 placeholder="..." required> 年
            <input type=number min=1 max=12 placeholder="..." required> 月
            <input type=number min=1 max=31 placeholder="..." required> 日
            <input type=number min=0 max=23 placeholder="..." required value="0"> 时
            <input type=number min=0 max=59 placeholder="..." required value="0"> 分
            <input type=number min=0 max=59 placeholder="..." required value="0"> 秒
            <button type=button class=now>现在</button>
        </label>
        <div class=dblock style="height:10px"></div>
        <label class=dblock id=e>
            结束时间: 
            <input type=number min=1970 max=9999 placeholder="..."> 年
            <input type=number min=1 max=12 placeholder="..."> 月
            <input type=number min=1 max=31 placeholder="..."> 日
            <input type=number min=0 max=23 placeholder="..." value="0"> 时
            <input type=number min=0 max=59 placeholder="..." value="0"> 分
            <input type=number min=0 max=59 placeholder="..." value="0"> 秒
            <button type=button class=now>现在</button>
        </label>
    </div>
    
    <p>
        <button type="submit">确定</button>&nbsp;
        <button type="reset">重置</button>&nbsp;
        <button type="button" onclick="history.back()">返回</button>
    </p>
</form>

<p style="color:gray;font-size:10px" <?php if($type!='new')echo'hidden'; ?>>
    <b>*</b><span>&nbsp;</span>
    <span>提示: 使用</span>
    <button id=openNetRequestSendToolButton hidden>网络请求发送工具</button>
    <button id=openRCTButton>记录创建测试工具</button>
    <span>以创建大量记录。</span>
</p>

<div id=NetRequestSendToolElement hidden>
    <div>网络请求发送工具<button onclick="closeNetRequestSendTool()">x</button></div><hr>
    <form id="NetRequestSendToolForm">
        <label style="display:block">URL 1: <input id=NRST_url1></label>
        <label style="display:block">URL 2: <input id=NRST_url2></label>
        <label style="display:block">Method: <select id=NRST_meth disabled>
            <option value=get>GET</option>
            <option value=post>POST</option>
        </select></label>
        <label style="display:block">POST data:<br><textarea disabled></textarea></label>
        <label style="display:block">Count:
            <input type="number" min=1 value=1 id=NRST_cnt>
        </label>
        <hr>
        <button type="submit" id=NRST_send>Send</button>
        <button type="reset">Reset</button>
        <button type="button" onclick="closeNetRequestSendTool()">Cancel</button>
    </form>
</div>

<div id=RCTElement hidden>
    <div>记录创建测试工具<button onclick="closeRCT()">x</button></div><hr>
    <form id="RCTForm">
        <label class="dblock">Begin:
            <input type="number" min=0 max=9223372036854775807 id=RCT_time>
        </label>
        <label class="dblock">Count:
            <input type="number" min=1 max=9999 value=1 id=RCT_cnt>
        </label>
        <hr>
        <button type="submit" id=RCT_send>Send</button>
        <button type="reset">Reset</button>
        <button type="button" onclick="closeRCT()">Cancel</button>
    </form>
</div>

<script>
    function F() {
        for (let i of a.querySelectorAll('button,input')) i.disabled = true;

        let dat1 = new Date(), dat2 = new Date();
        let fns = ['setFullYear','setMonth','setDate','setHours','setMinutes','setSeconds'];
        let beg = b.querySelectorAll('input');
        let end = e.querySelectorAll('input');
        let dat2_not_valid = false;

        for (let i = 0; i < beg.length; ++i) {
            try {
                dat1[fns[i]]((fns[i] == 'setMonth') ? 
                    parseInt(beg[i].value - 1) : parseInt(beg[i].value));
            }
            catch (err) { console.warn('Error processing data: ', err) }
        }
        for (let i = 0; i < end.length; ++i) {
            try {
                if (this.value == '') {
                    dat2_not_valid = true;
                    break;
                }
                dat2[fns[i]]((fns[i] == 'setMonth') ? 
                    parseInt(end[i].value - 1) : parseInt(end[i].value));
            }
            catch (err) { console.warn('Error processing data: ', err) }
        }

        //console.dir(dat1);
        //console.dir(dat2);

        fetch('../newrec.php?type=b&time=' + Math.floor(dat1.getTime() / 1000))
            .then(() => {
                function redirect() {
                    parent.location.hash = '#window:fn/records.php';
                }
                if (!dat2_not_valid) {
                    fetch('../newrec.php?type=e&time=' + Math.floor(dat2.getTime() / 1000))
                        .then(redirect, redirect);
                } else {
                    redirect();
                }
            }, () => location.reload());
    }
    a.onsubmit = function () {
        this.querySelector('button[type="submit"]')/*?*/.disabled = true;
        setTimeout(F, 1);
        return false;
    }
    for (let i of a.querySelectorAll('button.now')) {
        i.onclick = function () {
            let date = new Date();
            let 
                y = date.getFullYear(),
                M = (date.getMonth() + 1),
                d = date.getDate(),
                h = date.getHours(),
                m = date.getMinutes(),
                s = date.getSeconds();
            
            let inps = this.parentElement.querySelectorAll('input');
            //?.
            inps[0].value = y;
            inps[1].value = M;
            inps[2].value = d;
            inps[3].value = h;
            inps[4].value = m;
            inps[5].value = s;
        }
    }

    window.openNetRequestSendTool = function () {
        NetRequestSendToolElement.hidden = false;
        openNetRequestSendTool.el = new ModalElement();
        with (openNetRequestSendTool) {
            el.element.append(NetRequestSendToolElement);
            el.root.hidden = false;
        }
    }
    window.closeNetRequestSendTool = function () {
        document.body.append(NetRequestSendToolElement);
        NetRequestSendToolElement.hidden = true;
        openNetRequestSendTool.el.root.remove();
        delete openNetRequestSendTool.el;
        openNetRequestSendToolButton.disabled = false;
    }
    openNetRequestSendToolButton.onclick = function () {
        this.disabled = true;
        openNetRequestSendTool();
    }
    {
        let loc = location.origin + location.pathname;
        loc = loc.substring(0, loc.lastIndexOf('/'));
        loc = loc.substring(0, loc.lastIndexOf('/'));
        // console.log(loc);
        NRST_url1.value = loc + '/newrec.php?type=b&time=';
        NRST_url2.value = loc + '/newrec.php?type=e&time=';
    }
    NetRequestSendToolForm.onsubmit = function (ev) {
        ev.preventDefault();
        NRST_send.disabled = true;
        let val = NRST_cnt.value - 1;

        for (let __ = 0; __ < val; ++__) {
            fetch(NRST_url1.value);
            fetch(NRST_url2.value);
        }

        fetch(NRST_url1.value).then(()=>{
            fetch(NRST_url2.value).then(()=>{
                location.reload();
            })
        });
    }

    window.openRCT = function () {
        RCTElement.hidden = false;
        openRCT.el = new ModalElement();
        with (openRCT) {
            el.element.append(RCTElement);
            el.root.hidden = false;
        }
    }
    window.closeRCT = function () {
        document.body.append(RCTElement);
        RCTElement.hidden = true;
        openRCT.el.root.remove();
        delete openRCT.el;
        openRCTButton.disabled = false;
    }
    openRCTButton.onclick = function () {
        this.disabled = true;
        openRCT();
    }
    RCT_time.value = Math.floor(new Date().getTime() / 1000);
    RCTForm.onsubmit = function (ev, par=null, noreload=false) {
        if (ev) ev.preventDefault();
        RCT_send.disabled = true;
        let val = RCT_cnt.value - 1;

        if (val > 500 && par == null) {
            let cnt = Math.floor(val / 500);
            let o = null;
            for (let i = 0; i < cnt; ++i) {
                function F(r) {
                    o = new Promise(function (r) {
                        RCTForm.onsubmit(null, 500, true);
                        setTimeout(r, 5000);
                    });
                    if (r) r(o);
                    return o;
                }
                if (o == null) {
                    F();
                } else {
                    o.then(F);
                }
            }
            if (o) o.then(function () {
                cnt = val % 500;
                RCTForm.onsubmit(null, cnt);
            });
            return 0;
        }
        else if (par != null) {
            val = 500;
        }

        let loc = location.origin + location.pathname;
        loc = loc.substring(0, loc.lastIndexOf('/'));
        loc = loc.substring(0, loc.lastIndexOf('/'));
        // console.log(loc);
        let obj = {};
        let time = parseInt(RCT_time.value);
        Object.defineProperty(obj, 'url1', {
            get() {
                return loc + '/newrec.php?type=b&time=' + (time++);
            },
            enumerable: true,
            configurable: true
        })
        Object.defineProperty(obj, 'url2', {
            get() {
                return loc + '/newrec.php?type=e&time=' + (time++);
            },
            enumerable: true,
            configurable: true
        })

        for (let __ = 0; __ < val; ++__) {
            fetch(obj.url1);fetch(obj.url2);
        }

        fetch(obj.url1);
        fetch(obj.url2).then(()=>{
            if (!noreload) RCT_send.disabled = false;
            // if (!noreload) location.reload();
        })
    }
</script>

</body>

</html>
