export declare const getRecommendations: (userId: string) => Promise<{
    id: string;
    location: string;
    createdAt: Date;
    title: string;
    sector: string;
    requiredSkills: string[];
    duration: string;
    stipend: string;
    applyLink: string;
    description: string;
    postedBy: string;
}[]>;
//# sourceMappingURL=recommendationService.d.ts.map