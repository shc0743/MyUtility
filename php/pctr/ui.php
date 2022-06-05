<?php
require_once('verify.php');
if (!GetUserLogonInfo()) {
    header('Location: logon.php');
    die();
}
?>

<!DOCTYPE html>
<html lang="zh-cn">

<head>
    <meta charset="utf-8" />
    <title>pctr</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" href="generic.css" />
    <link rel="stylesheet" type="text/css" href="ui.css.php" />
</head>

<body>

    <main>
        <button id=logout>退出</button>

        <div id=main_record>
            <button id=main_button disabled>Button</button>
        </div>

        <div id=fns>
            <div id=fns_entry role="button" aria-label="..." tabindex="0"><span>...</span></div>
            <div id=fns_main hidden>
                正在加载...
            </div>
        </div>
    </main>

    <script>
        (function() {
            logout.onclick = function() {
                location = 'logout.php';
            }

            fns_entry.onmouseover = function() {
                fns_main.hidden = false;
            }
            fns_entry.onclick = function() {
                fns_main.hidden = !fns_main.hidden;
            }
            AddEnterIsClickHandler(fns_entry);

            let currentSubWindow = null;
            function myOnHashChange() {
                let str = location.hash;
                if (str.length < 8 || str.substring(0, 8) != '#window:') return;
                str = str.substring(8);

                if (currentSubWindow) currentSubWindow.remove();
                let el = document.createElement('div');
                el.innerHTML = `
                <div class="pop-full-page" style="background:#fff;z-index:7"></div>
                <div><button class="btn_right_close fullSubWindow" style="z-index`+
                `:9;font-size:24px;right:60px;" onclick="fullSubWindow()">`+
                `</button><button class="btn_right_close" style="z-index:9;`+
                `font-size:24px;" onclick="closeSubWindow()">x</button></div>
                <iframe src="placeholder.htm" border="0" frameborder="no"></iframe>
                `;
                el.classList.add('popup');
                el.classList.add('page-center');
                el.style.width = el.style.height = '100%';
                el.style.background = '#FFFFFF';
                el.style.zIndex = 8;
                currentSubWindow = el;
                document.body.append(el);

                let ifr = el.querySelector('iframe');
                if (!ifr) return;
                ifr.classList.add('pop-full-page');
                ifr.src = str;
                ifr.style.zIndex = 8;

                let fsw = el.querySelector('.fullSubWindow');
                if (fsw) fsw.onclick = function () {
                    let url = ifr.src;
                    try {
                        url = ifr.contentWindow.location.href;
                    }
                    catch (err) {}
                    window.open(url, '_blank');
                }
            }
            window.addEventListener('hashchange', myOnHashChange);
            ((async function () {myOnHashChange()})());
            function EnterIsClickHandler(event) {
                if (event.key == 'Enter') return this.click();
            }
            function AddEnterIsClickHandler(element) {
                element.addEventListener('keydown', EnterIsClickHandler);
            }
            let errh = e => {
                fns_main.innerText = `发生错误: ${e}\n请尝试重新加载页面`
            };
            fetch('operations_list.php')
            .then(v => {
                return (v.json())
            }, errh)
            .then(function(v) {
                if (v.code != 200) return errh(v.message);
                if (!v.operations) return errh("操作失败");
                let clickf = function() {
                    location = '#window:' + this.dataset.url;
                };
                fns_main.innerHTML = '';
                for (let i in v.operations) {
                    let el = document.createElement('div');
                    el.setAttribute('role', 'button');
                    el.tabIndex = 0;
                    el.ariaLabel = el.innerText = i;
                    el.dataset.url = v.operations[i];
                    el.classList.add('fns_item');
                    el.addEventListener('click', clickf);
                    AddEnterIsClickHandler(el);
                    fns_main.append(el);
                }
            }, errh);

            window.closeSubWindow = function () {
                if (currentSubWindow) {
                    location.hash = '';
                    currentSubWindow.remove();
                    currentSubWindow = null;
                }
            };


            let _btn_br = '';
            if (document.body.clientWidth < 400) _btn_br = '<br>';
            fetch('readrec.php?type=query&q=LastState')
            .then(d=>{return(d.text())},function(e){
                main_button.innerHTML = `无法读${_btn_br}取数据`;
            }).then(function (data) {
                if (data == 'begin') {
                    main_button.dataset.type = 'e';
                    main_button.disabled = false;
                    main_button.innerHTML = `结束${_btn_br}记录`;
                }
                else if (data == 'end') {
                    main_button.dataset.type = 'b';
                    main_button.disabled = false;
                    main_button.innerHTML = `开始${_btn_br}记录`;
                }
                else {
                    main_button.innerHTML = `数据${_btn_br}无效`;
                }
            });
            
            main_button.onclick = function () {
                this.disabled = true;
                function E(e) {
                    alert("出现错误: " + e);
                    main_button.disabled = false;
                }
                fetch('newrec.php?type=' + this.dataset.type)
                .then(v => {
                    if (v.status >= 400) E(v.status);
                    else { location.reload() } }
                , E);
            };

        })()
    </script>
</body>

</html>