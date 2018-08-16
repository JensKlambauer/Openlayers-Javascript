import { PostRequest } from "./AjaxRequest";

export default class WebApiConnection {
    constructor(url) {
        this.url = url;
    }

    get tokenWebApi() {
        return this.token;
    }

    async getAccessToken() {
        var loginData = "grant_type=password&username=" + encodeURIComponent(process.env.API_USER) + "&password=" + encodeURIComponent(process.env.API_PASS);
        // let json = JSON.stringify(loginData);
        var access_tokens = await PostRequest(this.url, loginData);
        this.token = JSON.parse(access_tokens);
    }

    async postPrintData(data, token) {
        let json = JSON.stringify(data);
        await PostRequest('http://localhost:55555/api/v1/Print/PrintMap', json, token);
    }

    // async postStreckeDaten(data, token) {
    //     let json = JSON.stringify(data);
    //     await PostRequest("http://localhost:55555/api/v1/Print/Strecke", json, token);
    // }
}