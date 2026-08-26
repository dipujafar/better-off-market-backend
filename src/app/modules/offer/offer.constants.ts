export const FINANCING_TYPES = ['cash', 'hard_money', 'conventional', 'other'] as const;
export const CLOSING_COST_OPTIONS = ['none', 'requested'] as const;
export const POSSESSION_OPTIONS = ['at_closing', 'post_closing'] as const;
export const YES_NO = ['yes', 'no'] as const;
export const PAID_BY = ['buyer', 'seller'] as const;
export const MADE_BY = ['buyer', 'seller'] as const;

export const OFFER_STATUS = {
    pending: 'pending',
    countered: 'countered',
    accepted: 'accepted',
    rejected: 'rejected',
    withdrawn: 'withdrawn',
} as const;

export const OFFER_STATUS_OPTIONS = Object.values(OFFER_STATUS);

// statuses that mean the thread is closed — no further offers/counters allowed
export const CLOSED_OFFER_STATUSES: string[] = [
    OFFER_STATUS.accepted,
    OFFER_STATUS.rejected,
    OFFER_STATUS.withdrawn,
];