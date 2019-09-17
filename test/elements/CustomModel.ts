
export class CustomModel {
    static readonly defaultValue = 100;

    readonly name = "CustomModelWithPublicProp";

    constructor(public value: number = CustomModel.defaultValue) {

    }
}
