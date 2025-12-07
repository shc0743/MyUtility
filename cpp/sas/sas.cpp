// sas_service.cpp
#include <windows.h>
#include <iostream>
#include <wchar.h>
#include <string>
#include <thread>
#include <vector>
#include <tchar.h>
#include <wtsapi32.h>
#include <userenv.h>
#include <sddl.h>
#include <aclapi.h>
#include <rpc.h>
#include <rpcdce.h>

#pragma comment(lib, "wtsapi32.lib")
#pragma comment(lib, "userenv.lib")
#pragma comment(lib, "advapi32.lib")
#pragma comment(lib, "rpcrt4.lib")
#pragma comment(lib, "user32.lib")

// Constants
#define STATUS_SUCCESS 0
#define STATUS_FAILURE 1

// Function declarations
BOOL CreateProcessInSession(DWORD dwSessionId, LPCTSTR lpApplicationName, LPTSTR lpCommandLine,
    LPSECURITY_ATTRIBUTES lpProcessAttributes, LPSECURITY_ATTRIBUTES lpThreadAttributes,
    BOOL bInheritHandles, DWORD dwCreationFlags, LPVOID lpEnvironment,
    LPCTSTR lpCurrentDirectory, LPSTARTUPINFO lpStartupInfo, LPPROCESS_INFORMATION lpProcessInformation);

// Global variables for service control
SERVICE_STATUS g_ServiceStatus = { 0 };
SERVICE_STATUS_HANDLE g_StatusHandle = NULL;
HANDLE g_ServiceStopEvent = NULL;
std::wstring g_ServiceName;
std::wstring g_ExePath;
DWORD g_TargetSessionId = 0;

// Service control handler
VOID WINAPI ServiceCtrlHandler(DWORD CtrlCode)
{
    switch (CtrlCode)
    {
    case SERVICE_CONTROL_STOP:
        if (g_ServiceStatus.dwCurrentState != SERVICE_RUNNING)
            break;

        g_ServiceStatus.dwControlsAccepted = 0;
        g_ServiceStatus.dwCurrentState = SERVICE_STOP_PENDING;
        g_ServiceStatus.dwWin32ExitCode = 0;
        g_ServiceStatus.dwCheckPoint = 4;

        SetServiceStatus(g_StatusHandle, &g_ServiceStatus);
        SetEvent(g_ServiceStopEvent);
        break;

    default:
        break;
    }
}

// Service main function
VOID WINAPI ServiceMain(DWORD argc, LPTSTR* argv)
{
    g_StatusHandle = RegisterServiceCtrlHandler(g_ServiceName.c_str(), ServiceCtrlHandler);
    if (g_StatusHandle == NULL)
        return;

    ZeroMemory(&g_ServiceStatus, sizeof(g_ServiceStatus));
    g_ServiceStatus.dwServiceType = SERVICE_WIN32_OWN_PROCESS;
    g_ServiceStatus.dwControlsAccepted = 0;
    g_ServiceStatus.dwCurrentState = SERVICE_START_PENDING;
    g_ServiceStatus.dwWin32ExitCode = 0;
    g_ServiceStatus.dwServiceSpecificExitCode = 0;
    g_ServiceStatus.dwCheckPoint = 0;
    SetServiceStatus(g_StatusHandle, &g_ServiceStatus);

    // Create stop event
    g_ServiceStopEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
    if (g_ServiceStopEvent == NULL)
    {
        g_ServiceStatus.dwControlsAccepted = 0;
        g_ServiceStatus.dwCurrentState = SERVICE_STOPPED;
        g_ServiceStatus.dwWin32ExitCode = GetLastError();
        g_ServiceStatus.dwCheckPoint = 1;
        SetServiceStatus(g_StatusHandle, &g_ServiceStatus);
        return;
    }

    // Report running status
    g_ServiceStatus.dwControlsAccepted = SERVICE_ACCEPT_STOP;
    g_ServiceStatus.dwCurrentState = SERVICE_RUNNING;
    g_ServiceStatus.dwWin32ExitCode = 0;
    g_ServiceStatus.dwCheckPoint = 0;
    SetServiceStatus(g_StatusHandle, &g_ServiceStatus);

    std::thread([]{
        // Core logic: create process in specified session
        std::wstring sendCmd = L"\"";
        sendCmd += g_ExePath;
        sendCmd += L"\" --type=send";
        
        STARTUPINFO si = { sizeof(STARTUPINFO) };
        PROCESS_INFORMATION pi = { 0 };
        
        wchar_t* cmdLine = _wcsdup(sendCmd.c_str());
        
        if (CreateProcessInSession(g_TargetSessionId, NULL, cmdLine,
            NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi))
        {
            WaitForSingleObject(pi.hProcess, INFINITE);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
        }
        
        free(cmdLine);
        
        // Delete temporary service
        SC_HANDLE scm = OpenSCManager(NULL, NULL, GENERIC_READ | GENERIC_WRITE);
        if (scm)
        {
            SC_HANDLE service = OpenService(scm, g_ServiceName.c_str(), DELETE);
            if (service)
            {
                DeleteService(service);
                CloseServiceHandle(service);
            }
            CloseServiceHandle(scm);
        }
        
        // Cleanup
        CloseHandle(g_ServiceStopEvent);
        
        // Report stopped status
        g_ServiceStatus.dwControlsAccepted = 0;
        g_ServiceStatus.dwCurrentState = SERVICE_STOPPED;
        g_ServiceStatus.dwWin32ExitCode = 0;
        g_ServiceStatus.dwCheckPoint = 3;
        SetServiceStatus(g_StatusHandle, &g_ServiceStatus);
    }).detach();
}

// Install and start temporary service
BOOL InstallAndStartTempService(const std::wstring& serviceName, const std::wstring& exePath, DWORD sessionId)
{
    SC_HANDLE scm = OpenSCManager(NULL, NULL, SC_MANAGER_ALL_ACCESS);
    if (!scm)
        return FALSE;
    
    // Build service command line
    std::wstring serviceCmd = L"\"";
    serviceCmd += exePath;
    serviceCmd += L"\" --type=service ";
    serviceCmd += std::to_wstring(sessionId);
    serviceCmd += L" \"";
    serviceCmd += serviceName;
    serviceCmd += L"\"";
    
    // Create service
    SC_HANDLE service = CreateServiceW(
        scm,
        serviceName.c_str(),
        serviceName.c_str(),
        SERVICE_ALL_ACCESS,
        SERVICE_WIN32_OWN_PROCESS,
        SERVICE_DEMAND_START,
        SERVICE_ERROR_NORMAL,
        serviceCmd.c_str(),
        NULL, NULL, NULL, NULL, NULL);
    
    if (!service)
    {
        DWORD error = GetLastError();
        CloseServiceHandle(scm);
        SetLastError(error);
        return FALSE;
    }
    
    // Start service
    if (!StartService(service, 0, NULL))
    {
        DWORD error = GetLastError();
        CloseServiceHandle(service);
        CloseServiceHandle(scm);
        SetLastError(error);
        return FALSE;
    }
    
    CloseServiceHandle(service);
    CloseServiceHandle(scm);
    
    return TRUE;
}

// Generate UUID without delimiters
std::wstring GenerateUUIDWithoutDelimW() {
    std::wstring guid;
    UUID uuid;
    if (RPC_S_OK != UuidCreate(&uuid)) return guid;
    wchar_t tmp[37*2] = { 0 };
    wsprintf(tmp, L"%08x%04x%04x%02x%02x%02x%02x%02x%02x%02x%02x",
        uuid.Data1, uuid.Data2, uuid.Data3,
        uuid.Data4[0], uuid.Data4[1],
        uuid.Data4[2], uuid.Data4[3],
        uuid.Data4[4], uuid.Data4[5],
        uuid.Data4[6], uuid.Data4[7]);
    guid.assign(tmp);
    return guid;
}

// Generate random service name
std::wstring GenerateRandomServiceName()
{
    std::wstring name = L"sas_";
    name += GenerateUUIDWithoutDelimW();
    return name;
}

// Run SendSAS logic
BOOL RunSendSAS()
{
    HMODULE hSasDll = LoadLibraryW(L"sas.dll");
    if (!hSasDll)
        return FALSE;
    
    typedef VOID(WINAPI* SendSASFunc)(BOOL AsUser);
    SendSASFunc pSendSAS = (SendSASFunc)GetProcAddress(hSasDll, "SendSAS");
    if (!pSendSAS)
    {
        DWORD error = GetLastError();
        FreeLibrary(hSasDll);
        SetLastError(error);
        return FALSE;
    }
    pSendSAS(FALSE);
    
    FreeLibrary(hSasDll);
    return TRUE;
}

// Main function
int wmain(int argc, wchar_t* argv[])
{
    // Get current executable path
    wchar_t exePath[MAX_PATH];
    GetModuleFileNameW(NULL, exePath, MAX_PATH);
    g_ExePath = exePath;
    
    // Parse command line arguments
    if (argc >= 2)
    {
        std::wstring arg1 = argv[1];
        
        // Mode 1: --type=service (run as service)
        if (arg1.find(L"--type=service") == 0)
        {
            if (argc >= 4)
            {
                g_TargetSessionId = _wtoi(argv[2]);
                g_ServiceName = argv[3];
                
                SERVICE_TABLE_ENTRY ServiceTable[] =
                {
                    { const_cast<LPWSTR>(g_ServiceName.c_str()), ServiceMain },
                    { NULL, NULL }
                };
                
                if (StartServiceCtrlDispatcher(ServiceTable) == FALSE)
                    return GetLastError();
                
                return STATUS_SUCCESS;
            }
        }
        // Mode 2: --type=send (direct SendSAS call)
        else if (arg1.find(L"--type=send") == 0)
        {
            // Sleep(5000);
            return RunSendSAS() ? STATUS_SUCCESS : GetLastError();
        }
        // Mode 3: Help
        else if (arg1 == L"--help" || arg1 == L"/?" || arg1 == L"-h")
        {
            std::wcout << L"Usage:" << std::endl;
            std::wcout << L"  " << exePath << L" [options]" << std::endl;
            std::wcout << L"Options:" << std::endl;
            std::wcout << L"  no parameters      : Trigger SAS in current session" << std::endl;
            std::wcout << L"  --help, /?, -h     : Show this help" << std::endl;
            return STATUS_SUCCESS;
        }
    }
    
    // Default mode: create temporary service
    DWORD currentSessionId = 0;
    if (!ProcessIdToSessionId(GetCurrentProcessId(), &currentSessionId))
        return GetLastError();
    
    std::wstring serviceName = GenerateRandomServiceName();
    
    if (!InstallAndStartTempService(serviceName, g_ExePath, currentSessionId))
        return GetLastError();
    
    return STATUS_SUCCESS;
}

// Helper function for creating process in session
#pragma warning(push)
#pragma warning(disable: 6101)
BOOL CreateProcessInSession(_In_ DWORD dwSessionId,
    _In_opt_ LPCTSTR lpApplicationName,
    _Inout_opt_ LPTSTR lpCommandLine,
    _In_opt_ LPSECURITY_ATTRIBUTES lpProcessAttributes,
    _In_opt_ LPSECURITY_ATTRIBUTES lpThreadAttributes,
    _In_ BOOL bInheritHandles,
    _In_ DWORD dwCreationFlags,
    _In_opt_ LPVOID lpEnvironment,
    _In_opt_ LPCTSTR lpCurrentDirectory,
    _In_ LPSTARTUPINFO lpStartupInfo,
    _Out_ LPPROCESS_INFORMATION lpProcessInformation
) {
    auto& si = *lpStartupInfo;
    HANDLE hUserTokenDup = NULL;
    HANDLE hPToken = NULL;

    dwCreationFlags |= NORMAL_PRIORITY_CLASS | CREATE_NEW_CONSOLE;

    WCHAR lpDesktop[] = L"winsta0\\default";
    si.lpDesktop = lpDesktop;

    TOKEN_PRIVILEGES tp{ 0 };
    LUID luid;

    // Open process token
    if (!OpenProcessToken(GetCurrentProcess(),
        TOKEN_ADJUST_PRIVILEGES |
        TOKEN_QUERY | TOKEN_DUPLICATE |
        TOKEN_ASSIGN_PRIMARY |
        TOKEN_ADJUST_SESSIONID |
        TOKEN_READ | TOKEN_WRITE, &hPToken)) {
        return FALSE;
    }

    // Lookup debug privilege
    if (!LookupPrivilegeValue(NULL, SE_DEBUG_NAME, &luid)) {
        CloseHandle(hPToken);
        return FALSE;
    }

    // Set token information
    tp.PrivilegeCount = 1;
    tp.Privileges[0].Luid = luid;
    tp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

    // Duplicate current user token
    if (!DuplicateTokenEx(hPToken, MAXIMUM_ALLOWED, NULL,
        SecurityIdentification, TokenPrimary, &hUserTokenDup)) {
        CloseHandle(hPToken);
        return FALSE;
    }

    // Set session ID in token
    if (!SetTokenInformation(hUserTokenDup, TokenSessionId,
        (void*)&dwSessionId, sizeof(DWORD))) {
        CloseHandle(hUserTokenDup);
        CloseHandle(hPToken);
        return FALSE;
    }

    // 设置UIAccess
    BOOL bUIAccess = TRUE;
    if (!SetTokenInformation(hUserTokenDup, TokenUIAccess, &bUIAccess, sizeof(bUIAccess)))
    {
        CloseHandle(hUserTokenDup);
        CloseHandle(hPToken);
        return FALSE;
    }

    // Adjust token privileges
    if (!AdjustTokenPrivileges(hUserTokenDup, FALSE, &tp,
        sizeof(TOKEN_PRIVILEGES), NULL, NULL)) {
        CloseHandle(hUserTokenDup);
        CloseHandle(hPToken);
        return FALSE;
    }

    // Create environment block
    LPVOID pEnv = NULL;
    if (CreateEnvironmentBlock(&pEnv, hUserTokenDup, TRUE)) {
        dwCreationFlags |= CREATE_UNICODE_ENVIRONMENT;
    }

    // Create user process
    if (!CreateProcessAsUser(hUserTokenDup, lpApplicationName, lpCommandLine,
        lpProcessAttributes, lpThreadAttributes, bInheritHandles,
        dwCreationFlags, lpEnvironment ? lpEnvironment : pEnv,
        lpCurrentDirectory, lpStartupInfo, lpProcessInformation))
    {
        CloseHandle(hUserTokenDup);
        CloseHandle(hPToken);
        return FALSE;
    }

    // Cleanup handles
    if (pEnv) DestroyEnvironmentBlock(pEnv);
    if (hUserTokenDup) CloseHandle(hUserTokenDup);
    if (hPToken) CloseHandle(hPToken);

    return TRUE;
}
#pragma warning(pop)