import os
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image
try:
    from tkinterdnd2 import DND_FILES, TkinterDnD
    DND_AVAILABLE = True
except ImportError:
    DND_AVAILABLE = False

class ImageConverterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("图片格式转换工具")

        self.file_list = []
        self.cancel_flag = False

        # 文件列表区域
        columns = ("filename", "status")
        self.tree = ttk.Treeview(root, columns=columns, show="headings", height=10)
        self.tree.heading("filename", text="文件路径")
        self.tree.heading("status", text="状态")
        self.tree.column("filename", width=400)
        self.tree.column("status", width=120)
        self.tree.grid(row=0, column=0, columnspan=4, padx=5, pady=5, sticky="nsew")

        # 按钮区
        self.add_btn = ttk.Button(root, text="添加文件", command=self.add_files)
        self.add_btn.grid(row=1, column=0, padx=5, pady=5)

        self.remove_btn = ttk.Button(root, text="移除文件", command=self.remove_files)
        self.remove_btn.grid(row=1, column=1, padx=5, pady=5)

        self.clear_btn = ttk.Button(root, text="清空列表", command=self.clear_files)
        self.clear_btn.grid(row=1, column=2, padx=5, pady=5)

        # 输出目录
        ttk.Label(root, text="输出目录:").grid(row=2, column=0, sticky="e", padx=5)
        self.output_dir_var = tk.StringVar()
        self.output_dir_entry = ttk.Entry(root, textvariable=self.output_dir_var, width=50)
        self.output_dir_entry.grid(row=2, column=1, columnspan=2, sticky="we", padx=5)
        ttk.Button(root, text="浏览", command=self.select_output_dir).grid(row=2, column=3, padx=5)

        # 选项区
        ttk.Label(root, text="输出格式:").grid(row=3, column=0, sticky="e", padx=5)
        self.format_var = tk.StringVar(value="png")
        formats = ["png", "jpg", "jpeg", "webp", "ico", "bmp", "tiff"]
        self.format_combo = ttk.Combobox(root, textvariable=self.format_var, values=formats, state="readonly")
        self.format_combo.grid(row=3, column=1, sticky="w", padx=5)

        self.resize_var = tk.BooleanVar()
        self.resize_check = ttk.Checkbutton(root, text="更改图片大小", variable=self.resize_var, command=self.toggle_resize)
        self.resize_check.grid(row=3, column=2, padx=5, sticky="w")

        self.resize_frame = ttk.Frame(root)
        ttk.Label(self.resize_frame, text="宽度:").grid(row=0, column=0)
        self.width_var = tk.IntVar()
        self.width_entry = ttk.Entry(self.resize_frame, textvariable=self.width_var, width=6)
        self.width_entry.grid(row=0, column=1)
        ttk.Label(self.resize_frame, text="高度:").grid(row=0, column=2)
        self.height_var = tk.IntVar()
        self.height_entry = ttk.Entry(self.resize_frame, textvariable=self.height_var, width=6)
        self.height_entry.grid(row=0, column=3)

        # 进度条
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(root, variable=self.progress_var, maximum=100)
        self.progress_bar.grid(row=4, column=0, columnspan=4, sticky="we", padx=5, pady=5)

        self.progress_label = ttk.Label(root, text="0/0 0%")
        self.progress_label.grid(row=5, column=0, columnspan=4)

        # 开始/取消按钮
        self.start_btn = ttk.Button(root, text="开始", command=self.toggle_start_cancel)
        self.start_btn.grid(row=6, column=0, columnspan=4, pady=5)

        # 拖放功能
        if DND_AVAILABLE:
            self.tree.drop_target_register(DND_FILES)
            self.tree.dnd_bind('<<Drop>>', self.drop_files)

        # 布局权重
        root.grid_rowconfigure(0, weight=1)
        root.grid_columnconfigure(1, weight=1)

    def drop_files(self, event):
        files = root.tk.splitlist(event.data)
        self.add_file_paths(files)

    def add_files(self):
        files = filedialog.askopenfilenames(filetypes=[("Image files", "*.png;*.jpg;*.jpeg;*.bmp;*.tiff;*.ico;*.webp")])
        if files:
            self.add_file_paths(files)

    def add_file_paths(self, files):
        if self.processing():
            return
        if not self.output_dir_var.get() and files:
            first_dir = os.path.dirname(files[0])
            self.output_dir_var.set(first_dir)
        for file in files:
            if file not in self.file_list:
                self.file_list.append(file)
                self.tree.insert("", "end", values=(file, ""))

    def remove_files(self):
        if self.processing():
            return
        for sel in self.tree.selection():
            idx = self.tree.index(sel)
            self.tree.delete(sel)
            self.file_list.pop(idx)

    def clear_files(self):
        if self.processing():
            return
        self.tree.delete(*self.tree.get_children())
        self.file_list.clear()

    def select_output_dir(self):
        directory = filedialog.askdirectory()
        if directory:
            self.output_dir_var.set(directory)

    def toggle_resize(self):
        if self.resize_var.get():
            self.resize_frame.grid(row=3, column=3, padx=5, sticky="w")
        else:
            self.resize_frame.grid_forget()

    def toggle_start_cancel(self):
        if self.processing():
            self.cancel_flag = True
        else:
            if not self.file_list:
                messagebox.showwarning("警告", "请先添加文件！")
                return
            self.cancel_flag = False
            threading.Thread(target=self.process_files, daemon=True).start()
            self.start_btn.config(text="取消")

    def processing(self):
        return self.start_btn.cget("text") == "取消"

    def process_files(self):
        total = len(self.file_list)
        processed = 0
        for idx, filepath in enumerate(self.file_list):
            if self.cancel_flag:
                break
            self.update_status(idx, "正在处理...")
            try:
                output_dir = self.output_dir_var.get()
                if not output_dir:
                    output_dir = os.path.dirname(filepath)
                os.makedirs(output_dir, exist_ok=True)
                base = os.path.splitext(os.path.basename(filepath))[0]
                ext = self.format_var.get().lower()
                save_path = os.path.join(output_dir, f"{base}.{ext}")
                counter = 1
                while os.path.exists(save_path):
                    save_path = os.path.join(output_dir, f"{base}({counter}).{ext}")
                    counter += 1

                img = Image.open(filepath)
                if self.resize_var.get():
                    w = self.width_var.get()
                    h = self.height_var.get()
                    img = img.resize((w, h), Image.LANCZOS)
                if ext in ["jpg", "jpeg"] and img.mode in ("RGBA", "LA"):
                    bg = Image.new("RGB", img.size, (255, 255, 255))
                    bg.paste(img, mask=img.split()[3])
                    img = bg
                img.save(save_path, format=ext.upper())
                self.update_status(idx, "完成")
            except Exception as e:
                self.update_status(idx, f"失败: {e}")
            processed += 1
            self.update_progress(processed, total)
        self.start_btn.config(text="开始")

    def update_status(self, idx, status):
        iid = self.tree.get_children()[idx]
        filename = self.tree.item(iid, "values")[0]
        self.tree.item(iid, values=(filename, status))

    def update_progress(self, processed, total):
        percent = int(processed / total * 100)
        self.progress_var.set(percent)
        self.progress_label.config(text=f"{processed}/{total} {percent}%")

if __name__ == "__main__":
    root = TkinterDnD.Tk() if DND_AVAILABLE else tk.Tk()
    app = ImageConverterApp(root)
    root.mainloop()
