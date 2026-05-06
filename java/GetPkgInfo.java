import java.lang.reflect.Method;
import java.lang.reflect.Field;

public class GetPkgInfo {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: GetPkgInfo <packageName> [packageName2 ...]");
            return;
        }

        try {
            Object pm = getIPackageManager();
            if (pm == null) {
                System.err.println("Failed to get IPackageManager");
                return;
            }
            int userId = getMyUserId();

            for (String pkgName : args) {
                System.out.println("\n========== " + pkgName + " ==========");
                Object pkgInfo = callGetPackageInfo(pm, pkgName, userId);
                if (pkgInfo == null) {
                    System.err.println("Package not found: " + pkgName);
                    continue;
                }
                printPackageInfo(pkgInfo);
            }
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    // 获取 IPackageManager
    private static Object getIPackageManager() throws Exception {
        Class<?> smClass = Class.forName("android.os.ServiceManager");
        Method getService = smClass.getMethod("getService", String.class);
        Object binder = getService.invoke(null, "package");
        if (binder == null) return null;

        Class<?> stubClass = Class.forName("android.content.pm.IPackageManager$Stub");
        Method asInterface = stubClass.getMethod("asInterface", Class.forName("android.os.IBinder"));
        return asInterface.invoke(null, binder);
    }

    // 获取当前用户ID
    private static int getMyUserId() throws Exception {
        Class<?> uhClass = Class.forName("android.os.UserHandle");
        Method myUserId = uhClass.getMethod("myUserId");
        return (int) myUserId.invoke(null);
    }

    // 调用 getPackageInfo 并返回 PackageInfo 对象
    private static Object callGetPackageInfo(Object pm, String pkgName, int userId) throws Exception {
        Class<?> pmClass = pm.getClass();
        // 尝试常见签名 (flags 可能是 int 或 long)
        Object[][] candidates = {
            { String.class, int.class, int.class },
            { String.class, long.class, int.class },
            { String.class, int.class, int.class, int.class },
            { String.class, long.class, int.class, int.class }
        };
        Object[][] argsValues = {
            { pkgName, 0, userId },
            { pkgName, 0L, userId },
            { pkgName, 0, userId, 0 },
            { pkgName, 0L, userId, 0 }
        };

        for (int i = 0; i < candidates.length; i++) {
            try {
                Method m = pmClass.getMethod("getPackageInfo", (Class<?>[]) candidates[i]);
                Object result = m.invoke(pm, argsValues[i]);
                if (result != null) return result;
            } catch (NoSuchMethodException ignored) {
            } catch (Exception e) { /* 继续尝试 */ }
        }

        // 暴力枚举
        for (Method m : pmClass.getDeclaredMethods()) {
            if (m.getName().equals("getPackageInfo")) {
                Class<?>[] paramTypes = m.getParameterTypes();
                if (paramTypes.length < 2 || paramTypes[0] != String.class) continue;
                Object[] callArgs = new Object[paramTypes.length];
                callArgs[0] = pkgName;
                for (int j = 1; j < paramTypes.length; j++) {
                    if (paramTypes[j] == int.class) callArgs[j] = 0;
                    else if (paramTypes[j] == long.class) callArgs[j] = 0L;
                    else if (paramTypes[j] == int[].class) callArgs[j] = null;
                    else if (paramTypes[j] == String.class) callArgs[j] = "";
                    else callArgs[j] = null;
                }
                if (paramTypes.length >= 3 && paramTypes[paramTypes.length-1] == int.class) {
                    callArgs[paramTypes.length-1] = userId;
                }
                try {
                    Object result = m.invoke(pm, callArgs);
                    if (result != null) return result;
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    // 打印包的所有详细信息
    private static void printPackageInfo(Object pkgInfo) throws Exception {
        Class<?> clazz = pkgInfo.getClass();
        Field[] fields = clazz.getDeclaredFields();
        // 我们关心的字段名列表
        String[] interesting = {
            "packageName", "versionCode", "versionName",
            "firstInstallTime", "lastUpdateTime",
            "applicationInfo", "targetSdkVersion"
        };
        for (String name : interesting) {
            try {
                Field f = clazz.getDeclaredField(name);
                f.setAccessible(true);
                Object value = f.get(pkgInfo);
                printField(name, value);
            } catch (NoSuchFieldException e) {
                // 忽略，某些版本可能没有
            }
        }

        // 单独处理 applicationInfo 里的字段
        try {
            Field appInfoField = clazz.getDeclaredField("applicationInfo");
            appInfoField.setAccessible(true);
            Object appInfo = appInfoField.get(pkgInfo);
            if (appInfo != null) {
                System.out.println("  [ApplicationInfo]");
                Class<?> aiClass = appInfo.getClass();
                String[] aiFields = {"packageName", "className", "targetSdkVersion", "minSdkVersion", 
                                     "processName", "sourceDir", "nativeLibraryDir", "dataDir"};
                for (String fname : aiFields) {
                    try {
                        Field f = aiClass.getDeclaredField(fname);
                        f.setAccessible(true);
                        Object val = f.get(appInfo);
                        printlnIndented(fname, val, 4);
                    } catch (NoSuchFieldException e) {}
                }
            }
        } catch (NoSuchFieldException e) {}

        // 尝试获取 minSdkVersion（如果 PackageInfo 里直接有的话，否则从 applicationInfo 获取）
        try {
            Field minSdk = clazz.getDeclaredField("minSdkVersion");
            minSdk.setAccessible(true);
            int minSdkVal = minSdk.getInt(pkgInfo);
            printlnIndented("minSdkVersion", minSdkVal, 2);
        } catch (NoSuchFieldException e) {
            // 已经打印过 applicationInfo 里面的了，忽略
        }
    }

    private static void printField(String name, Object value) {
        System.out.println(String.format("  %-20s: %s", name, value));
    }

    private static void printlnIndented(String name, Object value, int indent) {
        String spaces = String.format("%" + indent + "s", "");
        System.out.println(spaces + name + ": " + value);
    }
}
