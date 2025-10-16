#!/usr/bin/env python3
import os
import json
import hashlib

# 配置
SRC_DIR = "./src"                   # Vue 源码目录
JSON_FILE = "./vue-classes.json"    # 提取的 class 列表 JSON
OBF_SUFFIX = ".obf.vue"             # 输出文件后缀

# ----------------------------
# 加载 class 列表
# ----------------------------
with open(JSON_FILE, "r", encoding="utf-8") as f:
    class_list = json.load(f)

# ----------------------------
# 构建混淆映射
# ----------------------------
def obf_class(cls_name):
    h = hashlib.sha256(cls_name.encode("utf-8")).hexdigest()
    return "_" + h

class_map = {cls: obf_class(cls) for cls in class_list}

# ----------------------------
# 遍历 src 目录
# ----------------------------
for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if not file.endswith(".vue"):
            continue

        file_path = os.path.join(root, file)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # ----------------------------
        # 替换 class
        # ----------------------------
        for old_cls, new_cls in class_map.items():
            # 只匹配完整类名，避免部分替换
            # 匹配 class="..." 或 :class="['...']" 等
            # 简单全局替换
            content = content.replace(old_cls, new_cls)

        # ----------------------------
        # 写入新文件
        # ----------------------------
        obf_file = os.path.join(root, file.replace(".vue", OBF_SUFFIX))
        with open(obf_file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ {file_path} -> {obf_file}")

print("🎉 所有文件混淆完成！")
