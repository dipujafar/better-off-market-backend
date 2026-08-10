import { Model, Types } from 'mongoose';

export interface IProperty {
    _id?: Types.ObjectId;
    seller: Types.ObjectId;
    status: string;

    propertyType: string;
    useType?: string;
    useTypeOther?: string;

    // Ownership
    ownership: 'own' | 'assignable';
    assignableContractFile?: string;

    // Basic Information
    streetAddress: string;
    state: string;
    city: string;
    zipCode: string;
    county: string;
    parcelIds?: string;
    listingPrice: number;
    buyItNowPrice?: number;
    arv?: number;
    marketingDescription: string;
    utilities?: string;

    // Property Specifications — dynamic, keyed by SpecField.name
    specifications: Record<string, string | number>;

    // Major Components & Ages
    roofMaterial?: string;
    roofMaterialOther?: string;
    roofAge?: number;
    heatingSystem?: string;
    heatingSystemOther?: string;
    heatingAge?: number;
    cooling?: string;
    coolingOther?: string;
    coolingAge?: number;
    waterHeating?: string;
    waterHeatingOther?: string;
    waterHeatingAge?: number;
    water?: string;
    waterOther?: string;
    sewer?: string;
    sewerOther?: string;
    foundation?: string;
    foundationOther?: string;
    otherUpdates?: string;

    // HOA
    hasHoa: 'yes' | 'no';
    hoaAmount?: number;
    hoaFrequency?: 'Monthly' | 'Quarterly' | 'Annually';
    hoaIncludes?: string;

    // Closing
    titleCompany?: string;
    closingDate: string;

    // Files (S3 URLs after upload middleware)
    photos: string[];
    documents?: string[];

    isDeleted: boolean;
}

export interface PropertyModel extends Model<IProperty> {
    IsPropertyExistId(id: string): Promise<IProperty>;
    GetPropertiesBySeller(sellerId: string): Promise<IProperty[]>;
}