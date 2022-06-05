<?php
require_once('../verify.php');
if (!GetUserLogonInfo()) {
    header('Location: ../');
    die();
}
header("Content-Type: text/javascript");
?>
(function(){
    addrec.onclick = function () {
        parent.location.hash='#window:fn/newrecui.php';
    };
    
    queryorselect.onchange = function () {
        let root = this.parentElement.parentElement;
        let els = root.querySelectorAll('[data-type]');
        let el = root.querySelector(`[data-type="${this.value}"]`);

        if (!el) return;

        for (let i of els) {
            i.hidden = true;
        }
        el.hidden = false;
    };

    queryorselect_s.oninput = function () {
        let items = container.querySelectorAll('.item');
        let val = this.value;
        for (let i of items) {
            if (!val) {
                i.hidden = false;
                continue;
            }

            let el = i.querySelector('[data-title]') || {innerText:''};

            if (el.innerText.indexOf(val) != -1) {
                i.hidden = false;
            } else {
                i.hidden = true;
            }
        }

    };

    queryorselect_dQ.onclick = function () {
        this.innerHTML = '懒死了,这个都没做';
    }

    scroll_to_bottom.onclick = function () {
        return window.scroll({
            behavior: 'smooth',
            top: (document.body || document.documentElement).scrollHeight
        });
    }
    scroll_to_top.onclick = function () {
        return window.scroll({ behavior: 'smooth', top: 0 });
    }

    let ModifyData = function (d) {
        if (typeof d != 'number') return false;

        parent.location.hash = '#window:fn/newrecui.php?type=modify&time=' + d;
    }
    let DeleteData = function (d) {
        if (d == null) return false;

        if (!arguments[1]) {
            let $str2 = (d.length) ? d.length + '条' : '指定的';
            let a = new ModalConfirmBox(`确定删除${$str2}记录?`, '确定', '取消');
            a.confirm().then(function () {
                DeleteData(d, true);
            }, function () { });
            return a;
        }

        if (typeof (d) == 'number') {
            let callback = arguments[1];
            if (typeof (callback) != 'function') {
                callback = new Function();
            }
            fetch('../delrec.php?q=' + d)
            .then(v => {
                if (!v.ok) throw callback(false, v.status);
                return v.json()
            }, e => { callback(false, e) })
            .then(function (d) {
                callback(true, d);
            }, () => {});
        }
        if (d.length) {
            let cnt = 1;
            let prog1 = document.createElement('progress');
            prog1.max = d.length;
            prog1.value = 0;
            prog1.style.display = 'block';
            prog1.style.width = '100%';
            let progress = new ModalElement();
            progress.root.hidden = false;
            let div1 = document.createElement('div');
            div1.innerHTML = `删除 ${cnt} / ${d.length} 条记录<br>`;
            progress.element.append(div1);
            progress.element.append(prog1);
            if (d[0] && d[0].begin) {
                DeleteData(d[0].begin.getTime()/1000, function I (r) {
                    if (!r) {
                        progress.element.innerHTML = `
                        <div style="color:red">出现错误</div>
                        <button style="display:block" 
                        onclick="location.reload()">取消</button>`;
                        return;
                    }
                    prog1.value = cnt++;
                    div1.innerHTML = `删除 ${cnt} / ${d.length} 条记录`;
                    if (d[cnt - 1] && d[cnt - 1].begin)
                        DeleteData(d[cnt - 1].begin.getTime()/1000, I, true);
                    else {
                        progress.root.remove();
                        location.reload();
                    }
                }, true);
            }
        }
    }

    function EnterIsClickHandler(event) {
        if (event.key == 'Enter') return this.click();
    }
    function AddEnterIsClickHandler(element) {
        element.addEventListener('keydown', EnterIsClickHandler);
    }

    function DateFormatToYYYY_MM_DD(date) {
        return date.getFullYear() + '-' +
                (date.getMonth() + 1) + '-' +
                date.getDate();
    }
    function DateFormatToHMS(date) {
        if (!date) return null;
        return date.getHours() + ':' +
            ((date.getMinutes() < 10) ? '0' : '') +
            date.getMinutes() + ':' +
            ((date.getSeconds() < 10) ? '0' : '') +
            date.getSeconds();
    }
    let onfeacherror = function (e) {
        items_loading.style.color = 'red';
        items_loading.innerText = `抱歉,出错了...\n错误信息: ${e}`;
    };
    let myTimNumFormat时分秒 = function (time = 0) {
        let s = time % 60;
        let m = Math.floor(time / 60) % 60;
        let h = Math.floor(time / (60 ** 2));
        return h + '时' + m + '分' + s + '秒';
    }
    let myCalcTimesAmong = function (obj) {
        let sum_time = 0;
        for (let i of obj) {
            // i.begin, i.end
            let end = i.end || i.begin;
            sum_time += Math.round((end - i.begin) / 1000);
        }
        return myTimNumFormat时分秒(sum_time);
    };
    fetch("../readrec.php?time=all")
    .then(v=>{return(v.text())},onfeacherror)
    .then(function (d) {
        let arr = d.split('\n');
        let dates = {};
        
        let temp_object = null;
        for (let i of arr) {
            let d = new Date(parseInt(i.substring(1))*1000);
            let dstr = DateFormatToYYYY_MM_DD(d);
            if (i[0] == 'b') {
                if (!dates[dstr]) dates[dstr] = [];
                temp_object = { begin: d };
            }
            else if (i[0] == 'e') {
                if (!temp_object) temp_object = { begin: d };
                temp_object.end = d;
                let kn = DateFormatToYYYY_MM_DD(temp_object.begin);
                if (!dates[kn]) dates[kn] = [];
                dates[kn].push(temp_object);
                temp_object = null;
            }
        }

        if (temp_object) {
            dates[DateFormatToYYYY_MM_DD(temp_object.begin)].push(temp_object);
        }

        // console.dir(dates);

        for (let i in dates) {
            let el = document.createElement('div');
            el.classList.add('item');
            {
                let elC = document.createElement('div');
                elC.classList.add('alignLeft');
                let elD = document.createElement('div');
                {
                    let elI = document.createElement('input');
                    elI.type = 'checkbox';
                    elI.onchange = function () {
                        var chk = this.checked;
                        let s1 = 'input[type=checkbox]';
                        for (let i of elD.querySelectorAll(s1)) {
                            i.checked = chk;
                        }
                    };
                    elC.append(elI);
                    
                    elC.append(document.createTextNode(' '));

                    let elB = document.createElement('b');
                    elB.dataset.title = '';
                    elB.innerText = i;
                    elC.append(elB);

                    let elA = document.createElement('a');
                    /*elA.classList.add('btn_right_close_2');
                    elA.style.right = '60px';
                    elA.tabIndex = 0;
                    elA.innerText = '删除选中';
                    AddEnterIsClickHandler(elA);
                    elA.onclick = function () {
                        let checkboxes = this.parentElement.parentElement
                            .querySelectorAll('input[type=checkbox]');
                        let checkeds = [];
                        for (let i of checkboxes) {
                            if (i.checked) {
                                checkeds.push(i);
                            }
                        }
                        if (checkeds.length < 1) return;
                    
                        let data = [];
                        for (let i of checkeds) {
                            if (i._object) data.push(i._object);
                        }
                        return DeleteData(data);
                    }
                    elC.append(elA);
                    elA = document.createElement('a');*/
                    elA.classList.add('btn_right_close_2');
                    elA.tabIndex = 0;
                    elA.innerText = '删除';
                    elA._object = dates[i];
                    AddEnterIsClickHandler(elA);
                    elA.onclick = function () {
                        DeleteData(this._object);
                    }
                    elC.append(elA);
                }
                el.append(elC);

                elD.classList.add('table');
                {
                    // let tr0 = document.createElement('div');
                    // tr0.classList.add('tr');
                    // tr0.style.border = '1px solid #ccc';
                    // tr0.innerHTML = `今日总时间:&nbsp;<span>正在加载...</span>`;
                    // elD.append(tr0);

                    let tr1 = document.createElement('div');
                    tr1.classList.add('tr');
                    tr1.innerHTML = `<div class=th>开始时间</div>` +
                                    `<div class=th>结束时间</div>` + 
                                    `<div class=th>操作</div>`;
                    elD.append(tr1);
                    
                    for (let j of dates[i]) {
                        let tr = document.createElement('div');
                        tr.classList.add('tr');
                        {
                            let td0 = document.createElement('div');
                            let td1 = document.createElement('div');
                            let td2 = document.createElement('div');
                            td0.classList.add('td');
                            td1.classList.add('td');
                            td2.classList.add('td');

                            td0.innerText = DateFormatToHMS(j.begin);
                            if (j.end) {
                                td1.innerText = ((DateFormatToYYYY_MM_DD(j.end)
                                    != DateFormatToYYYY_MM_DD(j.begin)) ?
                                    DateFormatToYYYY_MM_DD(j.end) + ' ' : '') +
                                    DateFormatToHMS(j.end);
                            } else td1.innerText = '未结束';
                            {
                                let ic2 = document.createElement('input');
                                ic2.type = 'checkbox';
                                ic2._object = j;
                                td2.append(ic2);

                                td2.append(document.createTextNode(' '));

                                let a2 = document.createElement('a');
                                a2.innerHTML = '修改';
                                a2.tabIndex = 0;
                                a2._time = j.begin.getTime();
                                AddEnterIsClickHandler(a2);
                                a2.onclick = function () {
                                    ModifyData(Math.floor(this._time / 1000));
                                }
                                td2.append(a2);
                        
                                td2.append(document.createTextNode(' '));
                        
                                a2 = document.createElement('a');
                                a2.innerHTML = '删除';
                                a2.tabIndex = 0;
                                a2._time = j.begin.getTime();
                                AddEnterIsClickHandler(a2);
                                a2.onclick = function () {
                                    DeleteData([{ begin: new Date(this._time) }]);
                                }
                                td2.append(a2);
                            }
                            tr.append(td0);
                            tr.append(td1);
                            tr.append(td2);
                        }
                        elD.append(tr);
                    }

                    let t = myCalcTimesAmong(dates[i]);
                    let tr2 = document.createElement('div');
                    tr2.classList.add('tr');
                    tr2.style.border = '1px solid #ccc';
                    {
                        let tr2c1 = document.createElement('span');
                        tr2c1.innerHTML = `总计:&nbsp;<span>${t}</span>`;
                        tr2.append(tr2c1);
                    }
                    elD.append(tr2);
                }
                el.append(elD);
            }
            container.append(el);
        }

        items_loading.remove();
    }, onfeacherror);

    delete_selected_rec.onclick = function () {
        let checkeds = [];
        for (let j of container.querySelectorAll('.item .table')) {
            let checkboxes = j.querySelectorAll('input[type=checkbox]');
            for (let i of checkboxes) {
                if (i.checked) {
                    checkeds.push(i);
                }
            }
        }
        if (checkeds.length < 1) return;
        let data = [];
        for (let i of checkeds) {
            if (i._object) data.push(i._object);
        }
        return DeleteData(data);
    };

    selectallbtn.onchange = function () {
        let checked = this.checked;
        container.querySelectorAll('input[type=checkbox]').forEach(element => {
            element.checked = checked;
        });
    }
    selectallbtn.onclick = function (ev) {
        ev.stopPropagation();
    }
    selectallbtn.parentElement.onclick = () => selectallbtn.click();


})()
