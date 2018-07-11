import { PostRequest } from "./AjaxRequest";

export default class WebApiConnection {
    constructor(url) {
        this.url = url;
    }

    getAccessTokenSync() {
        const loginData = {
            grant_type: 'password',
            username: 'admin@example.de',
            password: 'Admin+1'
        };       
        PostRequest (this.url, loginData); 
    }

    async getAccessToken() {
        const loginData = {
            grant_type: 'password',
            username: 'admin@example.de',
            password: 'Admin+1'
        };       
        var access_tokens = await PostRequest (this.url, loginData);
        return JSON.parse(access_tokens);

    }
}