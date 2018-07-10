import Request from "./AjaxRequest";

export default class PrintConfig {
    constructor () {        
    }

    async listTemplates() {
        const apiUrl = `http://localhost:55555/api/v1/Print/ComposerTemplates`;    
        return await Request(apiUrl, '4c8DS6Y8rGPxA3HMkbWNz6bX5XyKih-b4C_PKkeKYiqmctE3tC7F3i6g2vTF8wDO7QtyNQ577ogCvxwOOHoK4jkWYv4Wqbe57tHL6tbVzXUoRNWkBToiJ5_7JvSvIpo25TdIsSthWYtlhxOt5gxNi_GebGanMmWLM2os8DJd8-QzqkombdVni1Agcey2ndEjA7mw3QW2gKAze2qVEwgcCRZ22JnxofpYaMgOfSfuljn7L7GJ_a2FCZyhtsrFX74E7l1Tc48Gvoir0bx1k9Q-e3sVebuxpFB5U_h-rWX6hBz6T3NL0uj9EWO2qvZuKpwYcUyqZcCuQMJkdPLLyZi5vRauagophxDF1JQtx4k6lNaUdQqQldX4XymhShwAsPv1YgIrnSCSwGF2taxv-ueC_j6Y_KrDPf_nmEDXvaLsvZ7iq-6S8cuica8Yheam-5xbAYdVsIkK_QtbQAcOXVkUNpaDnjrnvCs79vETyWWcDFIp7V4J5HR1yoELSwhdkUeUdbCzzwM1OSOldom_vKFyiQ');
    }
}