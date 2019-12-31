import {Event} from "../event/Event";
/**
 * Describes a method that is used to guard execution or certain action and validates data on whether it is
 * worth of execution
 */
export interface EventGuard<E extends Event = Event> {
    /**
     * Return true in case if guard function is letting execution get through or false if
     * execution should be prevented.
     * @param event Optional Event object that is causing execution.
     * @returns {boolean} True in case if guard function is letting execution through or false if
     * execution should be prevented.
     */
    (event?: E): boolean;
}
