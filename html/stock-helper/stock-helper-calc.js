(function () {

    fetch('stock-helper-calc.json')
    .then(v => { return v.json() })
    .then(function (data) {
        let el = document.getElementById('stock_info_data_result');
        if (!data || !el) throw new Error("Invalid data");

        for (let i of data) {
            let tr = document.createElement('tr'),
                td1 = document.createElement('td'),
                td2 = document.createElement('td');
            
            td1.append(document.createTextNode(i.name));
            
            // tr.classList.add('');

            tr.append(td1);
            tr.append(td2);
            el.append(tr);
        }
    })
    .catch(function (err) {
        document.querySelector('[data-mytext="finance"] .error-message').innerText = err;
    })

}())