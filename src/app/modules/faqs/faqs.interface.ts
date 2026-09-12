
import { Model } from 'mongoose';

export interface IFaqs {
    question: string;
    answer: string;
    isDeleted: boolean;
}

export type IFaqsModules = Model<IFaqs, Record<string, unknown>>;