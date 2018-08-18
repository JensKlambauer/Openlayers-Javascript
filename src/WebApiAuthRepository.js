import { PostRequest } from "./AjaxRequest";

export default class WebApiAuthRepository {
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
}