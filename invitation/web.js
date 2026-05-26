const express = require('express');
const path = require('path');

const app = express();
const port = 8001;

// 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일들을 제공하기 위한 미들웨어 설정
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로로 접근했을 때 index.ejs 파일을 렌더링
app.get('/', (req, res) => {
    res.render('game'); // 'views' 폴더 내의 index.ejs 파일을 렌더링
});

app.get('/account', (req, res) => {
    res.render('account');
});

app.get('/location', (req, res) => {
    res.render('location');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});