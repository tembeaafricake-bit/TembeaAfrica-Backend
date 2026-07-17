export interface SeedConfig {
    clearCollections: boolean;
    collections: {
        [key: string]: any[];
    };
}
export declare function generateSeedData(): Promise<SeedConfig>;
