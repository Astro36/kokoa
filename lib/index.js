const Dictionary = require('./Dictionary')
const Kokoa = require('./Kokoa')

const k = new Kokoa();
k.load(new Dictionary({'서':'명사','설':'명사','설현':'명사', '노래':'명사', '부르': '동사'}))
console.log(k.run('설혀니 노랠 부른다'))