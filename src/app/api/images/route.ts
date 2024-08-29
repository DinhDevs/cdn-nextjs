import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const CDN_URL = process.env.NEXT_PUBLIC_CLOUD_FRONT_URL!;

export async function DELETE(request: Request) {
  const { imageUrl } = await request.json();
  try {
    const bucketParams = {
      Bucket: Resource.CdnNextjsBucket.name,
      Key: imageUrl.replace(`${CDN_URL}/`, ""),
    };
    const command = new DeleteObjectCommand(bucketParams);
    const client = new S3Client();
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode === 204) {
      return Response.json({ status: "ok" });
    } else {
      return Response.json({ status: "error", details: response });
    }
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}

export async function GET() {
  try {
    const bucketParams = {
      Bucket: Resource.CdnNextjsBucket.name,
    };
    const command = new ListObjectsCommand(bucketParams);
    const client = new S3Client();
    const response = await client.send(command);
    const images = response.Contents?.map((object) => {
      return `${CDN_URL}/${object.Key}`;
    });
    return Response.json({ images });
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}

export async function POST(request: Request) {
  const requestBody = await request.json();

  try {
    const imageResult = await Promise.all(
      requestBody.files.map(async (file: any) => {
        const { filename, contentType } = file;
        const extension = contentType.split("/")[1];
        const imageFileName = `${uuidv4()}.${extension}`;
        const command = new PutObjectCommand({
          Key: imageFileName,
          Bucket: Resource.CdnNextjsBucket.name,
        });
        const url = await getSignedUrl(new S3Client({}), command, {
          expiresIn: 60,
        });
        return { url, imageUrl: `${CDN_URL}/${imageFileName}` };
      })
    );

    return Response.json(imageResult);
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}
