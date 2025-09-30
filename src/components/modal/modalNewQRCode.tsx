"use client";

import React, { useState, useEffect, useRef } from 'react';
import Loading from '../common/loading';

interface ModalQRCodeProps {
  name: string,
  token: string,
  userId: string|undefined|null
};

const ModalQRCode: React.FC<ModalQRCodeProps> = ({ name, token, userId }) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasExecuted = useRef(false);

  async function fetchQRCodeInstance() {
    if (hasExecuted.current) { // verifica se a função já roudou antes ou não
      return;
    }
    
    hasExecuted.current = true;
    
    try {
      // Criar instância no evolution-api
      const response = await fetch('/api/evolution-api/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "instanceName": `${userId} : ${name}`,
          "token": token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar instância');
      }

      const data = await response.json();

      setQrCodeData(data.qrcode.base64);

      if (data) {
        await fetch('/api/db/createNumber', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "userId": userId,
            "instanceName": `${data.instance.instanceName}`,
            "token": `${data.hash}`
          }),
        });
      };

    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message);
      hasExecuted.current = false; // Permite retentar em caso de erro
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  }

  useEffect(() => {
    if (userId && !hasExecuted.current) {
      fetchQRCodeInstance();
    }


    return () => {
    };
  }, [userId]);

  if (loading) {
    return <Loading />;
  }

  if (error && !qrCodeData) {
    return (
      <div>
        <p style={{ color: 'red' }}>Erro: {error}</p>
        <button 
          onClick={() => {
            hasExecuted.current = false;
            setError(null);
            setLoading(true);
            fetchQRCodeInstance();
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!qrCodeData) {
    return <p>Parece que há algum erro com o whatsapp! Nenhum dado de QR Code recebido.</p>;
  }

  return (
    <div>
      <h3>Leia o QR-Code abaixo para conectar o whatsapp:</h3>
      <img src={qrCodeData} alt="QR Code" className="filter-none" />
    </div>
  );
};

export default ModalQRCode;