


globalThis.addEventListener('message', function (ev) {
    if (!ev.data) return;
    switch (ev.data.type) {
        case 'test':
            break;
        
        case 'convert':
            globalThis.setTimeout(convert, 500, ev.data.session, ev.data.files, ev.data);
            break;
    
        default:;
    }
});


function delay(time = 10) { return new Promise(resolve => setTimeout(resolve, time)) }



function filterMval(val) {
    val = val.slice(2).join(' ');
    return (/^[0-9][\s\S]*(L|f)$/i.test(val)) ? val.substring(0, val.length - 1) : (
        (!val) ? 'None' : (
            val
        )
    )
}
async function convert(session, files, raw) {
    const result = [];
    const LineBreak_input = raw.LineBreak_input || '\n',
        LineBreak_output = raw.LineBreak_output || '\n';
    for (let I = 0, l = files.length; I < l; ++I) {
        const i = files[I];
        globalThis.postMessage({
            type: 'progress',
            session,
            // current: [],
            total: [I, l],
        });
        await delay();
        const text = await i.text(); // convert to text first
        const arr = text.split(LineBreak_input); // split
        globalThis.postMessage({
            type: 'progress',
            session,
            current: [0, arr.length + 1],
        });
        await delay();
        const resultArr = [];
        for (let J = 0, L = arr.length; J < L; ++J) {
            const j = arr[J];
            const line = j.trim();
            if (line.startsWith('#define')) {
                const el = line.split(' ').filter(e => !!e);
                const python_define = `${el[1]} = ${filterMval(el)}${LineBreak_output}`;
                resultArr.push(python_define);
            }
            else if (line.startsWith('#include')) {
                const el = line.split(' ').filter(e => !!e);
                let name = el[1];
                if (!name) {
                    if (el[0].length !== 8) name = el[0].substring(8);
                }
                if (name) {
                    name = name.substring(1, name.length - 1);
                    const python_define = `from ${name} import *${LineBreak_output}`;
                    resultArr.push(python_define);
                }
            }

            if (L < 100 || (L < 2000 && J % 8 === 0) || J % 32 === 0) (globalThis.postMessage({
                type: 'progress',
                session,
                current: [J + 1, L + 1],
            }), await delay());
        }
        const blob = new Blob(resultArr, { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        result.push([i.name, url]);
    }
    globalThis.postMessage({
        type: 'progress',
        session,
        current: [1, 1],
        total: [files.length, files.length],
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    globalThis.postMessage({
        type: 'taskDone', session,
        result
    });
}




