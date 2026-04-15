import express, { json } from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(json());

// Armazena as conexões ativas dos clientes Next.js
let clients = [];

// Endpoint para o Node-RED enviar os dados processados
app.post('/update-robot', (req, res) => {
    const newData = req.body;
    
    // Envia os dados para todos os clientes conectados via SSE
    clients.forEach(client => {
        console.log(`log node-red: ${JSON.stringify(newData)}`)
        return client.response.write(`data: ${JSON.stringify(newData)}\n\n`);
    });
    
    res.status(200).send({ message: "Dados replicados para o dashboard" });
});

// Endpoint SSE para o Web App Next.js
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Identifica e armazena a conexão
    const clientId = Date.now();
    const newClient = { id: clientId, response: res };
    clients.push(newClient);

    // Remove a conexão quando o cliente fecha a página
    req.on('close', () => {
        clients = clients.filter(client => client.id !== clientId);
    });
});

app.listen(3001, () => console.log('Servidor de Eventos rodando na porta 3001'));