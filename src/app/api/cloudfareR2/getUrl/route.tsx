import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const CLOUDFLARE_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
    region: "auto", // R2 exige 'auto'
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: Request) {
    const { fileName, size, contentType } = await request.json();
    const key = `uploads/${Date.now()}-${fileName}`;

    if (!fileName || !contentType) {
        return NextResponse.json(
            { error: "Nome do arquivo e tipo são obrigatórios" },
            { status: 400 }
        );
    }
    
    const sizeLimit = 80 * 1024 * 1024; // 80MB -> limite do wpp é 100
    if (size > sizeLimit) {
        return NextResponse.json("Arquivo excede o tamanho máximo de envio do whatsapp", { status: 400 });
    }
    
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    // Gera uma URL válida por 60 segundos
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({
        uploadUrl: signedUrl,
        publicUrl: `https://pub-591b40b9391c4064b2006f5e6e83c22e.r2.dev/${key}`,
    });
}