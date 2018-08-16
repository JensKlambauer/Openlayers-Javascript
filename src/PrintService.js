import WebApiConnection from './WebApiConnection';
import PrintConfig from './PrintConfig';

export default class PrintService {
    constructor() {
        this.webApiTokenUrl = process.env.API_TOKEN_URL;
    }

    async getApiAccessToken() {
        this.connection = new WebApiConnection(this.webApiTokenUrl);
        await this.connection.getAccessToken();
        this.token = this.connection.tokenWebApi['access_token'];
    }

    async getTemplates() {
        const printConfig = new PrintConfig(this.token);
        return await printConfig.listTemplates();
    }

    async getScales() {
        const printConfig = new PrintConfig(this.token);
        return await printConfig.listMapScales();
    }

    async postPrintData(data) {
        await this.connection.postPrintData(data, this.token);
    }
} 