import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/s3';

const sanitizeFileName = (name: string): string => {
    const lastDot = name.lastIndexOf('.');
    const base = lastDot > 0 ? name.slice(0, lastDot) : name;
    const ext = lastDot > 0 ? name.slice(lastDot) : '';

    const cleanBase = base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${cleanBase}${ext}`;
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const processOfferFiles = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const files = req.files as {
            supportingDocuments?: Express.Multer.File[];
        };

        if (files?.supportingDocuments?.length) {
            req.body.supportingDocuments = await Promise.all(
                files.supportingDocuments.map(async (file) => {
                    const url = await uploadToS3({
                        file,
                        fileName: `support-documents/offer/${Date.now()}-${sanitizeFileName(file.originalname)}`,
                    });

                    return {
                        name: file.originalname,
                        size: formatFileSize(file.size),
                        updated: new Date().toISOString(),
                        url,
                    };
                }),
            );
        }

        next();
    },
);

export default processOfferFiles;