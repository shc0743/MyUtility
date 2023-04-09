(function () {

    const nextCtl = btnCtl.bind(next);
    const LineBreaks = { r: '\r', n: '\n', rn: '\r\n' };

    let step = 1;
    let worker = null;
    let result = null;

    function prevent(ev) { ev.preventDefault(); ev.returnValue = false; return false }

    mainForm.addEventListener('submit', function (ev) {
        ev.preventDefault();

        switch (step) {
            case -1:
                location.reload();
                break;

            case 1:
                if (filePicker.files.length < 1) break;
                step1.hidden = true, step2.hidden = false;
                step = 2;
                nextCtl(0);
                break;
            
            case 2:
                step2.hidden = true, step3.hidden = false;
                step = 3;
                break;
            
            case 3:
                step3.hidden = true, step4.hidden = false;
                step = 3.5;
                nextCtl(0);
                btnCtl.call(reset, 0);
                setTimeout(execConvert, 1000);
                break;
            
            case 5:
                nextCtl(0);
                setTimeout(function () {
                    for (const i of result) {
                        const div = document.createElement('div');
                        const fn = i[0] + '.py';
                        const downloadLink = document.createElement('a');
                        downloadLink.href = i[1];
                        downloadLink.download = fn;
                        downloadLink.append(fn);
                        const clos = document.createElement('a');
                        clos.href = 'javascript:';
                        clos.className = 'close-button';
                        clos.onclick = function () {
                            URL.revokeObjectURL(downloadLink.href);
                            clos.remove();
                            downloadLink.replaceWith(document.createTextNode(downloadLink.innerText));
                        };
                        clos.append('x');
                        div.append(downloadLink, clos);
                        result_cont.append(div);
                    }
                });
                setTimeout(function () {
                    step4.hidden = true, step5.hidden = false;
                    step = -1;
                    next.innerText = 'Re-convert';
                    nextCtl(1);
                }, 500);
                break;
        
            default:
                break;
        }
    });
    filePicker.onchange = function () {
        if (filePicker.files.length < 1) nextCtl(0); else nextCtl(1);
        cvt_cnt.innerText = filePicker.files.length;
    };
    startWorker.onclick = function () {
        btnCtl.call(this, 0);

        try {
            worker = new Worker('./work.js', { type: 'module' });
            worker.postMessage({ type: 'test' });
            this.innerText = 'Worker started successfully';
            nextCtl(1);
        } catch (error) {
            console.error('Unable to Start Worker:', error);
            this.innerText = String(error) + '\n' + (error instanceof Error ? error.stack : '');
            btnCtl.call(this, 1);
        }
    };
    downloadAll.onclick = function () {
        for (const i of result_cont.querySelectorAll('a[href][download]')) {
            i.click();
        }
    };
    saveAll.onclick = async function () {
        const oldText = this.innerText;
        btnCtl.call(this, 0);
        let handle = null;
        try { handle = await window.showDirectoryPicker({ mode: 'readwrite' }) }
        catch (error) { 
            if (error instanceof DOMException) {
                this.innerText = 'Error: Cancelled';
                setTimeout(() => (btnCtl.call(this, 1), this.innerText = oldText), 1000);
            } else {
                this.innerText = 'Error: this API may be not supported.\n' + error;
            }
            return;
        }
        this.innerText = 'Saving changes...';
        window.addEventListener('beforeunload', prevent);

        function waitResponse() {
            const q = v => saveFile_conflict.querySelector(`[data-action="${v}"]`);
            return new Promise(fn => {
                saveFile_progress.showModal();
                saveFile_conflict.onclick = ev => ev.target.tagName.toLowerCase() === 'button' && (saveFile_conflict.hidden = true, saveFile_progress.close());
                q('y').onclick = () => fn({ v: true, a: false });
                q('ya').onclick = () => fn({ v: true, a: true });
                q('ar').onclick = () => fn({ r: true, a: true });
                q('n').onclick = () => fn({ v: false, a: false });
                q('na').onclick = () => fn({ v: false, a: true });
                q('mr').onclick = () => fn({ r: true, a: false });
                saveFile_conflict.hidden = false;
            });
        }
        
        let conflict_default = null;
        try {
            for (const i of result) {
                let name_p = i[0], nosuf = false;
                while (true) {
                    const fn = name_p + (nosuf ? '' : '.py');
                    saveFile_current.innerText = fn;
                    this.innerText = 'Saving: ' + fn;
                    const file = await handle.getFileHandle(fn, { create: true });
                    const got = await file.getFile();
                    // console.log(file);
                    if (got.size !== 0) {
                        // file exists
                        const user = (typeof conflict_default === 'boolean') ? { v: conflict_default, a: false } : await waitResponse();
                        if (user.r) {
                            if (user.a) {
                                name_p += '(1)';
                                continue;
                            } else {
                                const user = prompt('Input new name:', fn);
                                if (user) { nosuf = true; name_p = user; continue; }
                            }
                            continue;
                        }
                        if (user.a) conflict_default = user.v;
                        if (!user.v) break;
                    }
                    const writable = await file.createWritable();
                    try {
                        const content = await (await fetch(i[1])).blob();
                        await writable.write(content);
                        await writable.close();
                    } catch { break }

                    break;
                }
            }
        } catch (error) {
            console.error(error);
            this.innerText = 'Error:' + error + '\n' + error.stack;
            setTimeout(() => (btnCtl.call(this, 1), this.innerText = oldText), 1000);
            // saveFile_progress.close();
            window.removeEventListener('beforeunload', prevent);
            return;
        }
        

        // saveFile_progress.close();
        this.innerText = oldText;
        window.removeEventListener('beforeunload', prevent);
        btnCtl.call(this, 1);
    };

    function execConvert() {
        const session = (new Date().getTime());
        function prog(ev) {
            if (!ev.data) return;
            if (ev.data.session !== session) return;
            switch (ev.data.type) {
                case 'progress': {
                    const cur_cur = ev.data.current?.[0], cur_total = ev.data.current?.[1];
                    const tot_cur = ev.data.total?.[0], tot_total = ev.data.total?.[1];
                    if (cur_cur && cur_total) {
                        prog_Pc.min = 0, prog_Pc.max = cur_total, prog_Pc.value = cur_cur;
                        prog_Tc.innerText = `${cur_cur} / ${cur_total}`;
                    }
                    if (tot_cur && tot_total) {
                        prog_Pt.min = 0, prog_Pt.max = tot_total, prog_Pt.value = tot_cur;
                        prog_Tt.innerText = `${tot_cur} / ${tot_total}`;
                    }
                }
                    break;
                
                case 'taskDone': {
                    worker.removeEventListener('message', prog);
                    window.removeEventListener('beforeunload', prevent);
                    step = 5;
                    result = ev.data.result;
                    nextCtl(1);
                }
                    break;
            
                default:;
            }
        }
        worker.addEventListener('message', prog);
        worker.postMessage({
            type: 'convert',
            session,
            files: filePicker.files,
            LineBreak_input: LineBreaks[LB_i.value],
            LineBreak_output: LineBreaks[LB_o.value],
        });
        window.addEventListener('beforeunload', prevent);
    }




    function btnCtl(val) {
        this.disabled = !val, this.classList[val ? 'remove' : 'add']('is-disabled');
    }


})();


