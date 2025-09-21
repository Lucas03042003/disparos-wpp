"use client";

import React, { useState } from 'react';
import Loading from '../common/loading';

const ModalQRCode = ({name}:{name: string}) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchQRCodeInstance() {
    try {
      
      const response = await fetch('/api/evolution-api/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {"instanceName":name}
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar instância');
      }

      const data = await response.json();

      setQrCodeData(data.qrcode.base64);
      console.log(data)
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  }

  fetchQRCodeInstance();

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