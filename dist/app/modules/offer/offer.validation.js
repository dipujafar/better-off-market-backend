"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerValidation = void 0;
const zod_1 = require("zod");
const offer_constants_1 = require("./offer.constants");
const currency = (label) => zod_1.z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .nonnegative(`${label} cannot be negative`);
const optionalDays = zod_1.z.coerce
    .number({ invalid_type_error: 'Enter a whole number of days' })
    .int('Enter a whole number of days')
    .min(0)
    .max(365)
    .optional();
const documentSchema = zod_1.z.object({
    name: zod_1.z.string(),
    size: zod_1.z.string(),
    updated: zod_1.z.string(),
    url: zod_1.z.string(),
});
// Shared terms shape — used for both the initial offer and every counter
const offerTermsSchema = zod_1.z
    .object({
    offerAmount: currency('Offer amount').min(1, 'Offer amount is required'),
    earnestMoney: currency('Earnest money'),
    financingType: zod_1.z.enum(offer_constants_1.FINANCING_TYPES, {
        required_error: 'Select a financing type',
    }),
    otherFinancingType: zod_1.z.string().max(120).optional(),
    financingTerms: zod_1.z.string().max(1000).optional(),
    closingCostOption: zod_1.z.enum(offer_constants_1.CLOSING_COST_OPTIONS),
    sellerContribution: currency('Seller contribution').optional(),
    inspectionContingency: zod_1.z.enum(['yes', 'no'], {
        required_error: 'Select an inspection contingency option',
    }),
    inspectionDays: optionalDays,
    appraisalContingency: zod_1.z.enum(['yes', 'no'], {
        required_error: 'Select an appraisal option',
    }),
    // appraisalDays: optionalDays,
    hasAgent: zod_1.z.enum(['yes', 'no'], {
        required_error: "Let us know if you're working with an agent",
    }),
    agentName: zod_1.z.string().max(120).optional(),
    brokerageName: zod_1.z.string().max(120).optional(),
    commission: zod_1.z.string().max(20).optional(),
    paidBy: zod_1.z.enum(['buyer', 'seller']).optional(),
    personalPropertyIncluded: zod_1.z.string().max(2000).optional(),
    itemsToBeRemoved: zod_1.z.string().max(2000).optional(),
    titleCompany: zod_1.z.string().max(200).optional(),
    closingDate: zod_1.z
        .string()
        .optional()
        .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date'),
    possession: zod_1.z.enum(offer_constants_1.POSSESSION_OPTIONS).optional(),
    sellerPostClosingDays: optionalDays,
    additionalTerms: zod_1.z.string().max(3000).optional(),
    notesToSeller: zod_1.z.string().max(2000).optional(),
    notesToBuyer: zod_1.z.string().max(2000).optional(),
})
    .superRefine((data, ctx) => {
    var _a, _b, _c, _d, _e;
    if (data.financingType !== 'cash' && !((_a = data.financingTerms) === null || _a === void 0 ? void 0 : _a.trim())) {
        ctx.addIssue({
            path: ['financingTerms'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Describe the financing terms',
        });
    }
    if (data.financingType === 'other' && !((_b = data.otherFinancingType) === null || _b === void 0 ? void 0 : _b.trim())) {
        ctx.addIssue({
            path: ['otherFinancingType'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Please specify the financing type',
        });
    }
    if (data.closingCostOption === 'requested' &&
        (data.sellerContribution === undefined || data.sellerContribution <= 0)) {
        ctx.addIssue({
            path: ['sellerContribution'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Enter the requested seller contribution',
        });
    }
    if (data.inspectionContingency === 'yes' &&
        (data.inspectionDays === undefined || data.inspectionDays <= 0)) {
        ctx.addIssue({
            path: ['inspectionDays'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Enter the number of days for inspection',
        });
    }
    // if (
    //     data.appraisalContingency === 'yes' &&
    //     (data.appraisalDays === undefined || data.appraisalDays <= 0)
    // ) {
    //     ctx.addIssue({
    //         path: ['appraisalDays'],
    //         code: z.ZodIssueCode.custom,
    //         message: 'Enter the number of days for appraisal',
    //     });
    // }
    if (data.hasAgent === 'yes') {
        if (!((_c = data.agentName) === null || _c === void 0 ? void 0 : _c.trim())) {
            ctx.addIssue({
                path: ['agentName'],
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Agent name is required',
            });
        }
        if (!((_d = data.brokerageName) === null || _d === void 0 ? void 0 : _d.trim())) {
            ctx.addIssue({
                path: ['brokerageName'],
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Brokerage name is required',
            });
        }
        if (!((_e = data.commission) === null || _e === void 0 ? void 0 : _e.trim())) {
            ctx.addIssue({
                path: ['commission'],
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Enter a commission amount or percentage',
            });
        }
        if (!data.paidBy) {
            ctx.addIssue({
                path: ['paidBy'],
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Select who pays the commission',
            });
        }
    }
});
// POST /offers — buyer's initial offer
const createOfferValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        property: zod_1.z.string({ required_error: 'Property is required' }),
        terms: offerTermsSchema,
        supportingDocuments: zod_1.z.array(documentSchema).optional(),
    }),
});
// PATCH /offers/:id/counter — either party submits a counter
const counterOfferValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        terms: offerTermsSchema,
        supportingDocuments: zod_1.z.array(documentSchema).optional(),
    }),
});
// PATCH /offers/:id/accept | /reject | /withdraw — no body needed, just an optional note
const respondToOfferValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        note: zod_1.z.string().max(1000).optional(),
    }),
});
exports.offerValidation = {
    createOfferValidationSchema,
    counterOfferValidationSchema,
    respondToOfferValidationSchema,
};
