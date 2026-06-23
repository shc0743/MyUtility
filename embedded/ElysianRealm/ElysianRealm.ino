#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>

Preferences prefs;
WebServer server(80);

static const char* PREF_NS   = "netcfg";
static const char* MAGIC_KEY = "ESP32CFG1";

static const IPAddress AP_IP(192, 168, 4, 1);
static const IPAddress AP_GW(192, 168, 4, 1);
static const IPAddress AP_SUBNET(255, 255, 255, 0);

static const unsigned long AUTH_TIMEOUT_MS   = 15UL * 60UL * 1000UL;
static const unsigned long WIFI_CONNECT_MS    = 15000UL;
static const unsigned long RESTART_DELAY_MS   = 1200UL;

struct ConfigData {
  String staSsid;
  String staPass;
  String apSsid;
  String apPass;
  String adminKey;
  bool valid = false;
};

ConfigData cfg;

String sessionToken;
bool adminAuthed = false;
unsigned long lastAuthMs = 0;

bool restartPending = false;
unsigned long restartAtMs = 0;

String serialLine;
bool natEnabled = false;

// ---------- 工具函数 ----------
String htmlEscape(const String& s) {
  String out;
  out.reserve(s.length() + 16);
  for (size_t i = 0; i < s.length(); ++i) {
    char c = s[i];
    switch (c) {
      case '&':  out += F("&amp;");  break;
      case '<':  out += F("&lt;");   break;
      case '>':  out += F("&gt;");   break;
      case '"':  out += F("&quot;"); break;
      case '\'': out += F("&#39;");  break;
      default:   out += c;          break;
    }
  }
  return out;
}

String pageShell(const String& title, const String& body) {
  String html;
  html.reserve(4096);
  html += F("<!doctype html><html><head><meta charset='utf-8'>");
  html += F("<meta name='viewport' content='width=device-width,initial-scale=1'>");
  html += F("<title>");
  html += htmlEscape(title);
  html += F("</title>");
  html += F("<style>"
            "body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
            "max-width:900px;margin:24px auto;padding:0 16px;line-height:1.5;background:#fafafa;color:#111}"
            ".card{background:#fff;border:1px solid #ddd;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.04)}"
            "h1{font-size:24px;margin:0 0 12px}"
            "h2{font-size:18px;margin:24px 0 12px}"
            "label{display:block;margin:12px 0 6px;font-weight:600}"
            "input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #ccc;border-radius:10px;font-size:16px}"
            "input[type='checkbox']{width:auto;margin:0;accent-color:#9f7ae4}"
            ".chk-label{display:block;font-weight:400;margin:4px 0 0}"
            "button{margin-top:16px;padding:10px 16px;border:0;border-radius:10px;font-size:16px;cursor:pointer;background:#ffffff;color:#9f7ae4}"
            ".muted{color:#666;font-size:14px}"
            ".ok{background:#f0f0f0;color:#9f7ae4;padding:10px 12px;border-radius:10px;margin:12px 0}"
            ".err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:10px 12px;border-radius:10px;margin:12px 0}"
            "code{background:#f3f4f6;padding:2px 6px;border-radius:6px}"
            "hr{border:0;border-top:1px solid #eee;margin:20px 0}"
            "</style></head><body><div class='card'>");
  html += body;
  html += F("</div></body></html>");
  return html;
}

String loginForm(const String& msg = "") {
  String body;
  body += F("<h1>设置</h1>");
  body += F("<div class='muted'>请输入密码。</div>");
  if (msg.length()) {
    body += F("<div class='err'>");
    body += htmlEscape(msg);
    body += F("</div>");
  }
  body += F("<form method='post' action='/login'>");
  body += F("<label>请输入密码</label><input type='password' name='adminKey' required>");
  body += F("<button type='submit'>登录</button>");
  body += F("</form>");
  body += F("<hr><div class='muted'>如果忘记密码，可通过串口发送 <code>AT+RESET\\r\\n</code> 重置所有设置。</div>");
  return pageShell("输入密码", body);
}

String setupForm(const String& msg = "") {
  String body;
  body += F("<h1>安装</h1>");
  if (msg.length()) {
    body += F("<div class='err'>");
    body += htmlEscape(msg);
    body += F("</div>");
  }
  body += F("<form method='post' action='/save'>");

  body += F("<h2>路由器 STA 配置</h2>");
  body += F("<label>路由器账户 / SSID</label><input name='staSsid' required maxlength='32'>");
  body += F("<label>路由器密码</label><input type='password' name='staPass' maxlength='64'>");

  body += F("<h2>接入点 AP 配置</h2>");
  body += F("<label>接入点账户 / SSID</label><input name='apSsid' required value=\"Elysian Realm\" maxlength='32'>");
  body += F("<label>接入点密码</label><input type='password' name='apPass' value=\"11111111\" maxlength='64'>");
  body += F("<div class='muted'>AP 密码留空时会创建开放热点；建议设置 8 位以上密码。</div>");

  body += F("<h2>管理密钥</h2>");
  body += F("<label>管理密钥</label><input type='password' name='adminKey' required maxlength='64'>");

  body += F("<button type='submit' style='color:#61468f'>回应我吧，爱莉希雅！</button>");
  body += F("</form>");
  return pageShell("安装程序", body);
}

String settingsForm(const String& msg = "") {
  String body;
  body += F("<h1>设置</h1>");
  body += F("<div class='muted'>留空表示保持原值不变；修改后会保存并自动重启。</div>");
  if (msg.length()) {
    body += F("<div class='ok'>");
    body += htmlEscape(msg);
    body += F("</div>");
  }

  body += F("<div class='muted'>当前状态：</div><ul>");
  body += F("<li>AP SSID: <code>");
  body += htmlEscape(cfg.apSsid);
  body += F("</code></li>");
  body += F("<li>AP IP: <code>");
  body += AP_IP.toString();
  body += F("</code></li>");
  body += F("<li>AP PASSWD: <code>");
  body += htmlEscape(cfg.apPass);
  body += F("</code></li>");
  body += F("<li>STA SSID: <code>");
  body += htmlEscape(cfg.staSsid);
  body += F("</code></li>");
  body += F("<li>STA 状态: <code>");
  body += (WiFi.status() == WL_CONNECTED) ? F("已连接") : F("未连接");
  body += F("</code></li>");
  if (WiFi.status() == WL_CONNECTED) {
    body += F("<li>STA IP: <code>");
    body += WiFi.localIP().toString();
    body += F("</code></li>");
  }
  body += F("</ul>");

  body += F("<form method='post' action='/save'>");

  body += F("<h2>路由器 STA 配置</h2>");
  body += F("<label>路由器账户 / SSID</label><input name='staSsid' maxlength='32' value='");
  body += htmlEscape(cfg.staSsid);
  body += F("'>");
  body += F("<label>路由器密码</label><input type='password' name='staPass' maxlength='64' placeholder='留空保持不变'><label class='chk-label'><input type='checkbox' name='staPassRemove'> 删除密码</label>");

  body += F("<h2>接入点 AP 配置</h2>");
  body += F("<label>接入点账户 / SSID</label><input name='apSsid' maxlength='32' value='");
  body += htmlEscape(cfg.apSsid);
  body += F("'>");
  body += F("<label>接入点密码</label><input type='password' name='apPass' maxlength='64' placeholder='留空保持不变'><label class='chk-label'><input type='checkbox' name='apPassRemove'> 删除密码</label>");

  body += F("<h2>管理密钥</h2>");
  body += F("<label>新的管理密钥</label><input type='password' name='adminKey' maxlength='64' placeholder='留空保持不变'>");

  body += F("<button type='submit' style='color:#61468f'>回应我吧，爱莉希雅！</button>");
  body += F("</form>");

  body += F("<hr><form method='post' action='/logout'><button type='submit'>退出登录</button></form>");
  body += F("<div class='muted'>忘记管理密钥时，使用串口发送 <code>AT+RESET\\r\\n</code> 清空所有设置。</div>");
  return pageShell("", body);
}

void requestRestart(unsigned long delayMs = RESTART_DELAY_MS) {
  restartPending = true;
  restartAtMs = millis() + delayMs;
}

void clearAllSettings() {
  prefs.begin(PREF_NS, false);
  prefs.clear();
  prefs.end();

  cfg = ConfigData();
  adminAuthed = false;
  sessionToken = "";
  lastAuthMs = 0;

  WiFi.softAPdisconnect(true);
  WiFi.disconnect(true, true);

  requestRestart(800);
}

bool loadSettings() {
  prefs.begin(PREF_NS, true);
  String magic = prefs.getString("magic", "");
  if (magic != MAGIC_KEY) {
    prefs.end();
    cfg.valid = false;
    return false;
  }

  cfg.staSsid  = prefs.getString("staSsid", "");
  cfg.staPass  = prefs.getString("staPass", "");
  cfg.apSsid   = prefs.getString("apSsid", "");
  cfg.apPass   = prefs.getString("apPass", "");
  cfg.adminKey = prefs.getString("adminKey", "");
  cfg.valid = (cfg.staSsid.length() > 0 && cfg.apSsid.length() > 0 && cfg.adminKey.length() > 0);
  prefs.end();
  return cfg.valid;
}

bool saveSettings() {
  prefs.begin(PREF_NS, false);
  bool ok = true;
  ok &= prefs.putString("magic", MAGIC_KEY) > 0;
  ok &= prefs.putString("staSsid", cfg.staSsid) > 0;
  prefs.putString("staPass", cfg.staPass);     // 空密码合法，不检查返回值
  ok &= prefs.putString("apSsid", cfg.apSsid) > 0;
  prefs.putString("apPass", cfg.apPass);       // 空密码合法，不检查返回值
  ok &= prefs.putString("adminKey", cfg.adminKey) > 0;
  prefs.end();
  cfg.valid = ok;
  return ok;
}

void startWiFi() {
  WiFi.mode(WIFI_AP_STA);
  WiFi.setSleep(false);

  WiFi.softAPConfig(AP_IP, AP_GW, AP_SUBNET);

  const char* apPass = cfg.apPass.length() ? cfg.apPass.c_str() : nullptr;
  bool apOk = WiFi.softAP(cfg.apSsid.c_str(), apPass);

  Serial.print("[WiFi] AP start: ");
  Serial.println(apOk ? "OK" : "FAIL");
  Serial.print("[WiFi] AP IP: ");
  Serial.println(WiFi.softAPIP());

  const char* staPass = cfg.staPass.length() ? cfg.staPass.c_str() : nullptr;
  WiFi.begin(cfg.staSsid.c_str(), staPass);

  Serial.print("[WiFi] Connecting to STA");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - t0) < WIFI_CONNECT_MS) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("[WiFi] STA connected");
    Serial.print("[WiFi] STA IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.print("[WiFi] STA not connected, status=");
    Serial.println((int)WiFi.status());
  }
}

bool isAuthed() {
  if (!cfg.valid) return true; // 首次未配置时，不需要管理密码

  if (adminAuthed && (long)(millis() - lastAuthMs) < (long)AUTH_TIMEOUT_MS) {
    return true;
  }

  String cookie = server.header("Cookie");
  String target = "ESP32SESS=" + sessionToken;
  if (sessionToken.length() && cookie.indexOf(target) >= 0) {
    adminAuthed = true;
    lastAuthMs = millis();
    return true;
  }

  adminAuthed = false;
  return false;
}

void sendLogin(const String& msg = "") {
  server.send(200, "text/html; charset=utf-8", loginForm(msg));
}

void handleRoot() {
  if (!cfg.valid) {
    server.send(200, "text/html; charset=utf-8", setupForm());
    return;
  }

  if (!isAuthed()) {
    server.send(200, "text/html; charset=utf-8", loginForm());
    return;
  }

  server.send(200, "text/html; charset=utf-8", settingsForm());
}

void handleLogin() {
  if (!cfg.valid) {
    server.sendHeader("Location", "/");
    server.send(303);
    return;
  }

  String key = server.arg("adminKey");
  if (key == cfg.adminKey) {
    sessionToken = String((uint32_t)esp_random(), HEX) + String((uint32_t)esp_random(), HEX);
    adminAuthed = true;
    lastAuthMs = millis();

    server.sendHeader("Set-Cookie", "ESP32SESS=" + sessionToken + "; Path=/; HttpOnly");
    server.sendHeader("Location", "/");
    server.send(303);
    return;
  }

  server.send(403, "text/html; charset=utf-8", loginForm("密码错误！"));
}

bool fieldLenOKForWPA(const String& s) {
  return (s.length() == 0) || (s.length() >= 8);
}

void handleSave() {
  bool firstSetup = !cfg.valid;
  if (!firstSetup && !isAuthed()) {
    server.send(403, "text/html; charset=utf-8", loginForm("请输入密码"));
    return;
  }

  String staSsid  = server.arg("staSsid");
  String staPass  = server.arg("staPass");
  String apSsid   = server.arg("apSsid");
  String apPass   = server.arg("apPass");
  String adminKey = server.arg("adminKey");
  bool staRemove  = (server.arg("staPassRemove") == "on");
  bool apRemove   = (server.arg("apPassRemove") == "on");

  staSsid.trim();
  apSsid.trim();

  if (staSsid.length() == 0 || apSsid.length() == 0) {
    server.send(400, "text/html; charset=utf-8",
                firstSetup ? setupForm("路由器 SSID 和 AP SSID 不能为空")
                           : settingsForm("路由器 SSID 和 AP SSID 不能为空"));
    return;
  }

  // 勾选"删除密码"时不校验该字段的长度；空密码本身也是合法值
  if ((!staRemove && !fieldLenOKForWPA(staPass)) || (!apRemove && !fieldLenOKForWPA(apPass))) {
    server.send(400, "text/html; charset=utf-8",
                firstSetup ? setupForm("密码为空表示开放网络；如果要设置密码，长度至少应为 8")
                           : settingsForm("密码为空表示保持原值；如果要设置密码，长度至少应为 8"));
    return;
  }

  if (firstSetup) {
    if (adminKey.length() == 0) {
      server.send(400, "text/html; charset=utf-8", setupForm("管理密钥不能为空"));
      return;
    }
    cfg.staSsid = staSsid;
    cfg.staPass = staRemove ? "" : staPass;
    cfg.apSsid  = apSsid;
    cfg.apPass  = apRemove  ? "" : apPass;
    cfg.adminKey = adminKey;
  } else {
    cfg.staSsid = staSsid;

    if (staRemove) {
      cfg.staPass = "";
    } else if (staPass.length() > 0) {
      cfg.staPass = staPass;
    }
    cfg.apSsid = apSsid;
    if (apRemove) {
      cfg.apPass = "";
    } else if (apPass.length() > 0) {
      cfg.apPass = apPass;
    }
    if (adminKey.length() > 0) {
      cfg.adminKey = adminKey;
      sessionToken = "";   // 修改了管理密钥后，强制重新登录
      adminAuthed = false;
    }
  }

  if (!saveSettings()) {
    server.send(500, "text/html; charset=utf-8",
                firstSetup ? setupForm("保存失败") : settingsForm("保存失败"));
    return;
  }

  String msg = firstSetup ? "不论何时何地，爱莉希雅都会回应你的期待。" : "无论何时何地，爱莉希雅都在这里，回应你的期待。";
  server.send(200, "text/html; charset=utf-8", pageShell("已保存",
                String("<h1>已保存</h1><div class='ok'>") + htmlEscape(msg) +
                "</div><div class='muted'>正在重新启动……</div>"));

  requestRestart(1000);
}

void handleLogout() {
  adminAuthed = false;
  sessionToken = "";
  server.sendHeader("Set-Cookie", "ESP32SESS=deleted; Path=/; Max-Age=0");
  server.sendHeader("Location", "/");
  server.send(303);
}

void handleNotFound() {
  server.sendHeader("Location", "/");
  server.send(303);
}

void handleSerialResetLine(const String& lineRaw) {
  String line = lineRaw;
  line.trim();

  if (line == "AT+RESET") {
    Serial.println("OK");
    Serial.println("RESETTING...");
    clearAllSettings();
  }
}

void processSerial() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();

    if (c == '\r') {
      continue;
    }

    if (c == '\n') {
      if (serialLine.length() > 0) {
        handleSerialResetLine(serialLine);
        serialLine = "";
      }
    } else {
      if (serialLine.length() < 128) {
        serialLine += c;
      }
    }
  }
}

void setupWebServer() {
  const char* headerKeys[] = { "Cookie" };
  server.collectHeaders(headerKeys, 1);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/login", HTTP_POST, handleLogin);
  server.on("/save", HTTP_POST, handleSave);
  server.on("/logout", HTTP_POST, handleLogout);
  server.onNotFound(handleNotFound);
  server.begin();
}

void onEvent(arduino_event_id_t event, arduino_event_info_t info) {
  switch (event) {
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.println("[WiFi] STA Got IP");
      Serial.println(WiFi.STA);
      WiFi.AP.enableNAPT(true);
      natEnabled = true;
      Serial.println("[NAT] Enabled");
      break;

    case ARDUINO_EVENT_WIFI_STA_LOST_IP:
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      WiFi.AP.enableNAPT(false);
      natEnabled = false;
      Serial.println("[NAT] Disabled");
      break;

    default:
      break;
  }
}

void setup() {
  Serial.begin(115200, SERIAL_8N1);
  delay(300);

  Serial.println();
  Serial.println("Booting...");

  Network.onEvent(onEvent);

  loadSettings();

  if (!cfg.valid) {
    Serial.println("[CFG] No saved config, entering first-setup mode");

    WiFi.mode(WIFI_AP);
    WiFi.setSleep(false);
    WiFi.softAPConfig(AP_IP, AP_GW, AP_SUBNET);

    // 首次没有配置时，先开一个开放热点，方便访问配置页
    WiFi.softAP("Elysian Realm Setup", "11111111");

    Serial.print("[WiFi] Setup AP IP: ");
    Serial.println(WiFi.softAPIP());
  } else {
    Serial.println("[CFG] Config loaded, starting STA + AP");
    startWiFi();
  }

  setupWebServer();
}

void loop() {
  server.handleClient();
  processSerial();

  if (restartPending && (long)(millis() - restartAtMs) >= 0) {
    delay(50);
    ESP.restart();
  }
}
