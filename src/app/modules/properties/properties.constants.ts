export const PROPERTY_TYPES = [
    'Residential',
    'Multi-Family',
    'Commercial',
    'Land',
] as const;

export const OWNERSHIP_TYPES = ['own', 'assignable'] as const;
export const HOA_OPTIONS = ['yes', 'no'] as const;
export const HOA_FREQUENCY = ['Monthly', 'Quarterly', 'Annually'] as const;
export const CLOSING_DATE_OPTIONS = ['ASAP', 'Specific'] as const;
export const USE_TYPE_OPTIONS = ['Medical', 'Others'] as const;

export const ROOF_OPTIONS = ['Shingle', 'Slate', 'Tile', 'Membrane', 'Other'] as const;
export const HEATING_OPTIONS = ['Gas', 'Electric', 'None', 'Other'] as const;
export const COOLING_OPTIONS = ['Central A/C', 'Window units', 'None', 'Other'] as const;
export const WATER_HEATING_OPTIONS = ['Public', 'Cistern', 'Well', 'None', 'Other'] as const;
export const WATER_OPTIONS = ['Public', 'Cistern', 'Well', 'None', 'Other'] as const;
export const SEWER_OPTIONS = ['Public', 'Septic', 'Aerobic', 'None', 'Other'] as const;
export const FOUNDATION_OPTIONS = ['Block', 'Poured', 'Slab', 'Stone', 'Other'] as const;
export const PARKING_OPTIONS = ['Driveway', 'On street', 'Carport', 'Assigned', 'None', 'Other'] as const;

export const PROPERTY_STATUS = [
    'draft',
    'pending_review',
    'active',
    'under_contract',
    'sold',
    'archived',
] as const;

export interface BasicInfoConfig {
    showParcelId: boolean;
    showBuyItNowPrice: boolean;
    showUtilities: boolean;
}

// Mirrors the frontend BASIC_INFO_CONFIG — keep in sync
export const BASIC_INFO_CONFIG: Record<
    (typeof PROPERTY_TYPES)[number],
    BasicInfoConfig
> = {
    Residential: { showParcelId: true, showBuyItNowPrice: false, showUtilities: false },
    'Multi-Family': { showParcelId: true, showBuyItNowPrice: false, showUtilities: false },
    Commercial: { showParcelId: true, showBuyItNowPrice: false, showUtilities: false },
    Land: { showParcelId: true, showBuyItNowPrice: false, showUtilities: true },
};

export const propertySearchableFields = [
    'streetAddress',
    'city',
    'state',
    'zipCode',
    'county',
];