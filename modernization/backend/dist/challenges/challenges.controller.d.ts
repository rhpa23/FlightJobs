export declare class ChallengesController {
    findAll(): any[];
    findOne(id: number): {
        id: number;
    };
    create(createChallengeDto: any): any;
    remove(id: number): {
        message: string;
    };
}
