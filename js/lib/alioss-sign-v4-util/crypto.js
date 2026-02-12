/**
 * 计算 HMAC-SHA256 签名
 * @param {string|Uint8Array} key 密钥，支持 Hex 字符串或 Uint8Array
 * @param {string} message 待签名消息
 * @returns {Promise<Uint8Array>}
 */
export async function hmacsha256(key, message) {
    const encoder = new TextEncoder()
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        (typeof key === 'string') ? encoder.encode(key) : key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )
    const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(message)
    )
    return new Uint8Array(signature)
}

export async function sha256(message) {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', (new TextEncoder()).encode(message)))).map(b => b.toString(16).padStart(2, '0')).join('')
}