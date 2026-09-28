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

const processPropertyFiles = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const files = req.files as {
            photos?: Express.Multer.File[];
            documents?: Express.Multer.File[];
        };

        if (files?.photos?.length) {
            req.body.photos = await Promise.all(
                files.photos.map((file) =>
                    uploadToS3({
                        file,
                        fileName: `images/property/photos/${Date.now()}-${sanitizeFileName(file.originalname)}`,
                    }),
                ),
            );
        }

        if (files?.documents?.length) {
            req.body.documents = await Promise.all(
                files.documents.map(async (file) => {
                    const url = await uploadToS3({
                        file,
                        fileName: `documents/property/${Date.now()}-${sanitizeFileName(file.originalname)}`,
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

export default processPropertyFiles;