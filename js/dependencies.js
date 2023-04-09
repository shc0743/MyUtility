(function () {
    const api = {};
    globalThis['c5e5ef5f9a864a96ad8d6829dc49afd2'] = api; 


    class dependencies {
        //__done__ = {};
        //__promise__ = new Map();

        constructor() {
            this.__instanceId__ = Math.floor(Math.random()*1e12).toString();
            this.__done__ = {};
            this.__promise__ = new Map();

        }

        reset() {
            this.__done__ = {};
            this.__promise__.clear();
        }

        on(events_ = []) {
            let events = events_;
            if (arguments.length > 1) {
                events = [];
                for (let i of arguments) events.push(i);
            }
            if (!Array.prototype.isPrototypeOf(events)) {
                events = new Array(events);
            }
            if (events.length < 1) throw new TypeError('Invalid arguments');
            events = events.sort((a, b) => {
                for (let i = 0; i < a.length; ++i) {
                    if (a[i] < b[i]) return -1
                }
                return 1
            });
            // console.log(events);
            let k = events.join(this.__instanceId__);
            if (this.__promise__.get(k)) {
                this.__checkEvents__();
                return this.__promise__.get(k).promise;
            }
            let obj = {};
            obj.promise = new Promise(function (resolve, reject) {
                obj.resolve = resolve;
                obj.reject = reject;
            });
            this.__promise__.set(k, obj);
            this.__checkEvents__();
            return obj.promise;
        }

        done(event = '') {
            this.__done__[event] = true;
            this.__checkEvents__(event);
        }

        __checkEvents__(arg) {
            for (let i of this.__promise__) {
                let k = i[0], v = i[1];
                if (v.done) continue;
                let no = false;
                for (let j of k.split(this.__instanceId__)) {
                    if (!(j in this.__done__)) {
                        no = true; break;
                    }
                }
                if (no) continue;
                v.done = true;
                v.resolve(arg);
            }
        }




    }


    api.getAPI = function () {
        return dependencies;
    }
    api.register = function (name) {
        return globalThis[name] = new dependencies;
    }


})();
