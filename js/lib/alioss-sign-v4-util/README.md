**Notice**: Currently this library **CANNOT** sign with a STS token. Will be added later.

**Notice**: If you give a `string` url, we'll process it automatically. However, if you give a `URL` Object, please remember to pre-process:

```js
url = new URL(encodeURIComponent(url.href).replace(/\%2F/ig, '/'));
```

# Usage

```js
import { sign_url } from 'alioss-sign-v4-util';

const url = 'https://your-bucket.oss-cn-hangzhou.aliyuncs.com/test.txt';
// The following parameters are required for the V4 signature
const ak = 'your-access-key-id', sk = 'your-access-key-secret';
const bucket = 'your-bucket', region = 'oss-cn-hangzhou';

// sign the url
const signed = await sign_url(url, {
    access_key_id: ak,
    access_key_secret: sk,
    additionalHeadersList: {}, // optional
    base_url: undefined, // not necessary
    expires: 60, // optional, default is 60 seconds
    bucket: bucket,
    region: region,
    method: 'GET', // optional, default is 'GET'
});
// then you can GET the signed url.
// If you want to PUT a file, you can use the same url, but change the method to 'PUT'.
// Please note that you must use 'Content-Type' to PUT, because browser will send the header if you do not set it manually.
const headers = {
    "Content-Type": "text/plain; charset=utf-8", // do not forget to set charset
}
const signedPut = await sign_url(url, {
    access_key_id: ak,
    access_key_secret: sk,
    additionalHeadersList: headers, // optional in GET, but **MUST** be set if you want to PUT a file
    expires: 60, // optional, default is 60 seconds
    bucket: bucket,
    region: region,
    method: 'PUT',
});
// then you can PUT the file to the signed url.
const resp = await fetch(signedPut, {
    method: 'PUT',
    headers: headers,
    body: 'Hello World',
});

// To DELETE, the 'Content-Type' header is not necessary.
```

```js
// Examples of sign_header
import { sign_header } from 'alioss-sign-v4-util';
// common params...
const url = 'https://your-bucket.oss-cn-hangzhou.aliyuncs.com/test.txt';
const ak = 'your-access-key-id', sk = 'your-access-key-secret';
const bucket = 'your-bucket', region = 'oss-cn-hangzhou';

// send the request
const resp = await fetch(url, {
    method: 'GET',
    headers: {
        "Authorization": await sign_header(url, {
            access_key_id: ak,
            access_key_secret: sk,
            // additionalHeadersList: {}, // optional
            expires: 60, // optional, default is 60 seconds
            bucket: bucket,
            region: region,
            method: 'GET', // optional, default is 'GET'
        }),
    }
});
// then you can proceed the response

/// Same as above. For PUT you need to set the 'Content-Type' header.
```

# Security

We use `crypto-js` to create the HMAC SHA256, so it *should* be secure. 

# Known Issues

- The `sign_url` function is not compatible with STS tokens. We will add this feature later.
- Lack of `d.ts` file. We will add this feature later.

# License

[Unlicense](https://unlicense.org/) - This is free and unencumbered software released into the public domain.
You can do whatever you want with it. No warranty is given.