import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { IOfferTerms, OfferParty } from './offer.interface';
import { OFFER_STATUS, CLOSED_OFFER_STATUSES } from './offer.constants';
import { Offer } from './offer.models';
import { Property } from '../properties/properties.models';

// Buyer submits the first offer on a property
const createOffer = async (
  buyerId: string,
  propertyId: string,
  terms: IOfferTerms,
) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  if (property.seller.toString() === buyerId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You cannot make an offer on your own property',
    );
  }

  const existing = await Offer.findOne({
    property: propertyId,
    buyer: buyerId,
    status: { $nin: CLOSED_OFFER_STATUSES },
  });
  if (existing) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already have an active offer on this property',
    );
  }

  const result = await Offer.create({
    property: propertyId,
    buyer: buyerId,
    seller: property.seller,
    status: OFFER_STATUS.pending,
    currentRound: 1,
    lastActionBy: 'buyer',
    currentTerms: terms,
    history: [
      {
        ...terms,
        round: 1,
        madeBy: 'buyer',
        madeByUser: buyerId,
      },
    ],
  });

  await Property.findByIdAndUpdate(propertyId, { $inc: { totalOffers: 1 } });

  return result;
};

// Either party (whoever did NOT act last) submits a counter
const counterOffer = async (
  offerId: string,
  userId: string,
  terms: IOfferTerms,
) => {
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offer not found');
  }

  if (CLOSED_OFFER_STATUSES.includes(offer.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This offer is closed and can no longer be countered',
    );
  }

  const isBuyer = offer.buyer.toString() === userId;
  const isSeller = offer.seller.toString() === userId;

  if (!isBuyer && !isSeller) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a party to this offer',
    );
  }

  const actingAs: OfferParty = isBuyer ? 'buyer' : 'seller';

  // enforce turn-taking: you can't counter your own still-pending offer
  if (offer.lastActionBy === actingAs) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Waiting for the other party to respond before you can counter again',
    );
  }

  const nextRound = offer.currentRound + 1;

  const result = await Offer.findByIdAndUpdate(
    offerId,
    {
      status: OFFER_STATUS.countered,
      currentRound: nextRound,
      lastActionBy: actingAs,
      currentTerms: terms,
      $push: {
        history: {
          ...terms,
          round: nextRound,
          madeBy: actingAs,
          madeByUser: userId,
        },
      },
    },
    { new: true, runValidators: true },
  );

  return result;
};

const getAllOffers = async (query: Record<string, unknown>) => {
  const offerQuery = new QueryBuilder(
    Offer.find().populate('property').populate('buyer').populate('seller'),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await offerQuery.modelQuery;
  const meta = await offerQuery.countTotal();
  return { data, meta };
};

const getMyOffers = async (
  buyerId: string,
  query: Record<string, unknown>,
) => {
  const offerQuery = new QueryBuilder(
    Offer.find({ buyer: buyerId }).populate('property').populate('seller'),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await offerQuery.modelQuery;
  const meta = await offerQuery.countTotal();
  return { data, meta };
};

// offers I (seller) have received
const getReceivedOffers = async (
  sellerId: string,
  query: Record<string, unknown>,
) => {
  const offerQuery = new QueryBuilder(
    Offer.find({ seller: sellerId }).populate('property').populate('buyer'),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await offerQuery.modelQuery;
  const meta = await offerQuery.countTotal();
  return { data, meta };
};

const getOfferById = async (id: string) => {
  const result = await Offer.findById(id)
    .populate('property')
    .populate('buyer')
    .populate('seller');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offer not found');
  }
  return result;
};

// Edit — only allowed while the offer is still in its very first round
// and only by the buyer who created it (fixing a typo/mistake before anyone responds)
const updateOffer = async (
  offerId: string,
  userId: string,
  terms: Partial<IOfferTerms>,
) => {
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offer not found');
  }

  if (offer.buyer.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only the buyer who made this offer can edit it',
    );
  }

  if (offer.status !== OFFER_STATUS.pending || offer.currentRound !== 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This offer can no longer be edited — send a counter instead',
    );
  }

  const updatedTerms = { ...offer.currentTerms, ...terms };

  const result = await Offer.findByIdAndUpdate(
    offerId,
    {
      currentTerms: updatedTerms,
      'history.0': {
        ...updatedTerms,
        round: 1,
        madeBy: 'buyer',
        madeByUser: userId,
        createdAt: offer.history[0].createdAt,
      },
    },
    { new: true, runValidators: true },
  );

  return result;
};

const deleteOffer = async (offerId: string, userId: string) => {
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offer not found');
  }

  const isParty =
    offer.buyer.toString() === userId || offer.seller.toString() === userId;
  if (!isParty) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a party to this offer',
    );
  }

  const result = await Offer.findByIdAndUpdate(
    offerId,
    { isDeleted: true, status: OFFER_STATUS.withdrawn },
    { new: true },
  );

  return result;
};

export const offerService = {
  createOffer,
  counterOffer,
  getAllOffers,
  getMyOffers,
  getReceivedOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
};