import "whatwg-fetch"


export function GetRequestFetch(url, token) {
    const obj = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        obj.headers.Authorization = 'Bearer ' + token;
    }

    return window.fetch(url, obj)
        .then(function (response) {
            response.status     //=> number 100–599
            response.statusText //=> String
            response.headers    //=> Headers
            response.url        //=> String

            return response.text()
        }, function (error) {
            error.message //=> String
            console.log("Fehler" + error.message)
        })
}

export function PostRequestFetch(url, data, token) {
    const getReq = fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    }).then(function (response) {
        response.status     //=> number 100–599
        response.statusText //=> String
        response.headers    //=> Headers
        response.url        //=> String

        return response.text()
    }, function (error) {
        error.message //=> String
    })
}

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
        if (token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
        xhr.send()
    })
}

export function PostRequest(url, data, token) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        // xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
        // xhr.setRequestHeader('Content-type', 'application/ecmascript');
        // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');        
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        // xhr.onreadystatechange = function (e) {
        //     if (xhr.readyState === 4) {
        //         if (xhr.status === 200) {
        //             resolve(xhr.response)
        //         } else {
        //             reject({
        //                 status: xhr.status,
        //                 statusText: xhr.statusText
        //             });
        //         }
        //     }
        // }
        // xhr.ontimeout = function () {
        //     reject('timeout')
        // }
        if (token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
        // xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        // xhr.setRequestHeader("Accept", "application/json");
        // xhr.data = JSON.stringify(data);
        // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        // xhr.send(data);   // JSON.stringify(data)
        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
    });
}