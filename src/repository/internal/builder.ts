import { InMemoryRepository } from "@yingyeothon/repository";
import { S3Repository } from "@yingyeothon/repository-s3";
import mem from "mem";

export const newInternalRepository = mem((prefix: string) =>
  process.env.NODE_ENV === "test"
    ? new InMemoryRepository()
    : new S3Repository({
        bucketName: process.env.BUCKET_NAME!,
        prefix
      })
);
