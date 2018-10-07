import { GetRequest, PostRequest, GetRequestFetch } from "./AjaxRequest";

export default class PrintRepository {
    constructor(token) {
        this.token = token;
    }

    async listTemplates() {
        const apiUrl = process.env.API_PRINT_URL + `/ComposerTemplates`;        
        return await GetRequest(apiUrl, this.token);
    }

    async listMapScales() {
        const apiUrl = process.env.API_PRINT_URL + `/GetScales`;        
        return await GetRequest(apiUrl, this.token);
    }    

    async postPrintData(data) {
        let json = JSON.stringify(data);
        await PostRequest(process.env.API_PRINT_URL + '/PrintMap', json, this.token);
    }

    async getFeatures(idProj) {
        const apiUrl = process.env.API_PRINT_URL + `/Features/` + idProj;        
        return await GetRequestFetch(apiUrl, this.token);
    }  
}