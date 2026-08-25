export interface PropertySearchQuery {
    county?: string | string[];
    propertyType?: string | string[];
    status?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    sortBy?: 'newest' | 'oldest' | 'lowest' | 'highest';
    lat?: string;
    lng?: string;
    page?: string;
    limit?: string;
    searchTerm?: string;
}

export const toArray = (value?: string | string[]): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(',').map((v) => v.trim()).filter(Boolean);
};