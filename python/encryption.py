import hashlib
import random
from binascii import hexlify, unhexlify
import json

def encrypt_data(message, key, phrase=None, N=None):
    try:
        from Crypto.Cipher import AES
        from Crypto.Protocol.KDF import scrypt
        from Crypto.Random import get_random_bytes
    except ImportError as e:
        raise ImportError("pycryptodome is required. Please run pip install pycryptodome") from e
    
    # (1) 生成随机IV (12 bytes for GCM)
    iv = get_random_bytes(12)
    if not N:
        N = 262144
    else:
        try:
            N = int(N)
        except Exception:
            raise ValueError("Invalid N")
    if N > 2097152:
        raise ValueError("N is too large! Your device might be frozen!")
    
    # (2) 生成salt
    if not phrase:
        phrases = ['Furina', 'Neuvillette', 'Furina de Fontaine', 'Venti', 'Nahida']
        phrase = random.choice(phrases)
    salt = get_random_bytes(64)
    parameter = f"{phrase}:{hexlify(salt).decode('ascii')}"
    
    # (3) 生成加密密钥
    key = hashlib.sha256(key.encode('utf-8')).digest()
    key_input = f'MyEncryption/1.1 Fontaine/4.2 Natlan/5.5 Iv/{hexlify(iv).decode("ascii")} user_parameter={parameter} user_key={key}'
    
    # 使用Scrypt进行密钥派生 (pycryptodome没有PBKDF2HMAC，使用Scrypt作为替代)
    derived_key = scrypt(
        password=key_input.encode('utf-8'),
        salt=salt,
        key_len=32,  # AES-256需要32字节密钥
        N=N,     # CPU/内存成本参数
        r=8,         # 块大小参数
        p=1          # 并行化参数
    )
    
    # (4) 加密消息
    cipher = AES.new(derived_key, AES.MODE_GCM, nonce=iv)
    
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    ciphertext, tag = cipher.encrypt_and_digest(message)
    
    # 组合IV + 密文 + 认证标签
    encrypted_message = iv + ciphertext + tag
    message_encrypted = hexlify(encrypted_message).decode('ascii').lower()
    
    ##return (message_encrypted, hexlify(parameter.encode('utf-8')).decode('ascii'))
    #return (message_encrypted, parameter)
    return json.dumps({"type":"v5.5","data":message_encrypted,"parameter":parameter,"N":N})

def decrypt_data(message_encrypted, key):
    try:
        from Crypto.Cipher import AES
        from Crypto.Protocol.KDF import scrypt
    except ImportError as e:
        raise ImportError("pycryptodome is required. Please run pip install pycryptodome") from e

    # 将十六进制字符串转换回字节
    try:
        jsoned = json.loads(message_encrypted)
        message_encrypted = jsoned.get("data")
        parameter = jsoned.get("parameter")
        N = int(jsoned.get("N"))
        encrypted_data = unhexlify(message_encrypted)
        #parameter = unhexlify(parameter)
        phrase, salt_b64 = parameter.split(':')
        salt = unhexlify(salt_b64)
    except Exception as e:
        raise ValueError("The message or parameters are bad.") from e

    # 提取 IV (前12字节)、密文和认证标签(最后16字节)
    if len(encrypted_data) < 28:  # 12 (IV) + 16 (tag)
        raise ValueError("The message was too short.")

    iv = encrypted_data[:12]
    ciphertext = encrypted_data[12:-16]
    tag = encrypted_data[-16:]

    # (3) 重新生成加密密钥 (与加密过程相同)
    key = hashlib.sha256(key.encode('utf-8')).digest()
    key_input = f'MyEncryption/1.1 Fontaine/4.2 Natlan/5.5 Iv/{hexlify(iv).decode("ascii")} user_parameter={parameter} user_key={key}'
    
    derived_key = scrypt(password=key_input.encode('utf-8'), salt=salt, key_len=32, N=N, r=8, p=1)

    # 解密
    try:
        cipher = AES.new(derived_key, AES.MODE_GCM, nonce=iv)
        decrypted_data = cipher.decrypt_and_verify(ciphertext, tag)
    #except ValueError as e:
    #    #raise ValueError("解密失败 - 可能是密钥、salt或消息被篡改") from e
    except BaseException as e:
        raise e

    # 尝试解码为UTF-8字符串，如果不是则返回字节
    try:
        return decrypted_data.decode('utf-8')
    except UnicodeDecodeError:
        return decrypted_data
