class ZIndexManagerClass {
    #elements = [];
    #zIndexBase = 1;
    #zIndexMax = 2;

    get [Symbol.toStringTag]() {
        return 'ZIndexManagerClass';
    }

    get activeElement() {
        return this.#elements.length ? (this.#elements[this.#elements.length - 1] || null) : null;
    }

    constructor() {
        this.#zIndexBase = 1002;
        this.#zIndexMax = 1099;
    }

    config(zIndexBase, zIndexMax) {
        if (zIndexMax<zIndexBase) throw new TypeError('Invalid zIndexBase and zIndexMax');
        if (zIndexBase < 1) throw new TypeError('Invalid zIndexBase');
        this.#zIndexBase = zIndexBase;
        this.#zIndexMax = zIndexMax;
        this.update();
    }

    add(element) {
        if (!this.#elements.includes(element)) {
            this.#elements.push(element);
            this.update();
        }
    }

    remove(element) {
        const index = this.#elements.indexOf(element);
        if (index !== -1) {
            this.#elements.splice(index, 1);
            this.update();
        }
    }

    #update() {
        // 重新计算Index
        let index = this.#zIndexBase;
        let _start = 0;
        // 先判断是否超出最大值
        const element_count = this.#elements.length;
        const available_count = this.#zIndexMax - this.#zIndexBase + 1;
        if (element_count > available_count) {
            // 超出最大值，那么开头的元素共用一个Index
            const overflow_count = element_count - available_count; // 计算超出的数量
            const counts_with_overflow_included = overflow_count + 1; // 数学
            const slice_begin = 0; // 从第一个开始切片
            const slice_end = slice_begin + counts_with_overflow_included; // slice是一个半开半闭区间
            const elementsUsingBaseIndex = this.#elements.slice(slice_begin, slice_end);
            for (const el of elementsUsingBaseIndex) {
                el.style.zIndex = this.#zIndexBase;
            }
            _start = counts_with_overflow_included;
            ++index;
        }
        const elementsToAllocate = (_start === 0) ? this.#elements : this.#elements.slice(_start);
        for (const el of elementsToAllocate) {
            console.assert(index <= this.#zIndexMax);
            el.style.zIndex = index++;
        }
    }

    #updateQueued = false;
    update() {
        if (this.#updateQueued) return;
        this.#updateQueued = true;
        requestAnimationFrame(() => {
            this.#update();
            this.#updateQueued = false;
        });
    }

    activate(element) {
        if (this.#elements.includes(element)) {
            this.#elements.splice(this.#elements.indexOf(element), 1);
            this.#elements.push(element);
        }
        this.update();
    }

    deactivate(element) {
        if (this.#elements.includes(element)) {
            this.#elements.splice(this.#elements.indexOf(element), 1);
            this.#elements.splice(0, 0, element); // 放到底部
        }
        this.update();
    }
}

export { ZIndexManagerClass };