import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/s3';

const processPropertyFiles = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const files = req.files as {
            photos?: Express.Multer.File[];
            documents?: Express.Multer.File[];
            assignableContractFile?: Express.Multer.File[];
        };

        if (files?.photos?.length) {
            req.body.photos = await Promise.all(
                files.photos.map((file) =>
                    uploadToS3({
                        file,
                        fileName: `images/property/photos/${Math.floor(100000 + Math.random() * 900000)}`,
                    }),
                ),
            );
        }

        if (files?.documents?.length) {
            req.body.documents = await Promise.all(
                files.documents.map((file) =>
                    uploadToS3({
                        file,
                        fileName: `documents/property/${Math.floor(100000 + Math.random() * 900000)}`,
                    }),
                ),
            );
        }

        if (files?.assignableContractFile?.[0]) {
            req.body.assignableContractFile = await uploadToS3({
                file: files.assignableContractFile[0],
                fileName: `documents/property/contract/${Math.floor(100000 + Math.random() * 900000)}`,
            });
        }

        next();
    },
);

export default processPropertyFiles;