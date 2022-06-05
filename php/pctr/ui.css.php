<?php
require_once('verify.php');
if (!GetUserLogonInfo()) {
    header('Location: logon.php');
    die();
}
header('Content-Type: text/css');
?>main, main * {
    font-size: 20px;
}

main button {
    padding: 10px 10px;
}

#logout {
    position: fixed;
    right: 10px;
    top: 10px;

}

#main_record {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
#main_button {
    font-size: 36px;
}

.popup.page_center {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.pop-full-area, .pop-full-page {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}
.pop-full-area {
    position: absolute;
}
.pop-full-page {
    position: fixed;
}

.btn_right_close {
    position: absolute;
    right: 10px;
    top: 10px;
}

#fns {
    position: fixed;
    right: 10px;
    bottom: 10px;
    background: white;
    user-select: none;
    z-index: 3;
}

#fns_main {
    border: 1px solid #bbb;
    position: fixed;
    right: 10px;
    bottom: 60px;
}
#fns_entry {
    position: relative;
    left: -10px;
    top: -10px;
    border: 1px solid #ccc;
    width: 30px;
    height: 30px;
    border-radius: 50%;
}
#fns_entry span {
    position: relative;
    left: 7px;
    top: -4px;
}
#fns_entry:hover {
    background-color: #F0F0F0;
}
.fns_item {
    margin: 3px 5px;
}
.fns_item:hover {
    background: #ddd;
}

.msg_container .success_msg {
    background: #00cc00;
}

.msg_container .error_msg {
    background: #cc0000;
}

@keyframes msg_text_move {
    0% {
        top: -100px;
    }

    5% {
        top: 0;
    }

    90% {
        top: 0;
    }

    100% {
        top: -100px;
    }
}

.msg_container .msg_text {
    position: fixed;
    top: -10000px;
    animation: msg_text_move 4s 1;
}

.fullSubWindow::after {
    content: "";
    display: inline-block;
    border: 1px solid #000;
    border-top: 3px solid #000;
    width: 20px;
    height: 10px;
}

