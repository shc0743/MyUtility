// 删掉整个dist目录
import { promises as fs } from 'fs'
await fs.rm('dist', { recursive: true, force: true });
