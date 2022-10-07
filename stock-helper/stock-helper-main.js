(function (window) {
    var scode = 0;

    stock_code.oninput = function () {
        stock_code_input_wrapper.querySelector('button').disabled = false;
    }
    stock_code_input_wrapper.addEventListener('submit', function (ev) {
        ev.preventDefault();

        try {
            var n = Number(stock_code.value);
        }
        catch (ERROR_ERROR) {
            stock_code.classList.add('invalid');
        }

        let code = String(n);
        while (code.length < 6) {
            code = '0' + code;
        }
        stock_code.value = code;
        scode = code;

        load_error_message.innerHTML = '';
        stock_code_input_wrapper.querySelector('button').disabled = true;

        // fetch(`https://d.10jqka.com.cn/v2/realhead/hs_${code}/last.js`, {
        //     "headers": {
        //         "sec-fetch-dest": "script"
        //     },
        //     "method": "GET",
        //     "credentials": "same-origin"
        // })
        //     .then(v => { return v.text() })
        //     .then(function (v) {
        //         load_error_message.innerHTML = '';
        //         stock_code_input_wrapper.querySelector('button').disabled = true;
        //         let str = `
        //             let quotebridge_v2_realhead_hs_${code}_last = function (v) {
        //                 load_base_data(v);
        //             };
        //
        //             `;
        //         str += v;
        //         eval(str);
        //     })
        //     .catch(function (error) {
        //         console.error(error);
        //         load_error_message.innerHTML = error;
        //     })

        LoadAllFrames(code)
        .then(function () {
            load_error_message.innerHTML = '';
        })
        .catch(function (error) {
            console.error(error);
            load_error_message.innerHTML = String(error);
            stock_code_input_wrapper.querySelector('button').disabled = false;
        })


    });
    view_in_10jqka.onclick = function () {
        window.open(`http://stockpage.10jqka.com.cn/${stock_code.value}/`);
    };
    expand_all.onclick = function () {
        document.querySelectorAll('.wrapper > * > div.info.output details')
            .forEach(el => el.open = true);
    };
    collapse_all.onclick = function () {
        document.querySelectorAll('.wrapper > * > div.info.output details')
            .forEach(el => el.open = false);
    };
    install_extension.onclick = function (ev) {
        this.disabled = !!(this.innerHTML = '正在安装...');
        InstallExtension()
        .catch(function (err) {
            ev.target.disabled = !(ev.target.innerText = '安装失败: ' + err);
        });
    }


    async function LoadAllFrames(k) {
        if (!k) throw new TypeError('Invalid paramter');

        
        document.querySelectorAll('.wrapper main .iframe-container iframe').forEach(new(Function)('arguments[0].remove()'));
        

        LoadFrameEx(`https://stockpage.10jqka.com.cn/realHead_v2.html?` +
            `cb05a5d7c5d942be9150fec1084b01ca=enabled&mpost=time&delay=10000#hs_${k}`, {
            onload: frameload_load, onerror: frameload_error
        }, null, {
            callback_custom_paramter: document.querySelector('.wrapper .info.output [data-mytext="base_info"]')
        });

        document.querySelector('.wrapper [data-mytext="finance"] iframe').src =
            `http://basic.10jqka.com.cn/${k}/finance.html?cb05a5d7c5d942be9150fec1084b01ca=enabled#stockpage`;
        
            
        window.addEventListener('message', frameload_message);
        


    }

    function frameload_load(ev, el) {
        el.querySelector('.error-message').innerText = '';
        
    }
    function frameload_error(ev, el) {
        el.querySelector('.error-message').innerText = 'An error occurred.';
        ev.target.remove();
    }

    function frameload_message(ev) {
        // console.log(ev);

        if (/stockpage.10jqka.com.cn/i.test(ev.origin)) {
            let data = ev.data;

            if (data.n === 1)
            return (function () {

                if (data.type === 'error' && data.error.code !== 200) {

                    return;
                }

                let str = `
                let quotebridge_v2_realhead_${data.stock}_last = function (v) {
                    load_base_data(v);
                };
    
                `;
                str += (data.data) ? data.data.text : (data.error ? data.error.text : 'throw "Data not found"');
                try {
                    eval(str);
                }
                catch (error) {

                }


            })();
            
            
            return 87;
        }



    }

    function load_base_data(data) {
        // console.log('Base data:', data);

        d = data.items;

        let obj = {
            '股票名称': d.name,
            '股票代码': d[5],
            '查询时间': d.time,
            '上次更新时间': d.updateTime,
            '状态': d.stockStatus,
            '股价': d[10],
            '涨停': d[69],
            '跌停': d[70],
            '今开': d[7],
            '最高': d[8],
            '最低': d[9],
            '昨收': d[6],
            '成交量': d[13],
            '成交额': d[19],
            '总市值': (function () {
                if (d[3541450]) {
                    var tvalue = parseInt(d[3541450])// / 100000000;
                    return ((tvalue));
                } else {
                    return ('--')
                }
            })(),
            '流通市值': (function () {
                if (d[3475914]) {
                    var flowvalue = parseInt(d[3475914])// / 100000000;
                    return (flowvalue);
                } else {
                    return ('--')
                }
            })(),
            '市盈率': d[2034120],
            '市净率': d[592920],
        };

        updateTableItem(stock_info_base, obj);
    }


    let _load_frame_default_parent = document.querySelector('.wrapper main .iframe-container');

    let _load_frame_default_options = {
        defaultParent: _load_frame_default_parent,
        frame_flag: {},
    }

    function LoadFrameEx(url,
        callback = { onload: null, onerror: null },
        parent = null,
        options = _load_frame_default_options
    ) {
        let ifr = document.createElement('iframe');
        ifr.src = url;
        // ifr.sandbox = 'allow-scripts';

        for (let i in (options.frame_flag || {})) {
            ifr[i] = (options.frame_flag)[i];
        }

        if (options.callback_custom_paramter) {
            ifr.onload = function (ev) { callback.onload(ev, options.callback_custom_paramter) };
            ifr.onerror = function (ev) { callback.onload(ev, options.callback_custom_paramter) };
        } else {
            ifr.onload = callback.onload;
            ifr.onerror = callback.onerror;
        }

        if (options.custom_data) ifr.custom_data = options.custom_data;

        (parent || options.defaultParent || _load_frame_default_parent || document.documentElement).append(ifr);

        return ifr;
    }

    var config = {

    };

    function updateTableItem(elem, obj) {
        elem.innerHTML = '';
        for (let i in obj) {
            let tr = document.createElement('tr'),
                td1 = document.createElement('td'),
                td2 = document.createElement('td');
            td1.append(document.createTextNode(i));
            td2.append(document.createTextNode(obj[i]));
            tr.append(td1);
            tr.append(td2);
            elem.append(tr);
        }
    }

})(window);

(function (window) {
    (function addPolyfill_StrReplaceAll() {
        if (!String.prototype.replaceAll)
            String.prototype.replaceAll = function (a, b) {
                return this.replace(new (RegExp)(a, 'gm'), b);
            }
    })();

    function getExtensionPath() {
        return fetch('extension.path');
    }

    async function InstallExtension(config) {
        try {
            if (typeof config !== 'object') config = {};

            if (config.element) config.element.setAttribute('disabled', true);

            let path = config.path || await (await getExtensionPath()).text();
            let content = await (await fetch(path)).text();

            content = content.replaceAll('[Placeholder: server]', location.host)
                .replaceAll('[Placeholder: app_path]', location.pathname)
                .replaceAll('[Placeholder: app_href]', location.href)
                ;

            let blob = new Blob([content], { type: 'text/javascript' });
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = location.host + '.user.js';
            a.style.display = 'none';
            document.documentElement.append(a);
            a.click();
            a.remove();
            // let a = document.createElement('form');
            // let b = document.createElement('textarea');
            // b.name = 'data';
            // b.value = content;
            // a.append(b);
            // a.style.display = 'none';
            // a.method = 'post';
            // a.action = 'user.js/';
            // document.documentElement.append(a);
            // a.submit();
            // a.remove();

            if (config.reload)
                setTimeout(() => location.reload(), 1);
            
            if (config.element) config.element.removeAttribute('disabled');

        }
        catch (any_error) {
            if (config.element) config.element.removeAttribute('disabled');
            throw any_error;
        }
    };

    window.InstallExtension = InstallExtension;
}(window.self));