import { z } from 'zod';
import {
    FINANCING_TYPES,
    CLOSING_COST_OPTIONS,
    POSSESSION_OPTIONS,
} from './offer.constants';



const currency = (label: string) =>
    z.coerce
        .number({ invalid_type_error: `${label} must be a number` })
        .nonnegative(`${label} cannot be negative`);

const optionalDays = z.coerce
    .number({ invalid_type_error: 'Enter a whole number of days' })
    .int('Enter a whole number of days')
    .min(0)
    .max(365)
    .optional();

const documentSchema = z.object({
    name: z.string(),
    size: z.string(),
    updated: z.string(),
    url: z.string(),
});

// Shared terms shape — used for both the initial offer and every counter
const offerTermsSchema = z
    .object({
        offerAmount: currency('Offer amount').min(1, 'Offer amount is required'),
        earnestMoney: currency('Earnest money'),
        financingType: z.enum(FINANCING_TYPES, {
            required_error: 'Select a financing type',
        }),
        otherFinancingType: z.string().max(120).optional(),
        financingTerms: z.string().max(1000).optional(),

        closingCostOption: z.enum(CLOSING_COST_OPTIONS),
        sellerContribution: currency('Seller contribution').optional(),

        inspectionContingency: z.enum(['yes', 'no'], {
            required_error: 'Select an inspection contingency option',
        }),
        inspectionDays: optionalDays,
        appraisalContingency: z.enum(['yes', 'no'], {
            required_error: 'Select an appraisal option',
        }),
        appraisalDays: optionalDays,

        hasAgent: z.enum(['yes', 'no'], {
            required_error: "Let us know if you're working with an agent",
        }),
        agentName: z.string().max(120).optional(),
        brokerageName: z.string().max(120).optional(),
        commission: z.string().max(20).optional(),
        paidBy: z.enum(['buyer', 'seller']).optional(),

        personalPropertyIncluded: z.string().max(2000).optional(),
        itemsToBeRemoved: z.string().max(2000).optional(),

        titleCompany: z.string().max(200).optional(),
        closingDate: z
            .string()
            .optional()
            .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date'),
        possession: z.enum(POSSESSION_OPTIONS).optional(),
        sellerPostClosingDays: optionalDays,

        additionalTerms: z.string().max(3000).optional(),
        notesToSeller: z.string().max(2000).optional(),


    })
    .superRefine((data, ctx) => {
        if (data.financingType !== 'cash' && !data.financingTerms?.trim()) {
            ctx.addIssue({
                path: ['financingTerms'],
                code: z.ZodIssueCode.custom,
                message: 'Describe the financing terms',
            });
        }
        if (data.financingType === 'other' && !data.otherFinancingType?.trim()) {
            ctx.addIssue({
                path: ['otherFinancingType'],
                code: z.ZodIssueCode.custom,
                message: 'Please specify the financing type',
            });
        }
        if (
            data.closingCostOption === 'requested' &&
            (data.sellerContribution === undefined || data.sellerContribution <= 0)
        ) {
            ctx.addIssue({
                path: ['sellerContribution'],
                code: z.ZodIssueCode.custom,
                message: 'Enter the requested seller contribution',
            });
        }
        if (
            data.inspectionContingency === 'yes' &&
            (data.inspectionDays === undefined || data.inspectionDays <= 0)
        ) {
            ctx.addIssue({
                path: ['inspectionDays'],
                code: z.ZodIssueCode.custom,
                message: 'Enter the number of days for inspection',
            });
        }
        if (
            data.appraisalContingency === 'yes' &&
            (data.appraisalDays === undefined || data.appraisalDays <= 0)
        ) {
            ctx.addIssue({
                path: ['appraisalDays'],
                code: z.ZodIssueCode.custom,
                message: 'Enter the number of days for appraisal',
            });
        }
        if (data.hasAgent === 'yes') {
            if (!data.agentName?.trim()) {
                ctx.addIssue({
                    path: ['agentName'],
                    code: z.ZodIssueCode.custom,
                    message: 'Agent name is required',
                });
            }
            if (!data.brokerageName?.trim()) {
                ctx.addIssue({
                    path: ['brokerageName'],
                    code: z.ZodIssueCode.custom,
                    message: 'Brokerage name is required',
                });
            }
            if (!data.commission?.trim()) {
                ctx.addIssue({
                    path: ['commission'],
                    code: z.ZodIssueCode.custom,
                    message: 'Enter a commission amount or percentage',
                });
            }
            if (!data.paidBy) {
                ctx.addIssue({
                    path: ['paidBy'],
                    code: z.ZodIssueCode.custom,
                    message: 'Select who pays the commission',
                });
            }
        }
    });

// POST /offers — buyer's initial offer
const createOfferValidationSchema = z.object({
    body: z.object({
        property: z.string({ required_error: 'Property is required' }),
        terms: offerTermsSchema,
        supportingDocuments: z.array(documentSchema).optional(),
    }),
});

// PATCH /offers/:id/counter — either party submits a counter
const counterOfferValidationSchema = z.object({
    body: z.object({
        terms: offerTermsSchema,
        supportingDocuments: z.array(documentSchema).optional(),
    }),
});

// PATCH /offers/:id/accept | /reject | /withdraw — no body needed, just an optional note
const respondToOfferValidationSchema = z.object({
    body: z.object({
        note: z.string().max(1000).optional(),
    }),
});

export const offerValidation = {
    createOfferValidationSchema,
    counterOfferValidationSchema,
    respondToOfferValidationSchema,
};