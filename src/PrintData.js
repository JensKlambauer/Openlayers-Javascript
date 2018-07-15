export default class PrintData {  
    constructor(id_projekt) {
        this.id_projekt = id_projekt;
    }
    // constructor(extents, id_projekt, template, scale) {
    //     this.extents = extents;
    //     this.id_projekt = id_projekt;
    //     this.template = template;
    //     this.scale = scale;
    // }

    set set_extents (extents) {
        this.extents = extents;
    }

    set set_template (template) {
        this.template = template;
    }

    set set_scale (scale) {
        this.scale = scale;
    }

    toJSON() {
        return {
            extents: this.extents,
            id_projekt: this.id_projekt,
            template: this.template,
            scale: this.scale
        }
      }
}