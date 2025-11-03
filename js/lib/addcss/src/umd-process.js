import * as fs from 'fs/promises'
const fileName = process.argv[2]
const exportName = process.argv[3]
if (!fileName || !exportName) {
    console.error('error 87')
    throw new Error(87)
}
const key = '_' + await sha256(fileName + '|' + exportName)
const umd = `var ${exportName}=((function(){${await fs.readFile(fileName, 'utf8')};var ${key}=${exportName}.default;for(const i in ${exportName})${key}[i]=${exportName}[i];return ${key}})());`;
await fs.writeFile(fileName, umd, 'utf8');
console.log('umd process success');

async function asha256(arrayBuffer) {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', arrayBuffer))).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function sha256(input) {
    return await asha256((new TextEncoder()).encode(input));
}
