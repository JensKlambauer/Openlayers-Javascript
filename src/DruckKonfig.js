import { GetRequest } from "./AjaxRequest";

export default class PrintConfig {
    constructor(token) {
        this.token = token;
    }

    async listTemplates() {
        const apiUrl = `http://localhost:55555/api/v1/Print/ComposerTemplates`;
        return await GetRequest(apiUrl, this.token);
    }
}