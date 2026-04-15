import { useState, useEffect } from 'react';
import "./App.css";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [dadosrobo, setDadosrobo] = useState(null);
  const [conectado, setConectado] = useState(false);

  const adicionarLog = (mensagem) => {
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    const segundo = agora.getSeconds().toString().padStart(2, '0');
    const novoLog = `${hora}:${minuto}:${segundo} - ${mensagem}`;
    
    setLogs((prevLogs) => [...prevLogs, novoLog]);
  };

 useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/events");

    eventSource.onopen = () => {
      setConectado(true);
      adicionarLog("Conexão estabelecida com o Node-RED");
      setTimeout(() => {
        adicionarLog("Sistema pronto.");
      }, 1500); 
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDadosrobo(data);

        if (data.status_robo) {
          adicionarLog(data.status_robo);
        }
      } catch (e) {
        console.error("Erro no JSON:", e);
      }
    };

    eventSource.onerror = () => {
      setConectado(false);
      adicionarLog("Erro: Conexão perdida.");
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Projeto do Robô - SENAI</h1>
      <div className="linha"></div>

      <div className="layout">
        {/* Coluna Esquerda: Informações Técnicas */}
        <div className="left">
          <div className="card">
            <h3>Tempo de Ciclo (s)</h3>
            <p className="big">{dadosrobo?.tempo || "3.2"}<span>s</span></p>
          </div>
          
          <div className="card1">
            <h3>Status</h3>
            <div className="status-item">
              <span>Estável</span>
              <span className="dot green"></span>
            </div>
            <div className="status-item">
              <span>Atenção</span>
              <span className="dot yellow"></span>
            </div>
            <div className="status-item">
              <span>Falha</span>
              <span className="dot red"></span>
            </div>
          </div>

          <div className="card">
            <h3>Taxa de Acerto (%)</h3>
            <p className="big">{dadosrobo?.taxa || "98.4"}<span>%</span></p>
          </div>
        </div>

        {/* Coluna Central: Identificação do Robô */}
        <div className="center">
          <div className="robot-display">
            <div className="dot67">
              <span className="robot-title">Robô - FANUC</span>
              <p className="status-text" style={{ color: conectado ? '#00ff00' : '#ff0000' }}>
                {conectado ? "● LIVE" : "○ OFFLINE"}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Terminal de Mensagens */}
        <div className="right">
          <div className="log-container">
            <h4>LOGS DO ROBÔ</h4>
            <div className="log-content">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <p key={index} className="log-entry">{log}</p>
                ))
              ) : (
                <p className="log-entry">Aguardando conexão...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 