(function () {
    var classn_modal = '__modal_element_background_d8506f21';
    var classn_ModalElementRoot = '__modal_element_root_573a092b';
    var classn_ModalElementChild = '__modal_element_child_9d5f94a7';

    let style1 = document.createElement('style');
    style1.innerHTML = `
    .${classn_modal} {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0.25;
        z-index: 80;
        background: black;
    }
    .${classn_ModalElementChild} {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 81;
        background: white;
        border: 1px solid #aaa;
        padding: 5px;
    }
    `;
    (document.head||document.body||document.documentElement).append(style1);

    window.ModalElement = function () {
        this.root = document.createElement('div');
        this.root.hidden = true;
        document.body.append(this.root);
        this.__elModal = document.createElement('div');
        this.__elModal.classList.add(classn_modal);
        this.root.append(this.__elModal);
        this.element = document.createElement('div');
        this.element.classList.add(classn_ModalElementChild);
        this.root.append(this.element);
    }

    window.ModalConfirmBox = function (text, yes = 'OK', no = 'Cancel') {
        this.__mdel = new ModalElement();
        this.__mdel.element.innerHTML = `
        <div class=content>${text}</div>
        <div style="border-top: 1px solid #ccc"></div>
        <div style="text-align:right;margin-top:5px">
            <button style="font-size:large" class=y>${yes}</button>
            <button style="font-size:large" class=n>${no}</button>
        </div>
        `;

        let obj = this;

        this.confirm = function () {
            return new Promise(function (resolve, reject) {
                obj.__mdel.element.querySelector('button.n').focus();
                // let __obj = obj.__mdel.element;
                // function H(ev) {
                //     if (ev.key == 'Enter') {
                //         __obj.removeEventListener('keydown', H);
                //         resolve();
                //     }
                //     if (ev.key == 'Escape') {
                //         __obj.removeEventListener('keydown', H);
                //         reject();
                //     }
                //     ev.preventDefault();
                //     ev.stopPropagation();
                // };
                obj.__mdel.root.hidden = false;
                obj.__mdel.element.querySelector('button.y').onclick =
                    function () {
                        obj.destroy();
                        // __obj.removeEventListener('keydown', H);
                        resolve();
                    };
                obj.__mdel.element.querySelector('button.n').onclick =
                    function () {
                        obj.destroy();
                        // __obj.removeEventListener('keydown', H);
                        reject();
                    };
                // __obj.addEventListener('keydown', H);
            });
        }
        this.destroy = function () {
            this.__mdel.root.remove();
        }
    }

}())

