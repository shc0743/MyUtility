# Warning: This framework is NOT valid due to the conflict between Python's KeyboardInterrupt and Windows service control events.
# You will have to use `pywin32` or `pywinservice` to create a valid Windows service.

import ctypes
from ctypes import wintypes
import ctypes.wintypes
from typing import Callable, Optional, Any

# Constants
SERVICE_WIN32_OWN_PROCESS = 0x00000010
SERVICE_START_PENDING = 0x00000002
SERVICE_RUNNING = 0x00000004
SERVICE_STOP_PENDING = 0x00000003
SERVICE_STOPPED = 0x00000001
SERVICE_ACCEPT_STOP = 0x00000001
SERVICE_ACCEPT_SHUTDOWN = 0x00000004
SERVICE_ACCEPT_PAUSE_CONTINUE = 0x00000002

SERVICE_CONTROL_STOP = 0x00000001
SERVICE_CONTROL_PAUSE = 0x00000002
SERVICE_CONTROL_CONTINUE = 0x00000003
SERVICE_CONTROL_SHUTDOWN = 0x00000004

# Define types
LPWSTR = ctypes.wintypes.LPWSTR
PPWSTR = ctypes.POINTER(LPWSTR)
DWORD = wintypes.DWORD
BOOL = wintypes.BOOL
LPVOID = wintypes.LPVOID
HANDLE = wintypes.HANDLE

# Service Status structure
class SERVICE_STATUS(ctypes.Structure):
    _fields_ = [
        ("dwServiceType", DWORD),
        ("dwCurrentState", DWORD),
        ("dwControlsAccepted", DWORD),
        ("dwWin32ExitCode", DWORD),
        ("dwServiceSpecificExitCode", DWORD),
        ("dwCheckPoint", DWORD),
        ("dwWaitHint", DWORD),
    ]

# Service Table Entry structure
class SERVICE_TABLE_ENTRYW(ctypes.Structure):
    _fields_ = [
        ("lpServiceName", LPWSTR),
        ("lpServiceProc", ctypes.c_void_p),
    ]

# Global variables
SvcStat = SERVICE_STATUS()
hSvcStatus = None
ServiceName = None

# Load Windows DLLs
kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)
advapi32 = ctypes.WinDLL('advapi32', use_last_error=True)

# Define function prototypes
RegisterServiceCtrlHandlerW = advapi32.RegisterServiceCtrlHandlerW
RegisterServiceCtrlHandlerW.argtypes = [LPWSTR, ctypes.c_void_p]
RegisterServiceCtrlHandlerW.restype = HANDLE

SetServiceStatus = advapi32.SetServiceStatus
SetServiceStatus.argtypes = [HANDLE, ctypes.POINTER(SERVICE_STATUS)]
SetServiceStatus.restype = BOOL

StartServiceCtrlDispatcherW = advapi32.StartServiceCtrlDispatcherW
StartServiceCtrlDispatcherW.argtypes = [ctypes.POINTER(SERVICE_TABLE_ENTRYW)]
StartServiceCtrlDispatcherW.restype = BOOL

CreateThread = kernel32.CreateThread
CreateThread.argtypes = [LPVOID, ctypes.c_size_t, ctypes.c_void_p, LPVOID, DWORD, ctypes.POINTER(DWORD)]
CreateThread.restype = HANDLE

GetLastError = kernel32.GetLastError
GetLastError.argtypes = []
GetLastError.restype = DWORD

ExitProcess = kernel32.ExitProcess
ExitProcess.argtypes = [wintypes.UINT]
ExitProcess.restype = None

# Callback types
SERVICE_CONTROL_CALLBACK = Callable[[DWORD, Callable[[DWORD, DWORD, DWORD, DWORD], bool]], None]
SERVICE_THREAD_CALLBACK = Callable[[Callable[[DWORD, DWORD, DWORD, DWORD], bool]], int]

def ErrorFault(nError: DWORD) -> None:
    """Report error and exit the process"""
    ExitProcess(nError)

def ModifyServiceStatus(dwCurrentState: DWORD, 
                       dwCheckPoint: DWORD = 0, 
                       dwWaitHint: DWORD = 0, 
                       dwControlsAccepted: DWORD = 0) -> bool:
    """
    Update the service status with provided parameters
    Returns True if successful, False otherwise
    """
    global SvcStat, hSvcStatus
    
    SvcStat.dwCurrentState = dwCurrentState
    SvcStat.dwCheckPoint = dwCheckPoint
    SvcStat.dwWaitHint = dwWaitHint
    
    if dwControlsAccepted != 0:
        SvcStat.dwControlsAccepted = dwControlsAccepted
    
    return SetServiceStatus(hSvcStatus, ctypes.byref(SvcStat))

# def default_service_control_handler(dwControl: DWORD, modify_status: Callable) -> None:
#     """Default service control handler that does nothing"""
#     pass

# def default_service_thread(modify_status: Callable) -> int:
#     """Default service thread that just waits forever"""
#     import time
#     while True:
#         time.sleep(1)
#     return 0

def svc_main_wrapper(service_thread: SERVICE_THREAD_CALLBACK,
                    service_control: SERVICE_CONTROL_CALLBACK) -> None:
    """
    Wrapper for the service main function that handles the service initialization
    and calls the provided Python callbacks
    """
    global SvcStat, hSvcStatus
    
    # Initialize service status
    SvcStat.dwServiceType = SERVICE_WIN32_OWN_PROCESS
    SvcStat.dwCurrentState = SERVICE_START_PENDING
    SvcStat.dwControlsAccepted = 0
    SvcStat.dwWin32ExitCode = 0
    SvcStat.dwServiceSpecificExitCode = 0
    SvcStat.dwCheckPoint = 0
    SvcStat.dwWaitHint = 16384
    
    # Define the C callback for service control handler
    @ctypes.WINFUNCTYPE(None, DWORD)
    def service_handler(dwControl: DWORD) -> None:
        """C callback that forwards to Python service control handler"""
        service_control(dwControl, ModifyServiceStatus)

    # 由于 Python 的 KeyboardInterrupt 会与服务的停止逻辑冲突，我们需要禁用它
    ctypes.windll.kernel32.SetConsoleCtrlHandler.argtypes = [ctypes.WINFUNCTYPE(BOOL, DWORD), BOOL]
    ctypes.windll.kernel32.SetConsoleCtrlHandler(None, 0)
    
    # Register the service control handler
    hSvcStatus = RegisterServiceCtrlHandlerW(ServiceName, ctypes.cast(service_handler, ctypes.c_void_p))
    if not hSvcStatus:
        ErrorFault(GetLastError())
        return
    
    # Initialization step 1
    ModifyServiceStatus(SERVICE_START_PENDING, 1, 16384)
    
    # Define the C callback for service thread
    @ctypes.WINFUNCTYPE(DWORD, LPVOID)
    def thread_wrapper(lpParam: LPVOID) -> DWORD:
        """C callback that runs the Python service thread"""
        try:
            return service_thread(ModifyServiceStatus)
        except:
            return 1
    
    # Create the service thread
    hThread = CreateThread(None, 0, ctypes.cast(thread_wrapper, ctypes.c_void_p), None, 0, None)
    if not hThread:
        ErrorFault(GetLastError())
    
    # Initialization step 2
    ModifyServiceStatus(SERVICE_START_PENDING, 2, 16384)
    
    # Service is now running
    ModifyServiceStatus(
        SERVICE_RUNNING,
        dwControlsAccepted=SERVICE_ACCEPT_STOP | SERVICE_ACCEPT_SHUTDOWN | SERVICE_ACCEPT_PAUSE_CONTINUE
    )

    # Wait for the service thread to finish 
    kernel32.WaitForSingleObject(hThread, 0xFFFFFFFF)
    kernel32.CloseHandle(hThread)

    # Finalize the service
    ModifyServiceStatus(SERVICE_STOPPED, 0, 0)
    
    # Finish the function
    return

def StartDispatch(svc_name: str,
                 service_thread: Optional[SERVICE_THREAD_CALLBACK] = None,
                 service_control: Optional[SERVICE_CONTROL_CALLBACK] = None) -> bool:
    """
    Start the service dispatcher with the specified service name and callbacks
    
    Args:
        svc_name: Name of the service
        service_thread: Python callback for the service thread
        service_control: Python callback for service control events
        
    Returns:
        True if successful, False otherwise
    """
    global ServiceName
    
    # Set default callbacks if not provided
    if service_thread is None:
        # service_thread = default_service_thread
        raise NotImplementedError("Default service thread not implemented")
    if service_control is None:
        # service_control = default_service_control_handler
        raise NotImplementedError("Default service control handler not implemented")
    
    ServiceName = ctypes.create_unicode_buffer(svc_name)
    
    # Create the service main callback
    SVC_MAIN_CALLBACK = ctypes.WINFUNCTYPE(None, DWORD, ctypes.POINTER(LPWSTR))
    @SVC_MAIN_CALLBACK
    def svc_main(dwArgc: DWORD, lpszArgv: ctypes.c_void_p) -> None:
        svc_main_wrapper(service_thread, service_control)
    
    # Create service table
    ServiceTable = (SERVICE_TABLE_ENTRYW * 2)()
    ServiceTable[0].lpServiceName = ctypes.cast(ServiceName, LPWSTR)
    ServiceTable[0].lpServiceProc = ctypes.cast(svc_main, ctypes.c_void_p)
    
    # Start the service dispatcher
    try:
        return bool(StartServiceCtrlDispatcherW(ServiceTable))
    except KeyboardInterrupt:
        pass

'''
# Example usage:
if __name__ == "__main__":
    def my_service_thread(modify_status: Callable) -> int:
        """Example service thread implementation"""
        print("Service thread started")
        modify_status(SERVICE_RUNNING, 0, 0, SERVICE_ACCEPT_STOP | SERVICE_ACCEPT_SHUTDOWN)
        
        import time
        try:
            while True:
                time.sleep(1)
                print("Service running...")
        except KeyboardInterrupt:
            pass
            
        print("Service thread exiting")
        return 0
    
    def my_service_control(dwControl: DWORD, modify_status: Callable) -> None:
        """Example service control handler"""
        print(f"Service control received: {dwControl}")
        if dwControl == 1:  # SERVICE_CONTROL_STOP
            print("Stop command received")
            modify_status(SERVICE_STOPPED)
            ExitProcess(0)
    
    # Start the service
    StartDispatch(
        "MyPythonService",
        service_thread=my_service_thread,
        service_control=my_service_control
    )
'''
