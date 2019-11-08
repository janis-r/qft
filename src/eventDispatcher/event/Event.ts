/**
 * Basic event class which holds event type and data properties and which can be used as it is or
 * could be extended by any custom event class.
 */
export class Event {

    private _defaultPrevented: boolean = false;
    private _defaultPreventedReason: string;

    /**
     * Create new event.
     * @param type Event string type
     * @param data Data shipped along with event notification, if any
     */
    constructor(public readonly type: string, public readonly data?: any) {
    }

    /**
     * Flag which indicates that somewhere within event listeners default event action has been prevented
     * @returns {boolean}
     */
    get defaultPrevented(): boolean {
        return this._defaultPrevented;
    }

    /**
     * Optional reason notion of why default action was prevented.
     */
    get defaultPreventedReason(): string {
        return this._defaultPreventedReason;
    }

    /**
     * Prevent event default action
     */
    preventDefault(reason?: string): void {
        this._defaultPrevented = true;
        this._defaultPreventedReason = reason;
    }

    /**
     * Get a string representation of the event
     * @returns {string}
     */
    readonly toString = () => `[Event type=${this.type}, data=${this.data}, defaultPrevented=${this._defaultPrevented}]`;

}
