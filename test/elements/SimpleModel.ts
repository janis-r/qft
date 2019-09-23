export class SimpleModel {
    static readonly defaultValue = 100;
    readonly name = "CustomModelWithPublicProp";

    constructor(public value: number = SimpleModel.defaultValue) {

    }
}
