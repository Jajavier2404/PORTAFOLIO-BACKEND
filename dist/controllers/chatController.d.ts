import { Request, Response } from 'express';
export declare const chatController: {
    createMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addAssistantMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getChat(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllChats(req: Request, res: Response): Promise<void>;
    getChatStats(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=chatController.d.ts.map