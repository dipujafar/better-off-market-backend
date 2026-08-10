import { Schema, model } from 'mongoose';
import { IProperty, PropertyModel } from './properties.interface';
import {
  PROPERTY_TYPES,
  OWNERSHIP_TYPES,
  HOA_OPTIONS,
  HOA_FREQUENCY,
  PROPERTY_STATUS,
} from './properties.constants';

const propertySchema: Schema<IProperty> = new Schema(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: PROPERTY_STATUS,
      default: 'draft',
    },

    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true,
    },
    useType: { type: String, default: null },
    useTypeOther: { type: String, default: null },

    // Ownership
    ownership: {
      type: String,
      enum: OWNERSHIP_TYPES,
      required: true,
    },
    assignableContractFile: { type: String, default: null },

    // Basic Information
    streetAddress: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    county: { type: String, required: true },
    parcelIds: { type: String, default: null },
    listingPrice: { type: Number, required: true },
    buyItNowPrice: { type: Number, default: null },
    arv: { type: Number, default: null },
    marketingDescription: { type: String, required: true, maxlength: 3000 },
    utilities: { type: String, default: null },

    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Major Components & Ages
    roofMaterial: { type: String, default: null },
    roofMaterialOther: { type: String, default: null },
    roofAge: { type: Number, default: null },
    heatingSystem: { type: String, default: null },
    heatingSystemOther: { type: String, default: null },
    heatingAge: { type: Number, default: null },
    cooling: { type: String, default: null },
    coolingOther: { type: String, default: null },
    coolingAge: { type: Number, default: null },
    waterHeating: { type: String, default: null },
    waterHeatingOther: { type: String, default: null },
    waterHeatingAge: { type: Number, default: null },
    water: { type: String, default: null },
    waterOther: { type: String, default: null },
    sewer: { type: String, default: null },
    sewerOther: { type: String, default: null },
    foundation: { type: String, default: null },
    foundationOther: { type: String, default: null },
    otherUpdates: { type: String, default: null },

    // HOA
    hasHoa: {
      type: String,
      enum: HOA_OPTIONS,
      default: 'no',
    },
    hoaAmount: { type: Number, default: null },
    hoaFrequency: {
      type: String,
      enum: HOA_FREQUENCY,
      default: null,
    },
    hoaIncludes: { type: String, default: null },

    // Closing
    titleCompany: { type: String, default: null },
    closingDate: { type: String, required: true },

    // Files
    photos: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 5,
        message: 'Minimum 5 high-res photos required',
      },
    },
    documents: {
      type: [String],
      default: [],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

propertySchema.statics.IsPropertyExistId = async function (id: string) {
  return await Property.findById(id);
};

propertySchema.statics.GetPropertiesBySeller = async function (
  sellerId: string,
) {
  return await Property.find({ seller: sellerId });
};

propertySchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

propertySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
  next();
});

export const Property = model<IProperty, PropertyModel>(
  'Property',
  propertySchema,
);