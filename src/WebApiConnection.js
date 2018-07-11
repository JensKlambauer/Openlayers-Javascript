import { PostRequest } from "./AjaxRequest";

export default class WebApiConnection {
    constructor(url) {
        this.url = url;
    }

    async getAccessToken() {
        var loginData = {
            grant_type: 'password',
            username: 'admin@example.de',
            password: 'Admin+1'
        };

        var loginData = "grant_type=password&username=" + encodeURIComponent('admin@example.de')+ "&password=" + encodeURIComponent('Admin+1');
        // let json = JSON.stringify(loginData);
        var access_tokens = await PostRequest(this.url, loginData);
        return JSON.parse(access_tokens);
    }

    // async postStreckeDaten(data, token) {
    //     let json = JSON.stringify(data);
    //     await PostRequest("http://localhost:55555/api/v1/Print/Strecke", json, token);
    // }
}