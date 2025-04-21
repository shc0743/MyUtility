import sqlite3
from datetime import datetime, timedelta, timezone
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from typing import List, Optional, Dict, Any
import click
import textwrap

# 数据库初始化
def init_db(db_path: str = "certificates.db") -> None:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        sans TEXT,
        issue_date TEXT,
        expiry_date TEXT NOT NULL,
        fingerprint TEXT NOT NULL,
        notes TEXT
    )
    """)
    
    # 创建索引以提高查询性能
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_domain ON certificates (domain)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_expiry ON certificates (expiry_date)")
    
    conn.commit()
    conn.close()

# 证书解析工具函数
def parse_certificate(cert_path: str) -> Dict[str, Any]:
    with open(cert_path, 'rb') as f:
        cert_data = f.read()
    
    cert = x509.load_pem_x509_certificate(cert_data, default_backend())
    
    # 获取SAN列表
    sans = []
    try:
        ext = cert.extensions.get_extension_for_class(x509.SubjectAlternativeName)
        sans = ext.value.get_values_for_type(x509.DNSName)
    except x509.ExtensionNotFound:
        pass  # 如果没有SAN扩展，则保持为空列表

    # 获取主体域名
    domain = cert.subject.get_attributes_for_oid(x509.NameOID.COMMON_NAME)[0].value

    return {
        "domain": domain,
        "sans": ", ".join(sans) if sans else None,
        "issue_date": cert.not_valid_before_utc.isoformat(),  # 修复警告
        "expiry_date": cert.not_valid_after_utc.isoformat(),  # 修复警告
        "fingerprint": cert.fingerprint(hashes.SHA256()).hex(),
    }

# 数据库操作类
class CertificateDB:
    def __init__(self, db_path: str = "certificates.db"):
        self.db_path = db_path
        init_db(db_path)
    
    def _get_conn(self):
        return sqlite3.connect(self.db_path)
    
    def add_certificate(
        self,
        domain: str,
        expiry_date: str,
        fingerprint: str,
        sans: Optional[str] = None,
        issue_date: Optional[str] = None,
        notes: Optional[str] = None
    ) -> int:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO certificates (
                domain, sans, issue_date, expiry_date, fingerprint, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
            """, (domain, sans, issue_date, expiry_date, fingerprint, notes))
            return cursor.lastrowid
    
    def get_certificate(self, cert_id: int) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, domain, sans, issue_date, expiry_date, fingerprint, notes
            FROM certificates WHERE id = ?
            """, (cert_id,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row[0],
                    "domain": row[1],
                    "sans": row[2],
                    "issue_date": row[3],
                    "expiry_date": row[4],
                    "fingerprint": row[5],
                    "notes": row[6]
                }
            return None
    
    def list_certificates(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, domain, sans, issue_date, expiry_date, fingerprint, notes
            FROM certificates ORDER BY expiry_date
            """)
            return [
                {
                    "id": row[0],
                    "domain": row[1],
                    "sans": row[2],
                    "issue_date": row[3],
                    "expiry_date": row[4],
                    "fingerprint": row[5],
                    "notes": row[6]
                }
                for row in cursor.fetchall()
            ]
    
    def update_certificate(
        self,
        cert_id: int,
        domain: Optional[str] = None,
        sans: Optional[str] = None,
        issue_date: Optional[str] = None,
        expiry_date: Optional[str] = None,
        fingerprint: Optional[str] = None,
        notes: Optional[str] = None
    ) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            # 构建更新语句
            updates = []
            params = []
            
            if domain is not None:
                updates.append("domain = ?")
                params.append(domain)
            if sans is not None:
                updates.append("sans = ?")
                params.append(sans)
            if issue_date is not None:
                updates.append("issue_date = ?")
                params.append(issue_date)
            if expiry_date is not None:
                updates.append("expiry_date = ?")
                params.append(expiry_date)
            if fingerprint is not None:
                updates.append("fingerprint = ?")
                params.append(fingerprint)
            if notes is not None:
                updates.append("notes = ?")
                params.append(notes)
            
            if not updates:
                return False
                
            query = f"UPDATE certificates SET {', '.join(updates)} WHERE id = ?"
            params.append(cert_id)
            
            cursor.execute(query, params)
            return cursor.rowcount > 0
    
    def delete_certificate(self, cert_id: int) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM certificates WHERE id = ?", (cert_id,))
            return cursor.rowcount > 0
    
    def search_certificates(self, keyword: str) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, domain, sans, issue_date, expiry_date, fingerprint, notes
            FROM certificates 
            WHERE domain LIKE ? OR sans LIKE ? OR notes LIKE ?
            ORDER BY expiry_date
            """, (f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"))
            return [
                {
                    "id": row[0],
                    "domain": row[1],
                    "sans": row[2],
                    "issue_date": row[3],
                    "expiry_date": row[4],
                    "fingerprint": row[5],
                    "notes": row[6]
                }
                for row in cursor.fetchall()
            ]

# CLI界面
@click.group()
def cli():
    """证书管理CLI工具"""
    pass

@cli.command()
def init():
    """初始化数据库"""
    init_db()
    click.echo("数据库已初始化")

def display_certificate(cert: Dict[str, Any]):
    click.echo("\n证书详情:")
    click.echo(f"ID: {cert['id']}")
    click.echo(f"域名: {cert['domain']}")
    click.echo(f"SAN列表: {cert['sans'] or '无'}")
    click.echo(f"签发时间: {cert['issue_date'] or '未知'}")
    click.echo(f"过期时间: {cert['expiry_date']}")
    click.echo(f"指纹(SHA256): {cert['fingerprint']}")
    click.echo(f"备注: {textwrap.fill(cert['notes'] or '无', width=70)}")

@cli.command()
@click.option('--domain', prompt='域名', help='证书主体域名')
@click.option('--expiry', prompt='过期时间 (YYYY-MM-DD)', help='证书过期时间')
@click.option('--fingerprint', prompt='证书指纹(SHA256)', help='证书指纹')
@click.option('--sans', help='SAN列表(逗号分隔)', default="")
@click.option('--issue-date', help='签发时间 (YYYY-MM-DD)', default=None)
@click.option('--notes', help='备注信息', default=None)
def add(domain, expiry, fingerprint, sans, issue_date, notes):
    """手动添加证书"""
    db = CertificateDB()
    cert_id = db.add_certificate(
        domain=domain,
        sans=sans if sans else None,
        issue_date=issue_date,
        expiry_date=expiry,
        fingerprint=fingerprint,
        notes=notes
    )
    click.echo(f"证书已添加，ID: {cert_id}")

@cli.command()
@click.argument('cert_path', type=click.Path(exists=True))
@click.option('--notes', help='备注信息', default=None)
def scan(cert_path, notes):
    """从证书文件添加证书"""
    try:
        cert_info = parse_certificate(cert_path)
        db = CertificateDB()
        cert_id = db.add_certificate(
            domain=cert_info['domain'],
            sans=cert_info['sans'],
            issue_date=cert_info['issue_date'],
            expiry_date=cert_info['expiry_date'],
            fingerprint=cert_info['fingerprint'],
            notes=notes
        )
        click.echo(f"证书已从文件添加，ID: {cert_id}")
    except Exception as e:
        click.echo(f"错误: {str(e)}", err=True)

@cli.command()
@click.option('--verbose', '-v', is_flag=True, help='显示详细信息')
def list(verbose):
    """列出所有证书"""
    db = CertificateDB()
    certs = db.list_certificates()
    
    if not certs:
        click.echo("数据库中没有证书")
        return

    click.echo("证书列表:")
    if verbose:
        for cert in certs:
            click.echo("-" * 40)
            display_certificate(cert)
    else:
        click.echo("ID  域名                过期时间")
        click.echo("--------------------------------")
        for cert in certs:
            domain_display = cert['domain'][:20] + '...' if len(cert['domain']) > 20 else cert['domain']
            expiry_date = cert['expiry_date'][:10]  # 只显示日期部分
            click.echo(f"{cert['id']:<4} {domain_display:<20} {expiry_date}")

@cli.command()
@click.argument('keyword')
@click.option('--verbose', '-v', is_flag=True, help='显示详细信息')
def search(keyword, verbose):
    """搜索证书"""
    db = CertificateDB()
    certs = db.search_certificates(keyword)
    
    if not certs:
        click.echo("没有找到匹配的证书")
        return
    
    if verbose:
        for cert in certs:
            display_certificate(cert)
            click.echo("-" * 40)
    else:
        click.echo(f"找到 {len(certs)} 条匹配结果:")
        click.echo("ID  域名                过期时间")
        click.echo("--------------------------------")
        for cert in certs:
            domain_display = cert['domain'][:20] + '...' if len(cert['domain']) > 20 else cert['domain']
            expiry_date = cert['expiry_date'][:10]
            click.echo(f"{cert['id']:<4} {domain_display:<20} {expiry_date}")

@cli.command()
@click.argument('cert_id', type=int)
def show(cert_id):
    """显示证书详情"""
    db = CertificateDB()
    cert = db.get_certificate(cert_id)
    
    if cert:
        display_certificate(cert)
    else:
        click.echo(f"未找到ID为{cert_id}的证书", err=True)

@cli.command()
@click.argument('cert_id', type=int)
@click.option('--domain', help='新的域名')
@click.option('--sans', help='新的SAN列表')
@click.option('--issue-date', help='新的签发时间')
@click.option('--expiry', help='新的过期时间')
@click.option('--fingerprint', help='新的指纹')
@click.option('--notes', help='新的备注')
def update(cert_id, domain, sans, issue_date, expiry, fingerprint, notes):
    """更新证书信息"""
    db = CertificateDB()
    updated = db.update_certificate(
        cert_id=cert_id,
        domain=domain,
        sans=sans,
        issue_date=issue_date,
        expiry_date=expiry,
        fingerprint=fingerprint,
        notes=notes
    )
    
    if updated:
        click.echo(f"证书ID {cert_id} 已更新")
    else:
        click.echo(f"更新失败或未找到ID为{cert_id}的证书", err=True)

@cli.command()
@click.argument('cert_id', type=int)
def delete(cert_id):
    """删除证书"""
    db = CertificateDB()
    if db.delete_certificate(cert_id):
        click.echo(f"证书ID {cert_id} 已删除")
    else:
        click.echo(f"删除失败或未找到ID为{cert_id}的证书", err=True)

@cli.command()
@click.argument('days', type=int, default=15)
def deadline(days):
    """显示即将在指定天数之后过期的证书（不包括已过期的证书）"""
    db = CertificateDB()
    certs = db.list_certificates()
    
    if not certs:
        click.echo("数据库中没有证书")
        return
    
    now = datetime.now(timezone.utc)  # 使用支持时区的 UTC 时间
    deadline_date = now + timedelta(days=days)
    
    expiring_certs = [
        cert for cert in certs
        if now < datetime.fromisoformat(cert['expiry_date']) <= deadline_date  # 保留时区一致性
    ]
    
    if not expiring_certs:
        click.echo(f"没有证书将在未来 {days} 天内过期")
        return
    
    click.echo(f"\n即将在未来 {days} 天内过期的证书:")
    click.echo("ID  域名                过期时间")
    click.echo("--------------------------------")
    for cert in expiring_certs:
        domain_display = cert['domain'][:20] + '...' if len(cert['domain']) > 20 else cert['domain']
        expiry_date = cert['expiry_date'][:10]  # 只显示日期部分
        click.echo(f"{cert['id']:<4} {domain_display:<20} {expiry_date}")

@cli.command()
def expired():
    """显示已过期的证书"""
    db = CertificateDB()
    certs = db.list_certificates()
    
    if not certs:
        click.echo("数据库中没有证书")
        return
    
    now = datetime.now(timezone.utc)  # 使用支持时区的 UTC 时间
    expired_certs = [
        cert for cert in certs
        if datetime.fromisoformat(cert['expiry_date']) < now  # 保留时区一致性
    ]
    
    if not expired_certs:
        click.echo("没有已过期的证书")
        return
    
    click.echo("\n已过期的证书:")
    for cert in expired_certs:
        click.echo("-" * 40)
        display_certificate(cert)

if __name__ == '__main__':
    cli()