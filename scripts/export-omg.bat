@echo off
:: Exporta dados do omg.lol para a pasta omg-export\
:: Requer Windows 10/11 (curl já incluído).
:: Como usar: edite a linha abaixo com sua API key e dê duplo clique.

set OMG_API_KEY=COLE_SUA_API_KEY_AQUI
set OMG_ADDRESS=tucas

echo Exportando dados do omg.lol para omg-export\ ...
mkdir omg-export 2>nul
mkdir omg-export\pastes 2>nul

set H=Authorization: Bearer %OMG_API_KEY%
set B=https://api.omg.lol/address/%OMG_ADDRESS%

echo [1/9] homepage...
curl -s -H "%H%" %B%/web > omg-export\web.json

echo [2/9] pastes...
curl -s -H "%H%" %B%/pastebin > omg-export\pastebin.json

echo [3/9] purls...
curl -s -H "%H%" %B%/purls > omg-export\purls.json

echo [4/9] now page...
curl -s -H "%H%" %B%/now > omg-export\now.json

echo [5/9] statuslog...
curl -s -H "%H%" %B%/statuses > omg-export\statuses.json

echo [6/9] weblog...
curl -s -H "%H%" %B%/weblog/entries > omg-export\weblog.json

echo [7/9] pics...
curl -s -H "%H%" %B%/pics > omg-export\pics.json

echo [8/9] dns...
curl -s -H "%H%" https://api.omg.lol/account/%OMG_ADDRESS%/dns > omg-export\dns.json

echo [9/9] email + info...
curl -s -H "%H%" %B%/email > omg-export\email.json
curl -s -H "%H%" %B%/info > omg-export\info.json

echo.
echo Pronto! Arquivos salvos em omg-export\
echo Verifique os .json — se aparecer "Host not in allowlist", o IP foi bloqueado.
pause
