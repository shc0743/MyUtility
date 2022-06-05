import requests

url = 'http://localhost:4307/pctr/newrec.php'
data = { type: 'b' }
count = 1000
cookie = { 'pctr_d62bbfa1d418': 'Your password here' }
for i in range(count*2) :
    if i%2 == 0 :
        data['type'] = 'b'
    else:
        data['type'] = 'e'
    r = requests.get(url, data, cookies=cookie)
    print(r)
