import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.os.IBinder;
import android.os.Process;

import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PkgInfo {

    private static final SimpleDateFormat DATE_FMT =
            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US);

    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Error: no package specified. Use --help.");
            System.exit(1);
        }

        for (String arg : args) {
            if ("--help".equals(arg) || "-h".equals(arg)) {
                System.out.println("Usage: anrun PkgInfo.dex PkgInfo <pkg> [pkg ...]");
                System.exit(0);
            }
        }

        Object pm = getPackageManager();
        if (pm == null) {
            System.err.println("Error: cannot reach PackageManager service.");
            System.exit(1);
        }

        int userId = Process.myUid() / 100000;
        long flags = PackageManager.GET_PERMISSIONS
                   | PackageManager.GET_SIGNATURES
                   | PackageManager.GET_CONFIGURATIONS;

        Class<?> ipmClass = pm.getClass();

        for (int i = 0; i < args.length; i++) {
            String pkgName = args[i];
            if (i > 0) System.out.println("---");

            try {
                Method m = ipmClass.getMethod("getPackageInfo",
                        String.class, long.class, int.class);
                PackageInfo pi = (PackageInfo) m.invoke(pm, pkgName, flags, userId);
                if (pi == null) {
                    System.out.println("Package: " + pkgName);
                    System.out.println("Status: not found");
                    continue;
                }
                printPackageInfo(pi);
            } catch (Exception e) {
                System.out.println("Package: " + pkgName);
                System.out.println("Status: query failed - " + e.getMessage());
            }
        }
    }

    private static Object getPackageManager() {
        try {
            Class<?> sm = Class.forName("android.os.ServiceManager");
            Method getService = sm.getMethod("getService", String.class);
            IBinder binder = (IBinder) getService.invoke(null, "package");
            Class<?> stub = Class.forName("android.content.pm.IPackageManager$Stub");
            Method asInterface = stub.getMethod("asInterface", IBinder.class);
            return asInterface.invoke(null, binder);
        } catch (Exception e) {
            System.err.println("Reflection failed: " + e.getMessage());
            return null;
        }
    }

    private static void printPackageInfo(PackageInfo pi) {
        System.out.println("Package: " + pi.packageName);
        System.out.println("versionName: " + pi.versionName);
        System.out.println("versionCode: " + pi.versionCode);
        System.out.println("firstInstallTime: " + formatTime(pi.firstInstallTime)
                + "  (" + pi.firstInstallTime + ")");
        System.out.println("lastUpdateTime: " + formatTime(pi.lastUpdateTime)
                + "  (" + pi.lastUpdateTime + ")");

        if (pi.applicationInfo != null) {
            ApplicationInfo ai = pi.applicationInfo;
            System.out.println("targetSdkVersion: " + ai.targetSdkVersion);
            System.out.println("minSdkVersion: " + ai.minSdkVersion);
            System.out.println("sourceDir: " + ai.sourceDir);
            System.out.println("publicSourceDir: " + ai.publicSourceDir);
            System.out.println("dataDir: " + ai.dataDir);
            System.out.println("nativeLibraryDir: " + ai.nativeLibraryDir);
            System.out.println("uid: " + ai.uid);
            System.out.println("enabled: " + ai.enabled);
            System.out.println("flags: 0x" + Integer.toHexString(ai.flags));
            System.out.println("processName: " + ai.processName);
        }

        if (pi.requestedPermissions != null && pi.requestedPermissions.length > 0) {
            System.out.println("requestedPermissions:");
            for (String perm : pi.requestedPermissions) {
                System.out.println("  - " + perm);
            }
        }

        System.out.println("installLocation: " + pi.installLocation);
        System.out.println("sharedUserId: " +
                (pi.sharedUserId != null ? pi.sharedUserId : "(null)"));
    }

    private static String formatTime(long millis) {
        if (millis <= 0) return "(unknown)";
        return DATE_FMT.format(new Date(millis));
    }
}
