# Rasa chatbot nlp api

## Instalacija 
* ` sudo npm install https://github.com/icebergMNE/uhura-chatbot-nlp-api.git `
* kreirati u root direktorijumu sistema folder **nlpapi-data** i u njemu dva foldera **models** i **trainingdata**
* pokrenuti server u folderu gdje su modeli 
* ` python -m rasa_nlu.server --path /nlpapi-data/models/`

## Upotreba
sve metode vracaju promise
```javascript
const nlp = require('uhura-chatbot-nlp-api')
```
### Treniranje
Proslijediti niz stories i id bota(user-a)
```javascript
nlp.train(stories,'5acc845d2005f77849029af2')
```

### Pretraga intenta
Proslijediti pitanje i id bota(user-a)
```javascript
nlp.question('cao','5acc845d2005f77849029af2')
```

### Brisanje bota
Proslijediti id bota(user-a)
```javascript
nlp.remove('5acc845d2005f77849029af2')
```