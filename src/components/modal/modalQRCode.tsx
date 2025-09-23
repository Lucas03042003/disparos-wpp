"use client";

import React, { useState } from 'react';
import Loading from '../common/loading';
import { authClient } from "@/lib/auth-client";
import { v4 as uuidv4 } from 'uuid';

const ModalQRCode = ({name}:{name: string}) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = uuidv4().toUpperCase();

  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  async function fetchQRCodeInstance() {
    try {
      // Criar instância no evolution-api
      const response = await fetch('/api/evolution-api/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "instanceName":`${userId} : ${name}`,
            "token": token
          }
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar instância');
      };

      const data = await response.json();

      setQrCodeData(data.qrcode.base64);
      
      if (data) {
        await fetch('/api/db/createNumber', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              "userId":userId, 
              "instanceName":`${data.instance.instanceName}`,
              "token":`${data.hash}`
            }
          ),
        });

      };

    } catch (err: any) {
      setError(err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  }

  if (session) { 
    fetchQRCodeInstance();
  }

  if (loading) {
    return <Loading></Loading>;
  }

  if (error && !qrCodeData) {
    return <p style={{ color: 'red' }}>Erro: {error}</p>;
  }

  if (!qrCodeData) {
      return <p>Parece que há algum erro com o whatsapp! Nenhum dado de QR Code recebido.</p>;
  }

  // Se qrCodeData contém a string que você quer exibir
  return (
      <div>
        <h3>Leia o QR-Code abaixo para conectar o whatsapp:</h3>
        {/* 'qrCodeData' é a base64 de uma imagem */}
        <img src={qrCodeData} alt="QR Code" className="filter-none" />
      </div>
  );
}

export default ModalQRCode;