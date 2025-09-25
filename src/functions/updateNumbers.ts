enum statusEnum {
  open = 'open',
  closed = 'close',
  connecting = 'connecting'
}

type ItemsToFetch = {
  instanceName: string,
  userId: string | undefined | null
}

type ItemsToUpdateDB = {
  token: string,
  remoteJid: string | null,
  status: string | null,
}

type ItemsToUpdateNumbers = {
  instanceName: string,
  token: string,
  userId: string | undefined | null
}

const fetchInstance = async ({ instanceName, userId }: ItemsToFetch) => {
  try {
    // Montar query params corretamente
    const url = `/api/evolution-api/fetch-instance?instanceName=${userId} : ${instanceName}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // DEBUG: verifique o formato real da resposta no console
    console.debug('fetchInstance - raw data:', data);

    // Se a API retornar um array usamos o primeiro elemento
    const item = Array.isArray(data) ? data[0] : data;

    if (!item) {
      console.warn('fetchInstance - nenhum item retornado');
      return { status: null, remoteJid: null };
    }

    // Tentativa de pegar tanto ownerJid quanto remoteJid (fallback)
    const status = (item.connectionStatus as statusEnum) ?? null;
    const remoteJid = item.ownerJid ?? item.remoteJid ?? null;

    // DEBUG: mostre os valores extraídos
    console.debug('fetchInstance - status:', status, 'remoteJid:', remoteJid);

    return { status, remoteJid };

  } catch (err: any) {
    console.error('Fetch Error:', err.message);
    return null;
  }
};

const updateDataBase = async ({ token, remoteJid, status }: ItemsToUpdateDB) => {
  try {
    // Garantir que passamos explicitamente null em vez de undefined
    const body = {
      token,
      status: status ?? null,
      remoteJid: remoteJid ?? null
    };

    console.debug('updateDataBase - body:', body);

    const update = await fetch('/api/db/updateNumber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!update.ok) {
      const errorData = await update.text();
      throw new Error(`Erro ao atualizar number: ${errorData}`);
    }

    return { response: 200 };

  } catch (err: any) {
    console.error('Update Error:', err.message);
    return { response: 400 };
  }
};

const updateNumbers = async ({ instanceName, token, userId }: ItemsToUpdateNumbers): Promise<void> => {
  try {
    const response = await fetchInstance({ instanceName, userId });

    if (!response) {
      throw new Error('Falha ao buscar dados da instância');
    }

    const { status, remoteJid } = response;

    // DEBUG: confirme valores antes de enviar para o DB
    console.debug('updateNumbers - status:', status, 'remoteJid:', remoteJid, 'token:', token);

    const updateResponse = await updateDataBase({ token, status, remoteJid });

    if (updateResponse.response === 400) {
      throw new Error('Erro ao atualizar number');
    }

    window.dispatchEvent(new CustomEvent('refreshNumbers'));

  } catch (err: any) {
    console.error('UpdateNumbers Error:', err.message);
  }
};

export default updateNumbers;
