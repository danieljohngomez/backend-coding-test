/**
 * Response of an API when an error occurs
 */
export interface ApiError {
    errorCode: string,
    messages: string[],
}
