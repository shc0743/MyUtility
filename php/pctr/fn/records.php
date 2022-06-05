<?php
require_once('../verify.php');
if (!GetUserLogonInfo()) {
    header('Location: ../');
    die();
}
?>

<!DOCTYPE html>
<html lang="zh-cn">

<head>
    <meta charset="utf-8" />
    <title>pctr</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" href="../generic.css" />
    <style>
        body {
            font-size: larger;
        }
        #container {
            text-align: center;
        }
        #container *.alignLeft {
            text-align: left;
        }
        /* #container table {
            display: block;
        }
        #container table tr {
            display: flex;
            width: 100%;
        }
        #container table tr th:nth-child(1) {
            flex: 1;
        }
        #container table tr th:nth-child(2) {
            width: 49%;
        }
        #container table tr th:nth-child(3) {
            width: 2%;
        }
        #container table, #container table tr th, #container table tr td {
            border: 1px solid #ccc;
        } */
        #container .table {
            display: block;
        }
        #container .table, #container .table .th, #container .table .td {
            border: 1px solid #ccc;
        }
        #container .table * {
            border-collapse: collapse;
        }
        #container .table .th, #container .table .td {
            display: inline-block;
        }
        #container .table .tr {
            display: flex;
        }
        #container .table .tr .th, #container .table .tr .td {
            flex: 1;
        }
        #container .table .tr .th {
            font-weight: bold;
        }
        #container a {
            color: blue;
            cursor: pointer;
            text-decoration: underline;
        }
        #container a:hover {
            color: #FF3333;
        }
        #container .item {
            margin-top: 20px;
        }
        .btn_right_close_2 {
            position: absolute;
            right: 10px;
        }
    </style>
</head>

<body>

    <h1 style="text-align:center">记录</h1>

    <div>
        <div>
            <button><input type=checkbox id=selectallbtn>全选</button>
            <span>&nbsp;</span>
            <button id="addrec">增加记录</button>
            <span>&nbsp;</span>
            <button id="sort_datas">对记录排序</button>
            <span>&nbsp;</span>
            <button id="open_statistics_info">统计信息</button>
            <span>&nbsp;</span>
            <button id="delete_selected_rec">删除选中的记录</button>
            <span>&nbsp;</span>
            <button id="scroll_to_bottom" title="Scroll down">v</button>
        </div>
        
        <div style="height: 10px;"></div>

        <fieldset>
            <legend>按<select id=queryorselect>
                <option value="string">字符串</option>
                <option value="date">日期</option>
            </select>查找</legend>

            <div data-type="string">
                <input style="width:100%" placeholder="请输入内容" id=queryorselect_s>
            </div>

            <div data-type="date" hidden>
                开始时间 <input type=date id=queryorselect_dS> <br>
                结束时间 <input type=date id=queryorselect_dE> <br>
                
                <button style="font-size:larger" id=queryorselect_dQ>筛选</button>
            </div>

        </fieldset>
    </div>

    <div id=container>
        <div id=items_loading style="color:gray;font-size:smaller">正在加载...</div>
    </div>

    <div>
        <button id=scroll_to_top style="
        position: fixed;
        right: 10px;
        bottom: 10px;
        z-index: 3;
        " onclick="">^</button>
    </div>

    <script src="../ModalElement.js"></script>
    <script src="records.js.php"></script>

</body>

</html>
