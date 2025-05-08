@echo off
REM Caminho absoluto da pasta do projeto
cd /d "C:\Users\Joao Victor\OneDrive\Área de Trabalho\TAB NUTRI"

REM Inicia o servidor Python em background
start "" cmd /k "python -m http.server 8000"

REM Aguarda 2 segundos para garantir que o servidor suba
timeout /t 2 >nul

REM Caminho padrão do Chrome. Se necessário, ajuste para o seu.
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

REM Abre o site no Chrome
start "" %CHROME_PATH% "http://localhost:8000"

REM Fim
