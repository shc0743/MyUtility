<?php
require_once('verify.php');
if (GetUserLogonInfo()) {
    header('Location: ui.php');
    die();
}

$wrong_pwd = (
    !empty($_POST["password"]) &&
    !LogonUser($_POST["password"], !empty($_POST["remember"]))
);

if (!empty($_POST["password"]) && !$wrong_pwd) {
    header('Location: ui.php');
    die();
}


?>

<!DOCTYPE html>
<html lang="zh-cn">

<head>
    <meta charset="utf-8" />
    <title>登录</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        a, button {
            cursor: pointer;
        }

        *[disabled] {
            cursor: not-allowed !important;
        }

        a {
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        a[href] {
            color: blue;
        }

        .btn.recommended {
            background: rgba(12, 218, 173, 0.3);
        }

        form label {
            cursor: pointer;
        }

        .mydialog {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 10;
            background: white;
            border: 1px solid #cccccc;
            padding: 5px 5px;
        }

        .mydialog dialog-title {
            font-weight: bold;
            padding: 10px 10px;
            background: #e9e9e9;
            border: 1px solid #dddddd;
            display: block;
            cursor: default;
            user-select: none;
            -webkit-user-select: none;
        }

        .mydialog dialog-title .btn {
            cursor: pointer;
        }

        .mydialog dialog-title .btn.close {
            font-family: 'Consolas', serif, sans-serif;
            position: absolute;
            right: 0;
            transform: translate(-100%, 0);
        }

        #pwd_form {
            border: 1px solid gray;
            padding: 10px 10px;
        }

        #show_pswd {
            user-select: none;
            -webkit-user-select: none;
        }

        .PASSWORD_ERROR_PROMPT {
            margin-top: 8px;
            padding: 4px 4px;
            background: rgba(220, 32, 32, 0.9);
            color: #ffffff;
        }

        #pwd_form div[data-input] {
            display: flex;
        }

        #pwd_form div[data-input] input {
            flex: 1;
        }

        #pwd_form div[data-btns] {
            display: flex;
            text-align: center;
        }

        #pwd_form div[data-btns] button {
            font-size: larger;
        }

        #pwd_form div[data-btns] button:nth-child(1) {
            flex: 1;
        }

        #pwd_form div[data-btns] button:nth-child(2) {
            margin-left: 5px;
            margin-right: 5px;
        }

        #pwd_form label[data-dbk] {
            display: block;
        }
    </style>
</head>

<body>

    <main>
        <div id="main_div_dialog" class="mydialog" hidden>
            <dialog-title>登录
                <button class="btn close" title="Close" disabled>x</button>
            </dialog-title>

            <h1>登录</h1>

            <form id="pwd_form" action="" method="post">
                <div data-input>
                    <span>API Key:&nbsp;&nbsp;</span>
                    <input type="password" name="password" id="pwd" required autofocus />
                    <span>&nbsp;</span>
                    <label>
                        <button type="button" id="show_pswd">显示密码</button>
                    </label>
                </div>

                <label data-dbk><input type="checkbox" name="remember">360天内记住我</label>

                <?php
                if ($wrong_pwd) {
                    echo '<div class="PASSWORD_ERROR_PROMPT">' .
                        'API Key 错误。请<a ' .
                        'href="javascript:void pwd.focus()" ' .
                        'style="color: white;">重试</a>。' .
                        '</div>';
                }
                ?>

                <br />

                <div data-btns>
                    <button type="submit" flex="1" class="btn recommended">确定</button>
                    <button type="reset" flex="1" class="btn" disabled>取消</button>
                    <button type="button" flex="1" id="btn_close" disabled>关闭</button>
                </div>

            </form>

        </div>
    </main>

    <script>
        (function() {
            var mdd = document.querySelector('#main_div_dialog');
            mdd.hidden = false;
            var mdd_resize = function() {
                mdd.style.left =
                    document.documentElement.clientWidth / 2 -
                    (mdd.clientWidth / 2) + 'px';
                mdd.style.top =
                    document.documentElement.clientHeight / 2 -
                    (mdd.clientHeight / 2) + 'px';
            }
            window.addEventListener('resize', mdd_resize);
            window.addEventListener('load', mdd_resize);
            mdd_resize();

            mdd.querySelector('dialog-title button.close').onclick =
                btn_close.onclick = function() {
                    mdd.remove();
                    var w = window.open('', '_self');
                    w.document.open();
                    w.document.write("It is safe to close this page now.");
                    w.document.close();
                    w.opener = window.opener = null;
                    window.close();
                    w.close();
                }

            show_pswd.onmousedown = show_pswd.onkeypress =
                show_pswd.ontouchstart = function() {
                    pwd.type = "text";
                };
            show_pswd.onmouseup = function() {
                pwd.type = "password";
                pwd.focus();
            };
            show_pswd.onkeyup = show_pswd.ontouchend = function() {
                pwd.type = "password";
            };
            show_pswd.oncontextmenu = function() {
                return false
            };
        })()
    </script>
</body>

</html>
