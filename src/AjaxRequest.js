export function GetRequest(url, token) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.response)
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }
        }
        xhr.ontimeout = function () {
            reject('timeout')
        }
        xhr.open('get', url, true)
        if(token)
        {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token );
        }
        xhr.send()    
    })
}

export function PostRequest(url, data, token) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.response)
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }
        }
        xhr.ontimeout = function () {
            reject('timeout')
        }
        xhr.open("POST", url, true);
        if(token)
        {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token );
        }
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(JSON.stringify(data));   
    })
}