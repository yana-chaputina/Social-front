export default class Api {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
    }

    get(path, headers = {}, onSuccess = null, onFail = null) {
        this.makeRequest(path, 'GET', {}, null, onSuccess, onFail)
    };

    post(path, data, headers = {}, onSuccess = null, onFail = null) {
        this.makeRequest(path, 'POST', headers, data, onSuccess, onFail);
    };

    delete(path, headers = {}, onSuccess = null, onFail = null) {
        this.makeRequest(path, 'DELETE', headers, null, onSuccess, onFail)
    };

    makeRequest(path, method, headers, body, onSuccess, onError) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, `${this._baseUrl}${path}`);
        for (const [key, value] of Object.entries(headers)) {
            xhr.setRequestHeader(key, value);
        }
        xhr.addEventListener('load', ev => {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (typeof onSuccess === 'function') {
                    onSuccess(xhr.responseText, xhr.status);
                }
                return;
            }

            if (typeof onError === 'function') {
                onError(xhr.responseText, xhr.status);
            }
        });
        xhr.addEventListener('error', ev => {
            if (typeof onError === 'function') {
                onError(JSON.stringify({code: -1, message: 'error.network'}), -1);
            }
        });
        xhr.send(body);
    };
}
