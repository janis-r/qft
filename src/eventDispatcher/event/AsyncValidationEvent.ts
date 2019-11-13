import {Event} from "./Event";

/**
 * Async validation event which is spawned when some change of state must be validated by third parties and make
 * it possible to execute any number of validators to it, where first validator that return anything else but true
 * will be taken as a validation failure.
 */
export class AsyncValidationEvent<E> extends Event {

    private validators: Validator<E>[] = [];

    constructor(type: Event['type'], data?: Event['data']) {
        super(type, data);
    }

    /**
     * Add validator in form of function which returns true if validation has passed of anything else that is taken
     * as an error.
     * @param validators
     */
    readonly addValidator = (...validators: Validator<E>[]) => this.validators.push(...validators);

    /**
     * Launch validators one by one in sequence they've been added to list and halt as any returns error or we run
     * out of them.
     */
    readonly validate = async (): Promise<true | E> => {
        for (const validator of this.validators) {
            const result = await validator();
            if (result !== true) {
                this.preventDefault();
                return result;
            }
        }
        return true;
    }
}

type Validator<E> = () => Promise<true | E>;
