/*
MIT License, Copyright (c) 2025 @chcs1013
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export const Trusted_Origins = new Set();
const ipc_apis = new Map();
const ipc_outbound_requests = new Map();

// 将 location.origin 添加到可信列表
Trusted_Origins.add(location.origin);

/**
 * 发送 IPC 回复。
 * @param {MessageEvent} ev 消息事件。
 * @param {*} context 上下文。
 * @param {boolean} success 是否成功。
 * @param {*} result 结果。
 * @param {*} error 错误。
 * @param {*} additional 额外数据。
 */
function IPC_Reply(ev, context, success, result, error = null, additional = {}) {
    ev.source.postMessage({
        type: 'ipc.reply',
        context: context,
        success: success,
        result: result,
        error: error,
        ...additional,
    }, ev.origin);
};

async function IPC_Handler_Inbound(ev) {
    if (!Trusted_Origins.has(ev.origin)) return;
    if ((!ev.data) || typeof ev.data !== 'object') return;
    if (ev.data.type !== 'ipc.invoke') return;
    const apiName = String(ev.data['context.invoke.api']);
    if (!ipc_apis.has(apiName)) return IPC_Reply(ev, {
        'id': ev.data.id,
        'context.invoke.api': apiName,
    }, false, null, {
        code: 'NotFound',
        message: `API ${apiName} not found`,
    });
    try {
        let result = await ipc_apis.get(apiName).call(ev, ev.data);
        try {
            result = globalThis.structuredClone(result);
        }
        catch (e) {
            result = String(result);
        }
        IPC_Reply(ev, {
            'id': ev.data.id,
            'context.invoke.api': apiName,
        }, true, result);
    }
    catch (e) {
        IPC_Reply(ev, {
            'id': ev.data.id,
            'context.invoke.api': apiName,
        }, false, null, {
            code: 'UnexpectedExceptionInUserCallback',
            message: String(e),
            stack: e?.stack
        });
    }
}
async function IPC_Handler_Outbound(ev) {
    if (!Trusted_Origins.has(ev.origin)) return;
    if ((!ev.data) || typeof ev.data !== 'object') return;
    if (ev.data.type !== 'ipc.reply') return;
    const id = String(ev.data.context?.id);
    if (!ipc_outbound_requests.has(id)) return;
    const request = ipc_outbound_requests.get(id);
    ipc_outbound_requests.delete(id);
    const data = request.transparency ? ev.data.result : ev.data;
    if (ev.data.success) {
        request.resolve(data);
    }
    else {
        request.reject(data);
    }
}

globalThis.addEventListener('message', IPC_Handler_Inbound);
globalThis.addEventListener('message', IPC_Handler_Outbound);

// ------

/**
 * 进行远程过程调用。
 * @param {Window} target 目标窗口。
 * @param {string} api 要调用的 API 名称。
 * @param {*} args 要传递的参数。
 * @param {boolean} transparency 是否透传。透传，即 await 调用结果时，直接返回调用结果。
 * @param {number} timeout 超时时间。
 * @param {string} target_origin 目标窗口的 origin。生产环境强烈建议明确指定
 * @returns {Promise<any>} 调用结果。
 */
function IPC_Invoke(target, api, args, transparency = true, timeout = 2000, target_origin = '*') {
    const id = crypto.randomUUID();
    try {
        target.postMessage({
            type: 'ipc.invoke',
            id: id,
            'context.invoke.api': api,
            args: args,
        }, target_origin);
    }
    catch (e) {
        return Promise.reject(e);
    }
    const promise = new Promise((resolve, reject) => {
        ipc_outbound_requests.set(id, {
            resolve,
            reject,
            transparency,
        });
    });
    const timeoutId = setTimeout(() => {
        ipc_outbound_requests.get(id).reject({
            type: 'ipc.internal',
            id: id,
            context: {
                'context.invoke.api': api,
            },
            success: false,
            error: {
                code: 'Timeout',
                message: `IPC invoke timeout after ${timeout}ms`,
            },
        });
        ipc_outbound_requests.delete(id);
    }, timeout);
    promise.finally(() => {
        clearTimeout(timeoutId);
    });
    return promise;
}
/**
 * 注册一个 API 处理函数。
 * @param {string} api 要注册的 API 名称。
 * @param {Function} handler 处理函数。
 */
function IPC_Register(api, handler) {
    ipc_apis.set(api, handler);
}
/**
 * 注销一个 API 处理函数。
 * @param {string} api 要注销的 API 名称。
 */
function IPC_Unregister(api) {
    ipc_apis.delete(api);
}

export {
    IPC_Invoke,
    IPC_Register,
    IPC_Unregister,
};
