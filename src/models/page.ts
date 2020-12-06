/**
 * Augments an existing type to add page-related fields
 */
export interface Paged<T> {
    totalResults: number,
    totalPages: number,
    page: number,
    limit: number,
    data: T[]
}
